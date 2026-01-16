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

/**
 * Helper function to test the onChange callback with mocked HTML generation
 */
const testOnChangeCallback = (
    onChange: jest.Mock,
    mockHtml: string,
    expectedOutput: string,
) => {
    mockGenerateHtmlFromNodes.mockReturnValue(mockHtml);
    render(<OnChangePlugin onChange={onChange} />);

    const listenerCallback = mockRegisterUpdateListener.mock.calls[0][0];
    const mockEditorState = {
        read: jest.fn((callback) => callback()),
    };

    listenerCallback({ editorState: mockEditorState });

    expect(onChange).toHaveBeenCalledWith(expectedOutput);
};

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
        testOnChangeCallback(onChange, '<p>Generated HTML</p>', '<p>Generated HTML</p>');
    });

    it('calls onChange with sanitized HTML generated from nodes', () => {
        const onChange = jest.fn();
        testOnChangeCallback(
            onChange,
            '<p>Custom <strong>HTML</strong></p>',
            '<p>Custom <strong>HTML</strong></p>',
        );
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
            testOnChangeCallback(
                onChange,
                '<p class="RichTextInput_paragraph__abc123">Text with <strong class="RichTextInput_textBold__xyz">bold</strong></p>',
                '<p>Text with <strong>bold</strong></p>',
            );
        });

        it('removes inline style attributes from HTML', () => {
            const onChange = jest.fn();
            testOnChangeCallback(
                onChange,
                '<p style="white-space: pre-wrap;">Text with <span style="white-space: pre-wrap;">span</span></p>',
                '<p>Text with span</p>',
            );
        });

        it('removes redundant b tags wrapping strong tags', () => {
            const onChange = jest.fn();
            testOnChangeCallback(
                onChange,
                '<p>Text <b><strong>bold</strong></b> here</p>',
                '<p>Text <strong>bold</strong> here</p>',
            );
        });

        it('removes redundant i tags wrapping em tags', () => {
            const onChange = jest.fn();
            testOnChangeCallback(
                onChange,
                '<p>Text <i><em>italic</em></i> here</p>',
                '<p>Text <em>italic</em> here</p>',
            );
        });

        it('handles empty string input', () => {
            const onChange = jest.fn();
            testOnChangeCallback(onChange, '', '');
        });

        it('sanitizes complex Lexical output with multiple issues', () => {
            const onChange = jest.fn();
            testOnChangeCallback(
                onChange,
                '<p class="RichTextInput_paragraph__wO3kv" style="text-align: center;">' +
                    '<span style="white-space: pre-wrap;">Ми не </span>' +
                    '<b><strong class="RichTextInput_textBold__TIQja" style="white-space: pre-wrap;">одні</strong></b>' +
                    '<span style="white-space: pre-wrap;">. І це наша </span>' +
                    '<b><strong class="RichTextInput_textBold__TIQja" style="white-space: pre-wrap;">сила</strong></b>' +
                    '</p>',
                '<p>Ми не <strong>одні</strong>. І це наша <strong>сила</strong></p>',
            );
        });
    });
});
