import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { EnterKeyPlugin } from './EnterKeyPlugin';
import { KEY_ENTER_COMMAND } from 'lexical';

const mockRegisterCommand = jest.fn();
const mockEditor = {
    registerCommand: mockRegisterCommand,
};

jest.mock('@lexical/react/LexicalComposerContext', () => ({
    useLexicalComposerContext: () => [mockEditor],
}));

jest.mock('lexical', () => ({
    KEY_ENTER_COMMAND: 'KEY_ENTER_COMMAND',
    COMMAND_PRIORITY_HIGH: 1,
    $getSelection: jest.fn(),
    $isRangeSelection: jest.fn(),
    LineBreakNode: class LineBreakNode {},
}));

describe('EnterKeyPlugin', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockRegisterCommand.mockReturnValue(jest.fn());
    });

    it('renders without crashing', () => {
        const { container } = render(<EnterKeyPlugin />);
        expect(container).toBeEmptyDOMElement();
    });

    it('registers KEY_ENTER_COMMAND on mount', () => {
        render(<EnterKeyPlugin />);

        expect(mockRegisterCommand).toHaveBeenCalledWith(KEY_ENTER_COMMAND, expect.any(Function), expect.any(Number));
    });

    it('unregisters command on unmount', () => {
        const unregister = jest.fn();
        mockRegisterCommand.mockReturnValue(unregister);

        const { unmount } = render(<EnterKeyPlugin />);

        expect(unregister).not.toHaveBeenCalled();

        unmount();

        expect(unregister).toHaveBeenCalled();
    });

    describe('Enter key handling', () => {
        it('returns false when event is null', () => {
            render(<EnterKeyPlugin />);

            const handler = mockRegisterCommand.mock.calls[0][1];
            const mockSelection = { insertNodes: jest.fn() };

            jest.spyOn(require('lexical'), '$getSelection').mockReturnValue(mockSelection);
            jest.spyOn(require('lexical'), '$isRangeSelection').mockReturnValue(true);

            const result = handler(null);

            expect(result).toBe(false);
        });

        it('returns false when Shift+Enter is pressed', () => {
            render(<EnterKeyPlugin />);

            const handler = mockRegisterCommand.mock.calls[0][1];
            const mockEvent = {
                shiftKey: true,
                preventDefault: jest.fn(),
            };
            const mockSelection = { insertNodes: jest.fn() };

            jest.spyOn(require('lexical'), '$getSelection').mockReturnValue(mockSelection);
            jest.spyOn(require('lexical'), '$isRangeSelection').mockReturnValue(true);

            const result = handler(mockEvent);

            expect(result).toBe(false);
            expect(mockEvent.preventDefault).not.toHaveBeenCalled();
        });

        it('prevents default and inserts line break when Enter is pressed', () => {
            render(<EnterKeyPlugin />);

            const handler = mockRegisterCommand.mock.calls[0][1];
            const mockEvent = {
                shiftKey: false,
                preventDefault: jest.fn(),
            };
            const mockSelection = { insertNodes: jest.fn() };

            jest.spyOn(require('lexical'), '$getSelection').mockReturnValue(mockSelection);
            jest.spyOn(require('lexical'), '$isRangeSelection').mockReturnValue(true);

            const result = handler(mockEvent);

            expect(result).toBe(true);
            expect(mockEvent.preventDefault).toHaveBeenCalled();
            expect(mockSelection.insertNodes).toHaveBeenCalled();
        });

        it('returns false when selection is not a range selection', () => {
            render(<EnterKeyPlugin />);

            const handler = mockRegisterCommand.mock.calls[0][1];
            const mockEvent = {
                shiftKey: false,
                preventDefault: jest.fn(),
            };

            jest.spyOn(require('lexical'), '$getSelection').mockReturnValue({});
            jest.spyOn(require('lexical'), '$isRangeSelection').mockReturnValue(false);

            const result = handler(mockEvent);

            expect(result).toBe(false);
            expect(mockEvent.preventDefault).not.toHaveBeenCalled();
        });
    });
});
