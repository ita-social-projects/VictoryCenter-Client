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
        // Sanitized HTML output (class/style attributes removed by DOMPurify)
        expect(onChange).toHaveBeenCalledWith('<p>Generated HTML</p>');
    });

    it('calls onChange with sanitized HTML generated from nodes', () => {
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

    describe('HTML Sanitization', () => {
        it('removes CSS module class attributes from HTML', () => {
            const onChange = jest.fn();

            mockGenerateHtmlFromNodes.mockReturnValue(
                '<p class="RichTextInput_paragraph__abc123">Text with <strong class="RichTextInput_textBold__xyz">bold</strong></p>',
            );

            render(<OnChangePlugin onChange={onChange} />);

            const listenerCallback = mockRegisterUpdateListener.mock.calls[0][0];
            const mockEditorState = {
                read: jest.fn((callback) => callback()),
            };

            listenerCallback({ editorState: mockEditorState });

            // Classes should be removed
            expect(onChange).toHaveBeenCalledWith('<p>Text with <strong>bold</strong></p>');
        });

        it('removes inline style attributes from HTML', () => {
            const onChange = jest.fn();

            mockGenerateHtmlFromNodes.mockReturnValue(
                '<p style="white-space: pre-wrap;">Text with <span style="white-space: pre-wrap;">span</span></p>',
            );

            render(<OnChangePlugin onChange={onChange} />);

            const listenerCallback = mockRegisterUpdateListener.mock.calls[0][0];
            const mockEditorState = {
                read: jest.fn((callback) => callback()),
            };

            listenerCallback({ editorState: mockEditorState });

            // Styles should be removed, empty spans unwrapped
            expect(onChange).toHaveBeenCalledWith('<p>Text with span</p>');
        });

        it('removes redundant b tags wrapping strong tags', () => {
            const onChange = jest.fn();

            mockGenerateHtmlFromNodes.mockReturnValue('<p>Text <b><strong>bold</strong></b> here</p>');

            render(<OnChangePlugin onChange={onChange} />);

            const listenerCallback = mockRegisterUpdateListener.mock.calls[0][0];
            const mockEditorState = {
                read: jest.fn((callback) => callback()),
            };

            listenerCallback({ editorState: mockEditorState });

            // Redundant <b> should be removed
            expect(onChange).toHaveBeenCalledWith('<p>Text <strong>bold</strong> here</p>');
        });

        it('removes redundant i tags wrapping em tags', () => {
            const onChange = jest.fn();

            mockGenerateHtmlFromNodes.mockReturnValue('<p>Text <i><em>italic</em></i> here</p>');

            render(<OnChangePlugin onChange={onChange} />);

            const listenerCallback = mockRegisterUpdateListener.mock.calls[0][0];
            const mockEditorState = {
                read: jest.fn((callback) => callback()),
            };

            listenerCallback({ editorState: mockEditorState });

            // Redundant <i> should be removed
            expect(onChange).toHaveBeenCalledWith('<p>Text <em>italic</em> here</p>');
        });

        it('handles empty string input', () => {
            const onChange = jest.fn();

            mockGenerateHtmlFromNodes.mockReturnValue('');

            render(<OnChangePlugin onChange={onChange} />);

            const listenerCallback = mockRegisterUpdateListener.mock.calls[0][0];
            const mockEditorState = {
                read: jest.fn((callback) => callback()),
            };

            listenerCallback({ editorState: mockEditorState });

            expect(onChange).toHaveBeenCalledWith('');
        });

        it('sanitizes complex Lexical output with multiple issues', () => {
            const onChange = jest.fn();

            // Simulating real Lexical output with all the issues
            mockGenerateHtmlFromNodes.mockReturnValue(
                '<p class="RichTextInput_paragraph__wO3kv" style="text-align: center;">' +
                    '<span style="white-space: pre-wrap;">Ми не </span>' +
                    '<b><strong class="RichTextInput_textBold__TIQja" style="white-space: pre-wrap;">одні</strong></b>' +
                    '<span style="white-space: pre-wrap;">. І це наша </span>' +
                    '<b><strong class="RichTextInput_textBold__TIQja" style="white-space: pre-wrap;">сила</strong></b>' +
                    '</p>',
            );

            render(<OnChangePlugin onChange={onChange} />);

            const listenerCallback = mockRegisterUpdateListener.mock.calls[0][0];
            const mockEditorState = {
                read: jest.fn((callback) => callback()),
            };

            listenerCallback({ editorState: mockEditorState });

            // Should produce clean HTML
            expect(onChange).toHaveBeenCalledWith(
                '<p>Ми не <strong>одні</strong>. І це наша <strong>сила</strong></p>',
            );
        });
    });
});
