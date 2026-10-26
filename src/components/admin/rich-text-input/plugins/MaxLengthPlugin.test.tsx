import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MaxLengthPlugin } from './MaxLengthPlugin';

const mockRegisterNodeTransform = jest.fn();
const mockRegisterUpdateListener = jest.fn();
const mockRegisterCommand = jest.fn();
const mockEditor = {
    registerNodeTransform: mockRegisterNodeTransform,
    registerUpdateListener: mockRegisterUpdateListener,
    registerCommand: mockRegisterCommand,
    getEditorState: jest.fn(),
    update: jest.fn((callback: () => void) => callback()),
};

jest.mock('@lexical/react/LexicalComposerContext', () => ({
    useLexicalComposerContext: () => [mockEditor],
}));

const mockGetRoot = jest.fn();
const mockGetSelection = jest.fn();

jest.mock('lexical', () => ({
    $getRoot: () => mockGetRoot(),
    $getSelection: () => mockGetSelection(),
    $isRangeSelection: jest.fn(() => true),
    RootNode: class RootNode {},
    PASTE_COMMAND: 'PASTE_COMMAND',
    COMMAND_PRIORITY_HIGH: 3,
}));

jest.mock('@lexical/selection', () => ({
    trimTextContentFromAnchor: jest.fn(),
    $trimTextContentFromAnchor: jest.fn(),
}));

describe('MaxLengthPlugin', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockRegisterNodeTransform.mockReturnValue(jest.fn());
        mockRegisterUpdateListener.mockReturnValue(jest.fn());
        mockRegisterCommand.mockReturnValue(jest.fn());
        mockGetRoot.mockReturnValue({
            getTextContent: jest.fn(() => 'current text'),
        });
        mockEditor.getEditorState.mockReturnValue({
            read: jest.fn((callback) => callback()),
        });
        mockEditor.update = jest.fn((callback) => callback());
        mockGetSelection.mockReturnValue({
            isCollapsed: jest.fn(() => true),
            anchor: {},
            getTextContent: jest.fn(() => ''),
            insertText: jest.fn(),
        });
    });

    it('renders without crashing', () => {
        const { container } = render(<MaxLengthPlugin maxLength={100} />);
        expect(container).toBeEmptyDOMElement();
    });

    it('registers node transform on mount', () => {
        render(<MaxLengthPlugin maxLength={100} />);
        expect(mockRegisterNodeTransform).toHaveBeenCalledWith(expect.any(Function), expect.any(Function));
        expect(mockRegisterCommand).toHaveBeenCalledWith('PASTE_COMMAND', expect.any(Function), 3);
    });

    it('calls onLengthChange with current text length', () => {
        const onLengthChange = jest.fn();

        render(<MaxLengthPlugin maxLength={100} onLengthChange={onLengthChange} />);

        const updateListenerCallback = mockRegisterUpdateListener.mock.calls[0][0];

        const mockEditorState = {
            read: jest.fn((callback) => callback()),
        };

        mockGetRoot.mockReturnValue({
            getTextContent: jest.fn(() => 'test content'),
        });

        updateListenerCallback({ editorState: mockEditorState });

        expect(onLengthChange).toHaveBeenCalledWith(12);
    });

    it.each([
        [false, 7],
        [true, 5],
    ])('counts trailing whitespace only when ignoreTrailingWhitespace is %s', (ignoreTrailingWhitespace, expected) => {
        const onLengthChange = jest.fn();

        render(
            <MaxLengthPlugin
                maxLength={100}
                onLengthChange={onLengthChange}
                ignoreTrailingWhitespace={ignoreTrailingWhitespace}
            />,
        );

        mockGetRoot.mockReturnValue({
            getTextContent: jest.fn(() => 'Hello  '),
        });

        const updateListenerCallback = mockRegisterUpdateListener.mock.calls[0][0];
        updateListenerCallback({ editorState: { read: jest.fn((callback) => callback()) } });

        expect(onLengthChange).toHaveBeenCalledWith(expected);
    });

    it('does not trim text when under maxLength', () => {
        const { trimTextContentFromAnchor } = require('@lexical/selection');
        const { $isRangeSelection } = require('lexical');

        mockGetSelection.mockReturnValue({
            isCollapsed: jest.fn(() => true),
            anchor: {},
        });
        $isRangeSelection.mockReturnValue(true);

        render(<MaxLengthPlugin maxLength={100} />);

        const transformCallback = mockRegisterNodeTransform.mock.calls[0][1];
        const mockRootNode = {
            getTextContent: jest.fn(() => 'short'),
        };

        transformCallback(mockRootNode);

        expect(trimTextContentFromAnchor).not.toHaveBeenCalled();
    });

    it('trims text when exceeds maxLength (normal typing)', () => {
        const { trimTextContentFromAnchor } = require('@lexical/selection');
        const { $isRangeSelection } = require('lexical');

        const mockAnchor = {};
        mockGetSelection.mockReturnValue({
            isCollapsed: jest.fn(() => true),
            anchor: mockAnchor,
        });
        $isRangeSelection.mockReturnValue(true);

        mockGetRoot.mockReturnValue({
            getTextContent: jest.fn(() => 'previous text'),
        });

        render(<MaxLengthPlugin maxLength={10} />);

        const transformCallback = mockRegisterNodeTransform.mock.calls[0][1];
        const mockRootNode = {
            getTextContent: jest.fn(() => 'this is a very long text that exceeds maxLength'),
        };

        transformCallback(mockRootNode);

        expect(trimTextContentFromAnchor).toHaveBeenCalledWith(mockEditor, mockAnchor, 37);
    });

    it('does not register node transform or paste listeners when max length enforcement is disabled', () => {
        const { trimTextContentFromAnchor } = require('@lexical/selection');

        render(<MaxLengthPlugin maxLength={10} enforceMaxLength={false} />);

        expect(mockRegisterNodeTransform).not.toHaveBeenCalled();
        expect(mockRegisterCommand).not.toHaveBeenCalled();
        expect(trimTextContentFromAnchor).not.toHaveBeenCalled();
    });

    it('handles selection that is not collapsed', () => {
        const { $isRangeSelection } = require('lexical');
        const { trimTextContentFromAnchor } = require('@lexical/selection');

        mockGetSelection.mockReturnValue({
            isCollapsed: jest.fn(() => false),
        });
        $isRangeSelection.mockReturnValue(true);

        render(<MaxLengthPlugin maxLength={100} />);

        const transformCallback = mockRegisterNodeTransform.mock.calls[0][1];
        const mockRootNode = {
            getTextContent: jest.fn(() => 'test'),
        };

        transformCallback(mockRootNode);

        expect(trimTextContentFromAnchor).not.toHaveBeenCalled();
    });

    it('handles non-range selection', () => {
        const { $isRangeSelection } = require('lexical');
        const { trimTextContentFromAnchor } = require('@lexical/selection');

        mockGetSelection.mockReturnValue({});
        $isRangeSelection.mockReturnValue(false);

        render(<MaxLengthPlugin maxLength={100} />);

        const transformCallback = mockRegisterNodeTransform.mock.calls[0][1];
        const mockRootNode = {
            getTextContent: jest.fn(() => 'test'),
        };

        transformCallback(mockRootNode);

        expect(trimTextContentFromAnchor).not.toHaveBeenCalled();
    });

    it('unregisters transforms and listeners on unmount', () => {
        const unregisterTransform = jest.fn();
        const unregisterUpdate = jest.fn();
        const unregisterCommand = jest.fn();

        mockRegisterNodeTransform.mockReturnValue(unregisterTransform);
        mockRegisterUpdateListener.mockReturnValue(unregisterUpdate);
        mockRegisterCommand.mockReturnValue(unregisterCommand);

        const { unmount } = render(<MaxLengthPlugin maxLength={100} />);

        expect(unregisterTransform).not.toHaveBeenCalled();
        expect(unregisterUpdate).not.toHaveBeenCalled();
        expect(unregisterCommand).not.toHaveBeenCalled();

        unmount();

        expect(unregisterTransform).toHaveBeenCalled();
        expect(unregisterUpdate).toHaveBeenCalled();
        expect(unregisterCommand).toHaveBeenCalled();
    });

    describe('Paste Interception Logic', () => {
        it('intercepts paste and slices text when it exceeds maxLength', () => {
            const { $isRangeSelection } = require('lexical');
            $isRangeSelection.mockReturnValue(true);

            render(<MaxLengthPlugin maxLength={10} />);
            const pasteCallback = mockRegisterCommand.mock.calls[0][1];

            const mockInsertText = jest.fn();
            mockGetSelection.mockReturnValue({
                isCollapsed: jest.fn(() => true),
                getTextContent: jest.fn(() => ''),
                insertText: mockInsertText,
            });
            mockGetRoot.mockReturnValue({
                getTextContent: jest.fn(() => '12345'),
            });

            const preventDefault = jest.fn();
            const mockEvent = {
                preventDefault,
                clipboardData: {
                    getData: jest.fn(() => '67890EXTRA_TEXT'),
                },
            };

            const handled = pasteCallback(mockEvent);

            expect(handled).toBe(true);
            expect(preventDefault).toHaveBeenCalled();
            expect(mockInsertText).toHaveBeenCalledWith('67890');
        });

        it('allows default Lexical paste if pasted text fits perfectly within maxLength', () => {
            const { $isRangeSelection } = require('lexical');
            $isRangeSelection.mockReturnValue(true);

            render(<MaxLengthPlugin maxLength={10} />);
            const pasteCallback = mockRegisterCommand.mock.calls[0][1];

            mockGetSelection.mockReturnValue({
                isCollapsed: jest.fn(() => true),
                getTextContent: jest.fn(() => ''),
            });
            mockGetRoot.mockReturnValue({
                getTextContent: jest.fn(() => '12345'),
            });

            const preventDefault = jest.fn();
            const mockEvent = {
                preventDefault,
                clipboardData: {
                    getData: jest.fn(() => '678'),
                },
            };

            const handled = pasteCallback(mockEvent);

            expect(handled).toBe(false);
            expect(preventDefault).not.toHaveBeenCalled();
        });
    });
});
