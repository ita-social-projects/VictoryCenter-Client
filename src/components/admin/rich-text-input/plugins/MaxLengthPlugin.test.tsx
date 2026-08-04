import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MaxLengthPlugin } from './MaxLengthPlugin';

const mockRegisterNodeTransform = jest.fn();
const mockRegisterUpdateListener = jest.fn();
const mockEditor = {
    registerNodeTransform: mockRegisterNodeTransform,
    registerUpdateListener: mockRegisterUpdateListener,
    getEditorState: jest.fn(),
};

jest.mock('@lexical/react/LexicalComposerContext', () => ({
    useLexicalComposerContext: () => [mockEditor],
}));

const mockGetRoot = jest.fn();

jest.mock('lexical', () => ({
    $getRoot: () => mockGetRoot(),
    $getSelection: jest.fn(),
    $isRangeSelection: jest.fn(() => true),
    RootNode: class RootNode {},
}));

jest.mock('@lexical/selection', () => ({
    trimTextContentFromAnchor: jest.fn(),
}));

describe('MaxLengthPlugin', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockRegisterNodeTransform.mockReturnValue(jest.fn());
        mockRegisterUpdateListener.mockReturnValue(jest.fn());
        mockGetRoot.mockReturnValue({
            getTextContent: jest.fn(() => 'current text'),
        });
        mockEditor.getEditorState.mockReturnValue({
            read: jest.fn((callback) => callback()),
        });
    });

    it('renders without crashing', () => {
        const { container } = render(<MaxLengthPlugin maxLength={100} />);
        expect(container).toBeEmptyDOMElement();
    });

    it('registers node transform on mount', () => {
        render(<MaxLengthPlugin maxLength={100} />);
        expect(mockRegisterNodeTransform).toHaveBeenCalledWith(expect.any(Function), expect.any(Function));
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

    it('does not trim text when under maxLength', () => {
        const { trimTextContentFromAnchor } = require('@lexical/selection');
        const { $getSelection, $isRangeSelection } = require('lexical');

        const mockSelection = {
            isCollapsed: jest.fn(() => true),
            anchor: {},
        };
        $getSelection.mockReturnValue(mockSelection);
        $isRangeSelection.mockReturnValue(true);

        render(<MaxLengthPlugin maxLength={100} />);

        const transformCallback = mockRegisterNodeTransform.mock.calls[0][1];
        const mockRootNode = {
            getTextContent: jest.fn(() => 'short'),
        };

        transformCallback(mockRootNode);

        expect(trimTextContentFromAnchor).not.toHaveBeenCalled();
    });

    it('trims text when exceeds maxLength', () => {
        const { trimTextContentFromAnchor } = require('@lexical/selection');
        const { $getSelection, $isRangeSelection } = require('lexical');

        const mockSelection = {
            isCollapsed: jest.fn(() => true),
            anchor: {},
        };
        $getSelection.mockReturnValue(mockSelection);
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

        expect(trimTextContentFromAnchor).toHaveBeenCalledWith(mockEditor, mockSelection.anchor, 37);
    });

    it('handles selection that is not collapsed', () => {
        const { $getSelection, $isRangeSelection } = require('lexical');
        const { trimTextContentFromAnchor } = require('@lexical/selection');

        const mockSelection = {
            isCollapsed: jest.fn(() => false),
        };
        $getSelection.mockReturnValue(mockSelection);
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
        const { $getSelection, $isRangeSelection } = require('lexical');
        const { trimTextContentFromAnchor } = require('@lexical/selection');

        $getSelection.mockReturnValue({});
        $isRangeSelection.mockReturnValue(false);

        render(<MaxLengthPlugin maxLength={100} />);

        const transformCallback = mockRegisterNodeTransform.mock.calls[0][1];
        const mockRootNode = {
            getTextContent: jest.fn(() => 'test'),
        };

        transformCallback(mockRootNode);

        expect(trimTextContentFromAnchor).not.toHaveBeenCalled();
    });

    it('unregisters transforms on unmount', () => {
        const unregisterTransform = jest.fn();
        const unregisterUpdate = jest.fn();

        mockRegisterNodeTransform.mockReturnValue(unregisterTransform);
        mockRegisterUpdateListener.mockReturnValue(unregisterUpdate);

        const { unmount } = render(<MaxLengthPlugin maxLength={100} />);

        expect(unregisterTransform).not.toHaveBeenCalled();
        expect(unregisterUpdate).not.toHaveBeenCalled();

        unmount();

        expect(unregisterTransform).toHaveBeenCalled();
        expect(unregisterUpdate).toHaveBeenCalled();
    });
});
