import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { OnChangePlugin } from './OnChangePlugin';

// Mock Lexical modules
const mockRegisterUpdateListener = jest.fn();
const mockEditor = {
    registerUpdateListener: mockRegisterUpdateListener,
};

jest.mock('@lexical/react/LexicalComposerContext', () => ({
    useLexicalComposerContext: () => [mockEditor],
}));

const mockGenerateHtmlFromNodes = jest.fn();

jest.mock('@lexical/html', () => ({
    $generateHtmlFromNodes: (...args: any[]) => mockGenerateHtmlFromNodes(...args),
}));

describe('OnChangePlugin', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockRegisterUpdateListener.mockReturnValue(jest.fn());
        mockGenerateHtmlFromNodes.mockReturnValue('<p>Generated HTML</p>');
    });

    it('renders without crashing', () => {
        const onChange = jest.fn();
        const { container } = render(<OnChangePlugin onChange={onChange} />);
        expect(container).toBeEmptyDOMElement();
    });

    it('registers update listener on mount', () => {
        const onChange = jest.fn();
        render(<OnChangePlugin onChange={onChange} />);

        expect(mockRegisterUpdateListener).toHaveBeenCalledWith(expect.any(Function));
    });

    it('calls onChange callback when editor updates', () => {
        const onChange = jest.fn();
        render(<OnChangePlugin onChange={onChange} />);

        // Get the listener callback
        const listenerCallback = mockRegisterUpdateListener.mock.calls[0][0];

        // Create a mock editorState
        const mockEditorState = {
            read: jest.fn((callback) => callback()),
        };

        // Execute the listener
        listenerCallback({ editorState: mockEditorState });

        expect(mockEditorState.read).toHaveBeenCalled();
        expect(onChange).toHaveBeenCalledWith('<p>Generated HTML</p>');
    });

    it('calls onChange with HTML generated from nodes', () => {
        const onChange = jest.fn();

        mockGenerateHtmlFromNodes.mockReturnValue('<p>Custom <strong>HTML</strong></p>');

        render(<OnChangePlugin onChange={onChange} />);

        const listenerCallback = mockRegisterUpdateListener.mock.calls[0][0];
        const mockEditorState = {
            read: jest.fn((callback) => callback()),
        };

        listenerCallback({ editorState: mockEditorState });

        expect(mockGenerateHtmlFromNodes).toHaveBeenCalledWith(mockEditor);
        expect(onChange).toHaveBeenCalledWith('<p>Custom <strong>HTML</strong></p>');
    });

    it('unregisters listener on unmount', () => {
        const unregister = jest.fn();
        mockRegisterUpdateListener.mockReturnValue(unregister);

        const onChange = jest.fn();
        const { unmount } = render(<OnChangePlugin onChange={onChange} />);

        expect(unregister).not.toHaveBeenCalled();

        unmount();

        expect(unregister).toHaveBeenCalled();
    });
});
