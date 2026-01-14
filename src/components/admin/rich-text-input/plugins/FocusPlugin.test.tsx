import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { FocusPlugin } from './FocusPlugin';

// Mock Lexical modules
const mockRegisterCommand = jest.fn();
const mockEditor = {
    registerCommand: mockRegisterCommand,
};

jest.mock('@lexical/react/LexicalComposerContext', () => ({
    useLexicalComposerContext: () => [mockEditor],
}));

jest.mock('lexical', () => ({
    BLUR_COMMAND: 'BLUR_COMMAND',
    FOCUS_COMMAND: 'FOCUS_COMMAND',
    COMMAND_PRIORITY_LOW: 0,
}));

describe('FocusPlugin', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Default return value for registerCommand
        mockRegisterCommand.mockReturnValue(jest.fn());
    });

    it('renders without crashing', () => {
        const { container } = render(<FocusPlugin />);
        expect(container).toBeEmptyDOMElement();
    });

    it('registers FOCUS_COMMAND listener on mount', () => {
        render(<FocusPlugin />);

        const calls = mockRegisterCommand.mock.calls;
        const focusCall = calls.find((call) => call[0] === 'FOCUS_COMMAND');

        expect(focusCall).toBeDefined();
        expect(focusCall[1]).toEqual(expect.any(Function));
        expect(focusCall[2]).toBe(0); // COMMAND_PRIORITY_LOW
    });

    it('registers BLUR_COMMAND listener on mount', () => {
        render(<FocusPlugin />);

        const calls = mockRegisterCommand.mock.calls;
        const blurCall = calls.find((call) => call[0] === 'BLUR_COMMAND');

        expect(blurCall).toBeDefined();
        expect(blurCall[1]).toEqual(expect.any(Function));
        expect(blurCall[2]).toBe(0); // COMMAND_PRIORITY_LOW
    });

    it('calls onFocus when FOCUS_COMMAND is dispatched', () => {
        const onFocus = jest.fn();
        render(<FocusPlugin onFocus={onFocus} />);

        const calls = mockRegisterCommand.mock.calls;
        const focusCall = calls.find((call) => call[0] === 'FOCUS_COMMAND');
        const focusHandler = focusCall[1];

        const result = focusHandler();

        expect(onFocus).toHaveBeenCalled();
        expect(result).toBe(false);
    });

    it('calls onBlur when BLUR_COMMAND is dispatched', () => {
        const onBlur = jest.fn();
        render(<FocusPlugin onBlur={onBlur} />);

        const calls = mockRegisterCommand.mock.calls;
        const blurCall = calls.find((call) => call[0] === 'BLUR_COMMAND');
        const blurHandler = blurCall[1];

        const result = blurHandler();

        expect(onBlur).toHaveBeenCalled();
        expect(result).toBe(false);
    });

    it('calls onFocusChange(true) on focus', () => {
        const onFocusChange = jest.fn();
        render(<FocusPlugin onFocusChange={onFocusChange} />);

        const calls = mockRegisterCommand.mock.calls;
        const focusCall = calls.find((call) => call[0] === 'FOCUS_COMMAND');
        const focusHandler = focusCall[1];

        focusHandler();

        expect(onFocusChange).toHaveBeenCalledWith(true);
    });

    it('calls onFocusChange(false) on blur', () => {
        const onFocusChange = jest.fn();
        render(<FocusPlugin onFocusChange={onFocusChange} />);

        const calls = mockRegisterCommand.mock.calls;
        const blurCall = calls.find((call) => call[0] === 'BLUR_COMMAND');
        const blurHandler = blurCall[1];

        blurHandler();

        expect(onFocusChange).toHaveBeenCalledWith(false);
    });

    it('calls both onFocus and onFocusChange on focus', () => {
        const onFocus = jest.fn();
        const onFocusChange = jest.fn();
        render(<FocusPlugin onFocus={onFocus} onFocusChange={onFocusChange} />);

        const calls = mockRegisterCommand.mock.calls;
        const focusCall = calls.find((call) => call[0] === 'FOCUS_COMMAND');
        const focusHandler = focusCall[1];

        focusHandler();

        expect(onFocus).toHaveBeenCalled();
        expect(onFocusChange).toHaveBeenCalledWith(true);
    });

    it('calls both onBlur and onFocusChange on blur', () => {
        const onBlur = jest.fn();
        const onFocusChange = jest.fn();
        render(<FocusPlugin onBlur={onBlur} onFocusChange={onFocusChange} />);

        const calls = mockRegisterCommand.mock.calls;
        const blurCall = calls.find((call) => call[0] === 'BLUR_COMMAND');
        const blurHandler = blurCall[1];

        blurHandler();

        expect(onBlur).toHaveBeenCalled();
        expect(onFocusChange).toHaveBeenCalledWith(false);
    });

    it('handles missing optional callbacks gracefully', () => {
        render(<FocusPlugin />);

        const calls = mockRegisterCommand.mock.calls;
        const focusCall = calls.find((call) => call[0] === 'FOCUS_COMMAND');
        const blurCall = calls.find((call) => call[0] === 'BLUR_COMMAND');

        // Should not throw when callbacks are undefined
        expect(() => focusCall[1]()).not.toThrow();
        expect(() => blurCall[1]()).not.toThrow();
    });

    it('unregisters commands on unmount', () => {
        const unregisterFocus = jest.fn();
        const unregisterBlur = jest.fn();

        mockRegisterCommand.mockReturnValueOnce(unregisterFocus).mockReturnValueOnce(unregisterBlur);

        const { unmount } = render(<FocusPlugin />);

        expect(unregisterFocus).not.toHaveBeenCalled();
        expect(unregisterBlur).not.toHaveBeenCalled();

        unmount();

        expect(unregisterFocus).toHaveBeenCalled();
        expect(unregisterBlur).toHaveBeenCalled();
    });
});
