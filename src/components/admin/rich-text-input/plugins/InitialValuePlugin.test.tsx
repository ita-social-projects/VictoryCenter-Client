import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { InitialValuePlugin } from './InitialValuePlugin';

const mockUpdate = jest.fn();
const mockGetEditorState = jest.fn();
const mockEditor = {
    update: mockUpdate,
    getEditorState: mockGetEditorState,
};

const mockGetRoot = jest.fn();
const mockInsertNodes = jest.fn();
const mockGenerateNodesFromDOM = jest.fn();
const mockGenerateHtmlFromNodes = jest.fn();
const mockSanitizeHtml = jest.fn();
const mockParseFromString = jest.fn();

jest.mock('@lexical/react/LexicalComposerContext', () => ({
    useLexicalComposerContext: () => [mockEditor],
}));

jest.mock('lexical', () => ({
    $getRoot: () => mockGetRoot(),
    $insertNodes: (nodes: any) => mockInsertNodes(nodes),
}));

jest.mock('@lexical/html', () => ({
    $generateNodesFromDOM: (editor: any, dom: any) => mockGenerateNodesFromDOM(editor, dom),
    $generateHtmlFromNodes: (editor: any) => mockGenerateHtmlFromNodes(editor),
}));

jest.mock('./htmlSanitizer', () => ({
    sanitizeHtml: (html: string) => mockSanitizeHtml(html),
}));

describe('InitialValuePlugin', () => {
    beforeEach(() => {
        jest.clearAllMocks();

        const mockRoot = { clear: jest.fn() };
        mockGetRoot.mockReturnValue(mockRoot);
        mockGenerateNodesFromDOM.mockReturnValue([{ type: 'paragraph' }]);
        mockGenerateHtmlFromNodes.mockReturnValue('<p></p>');
        mockSanitizeHtml.mockImplementation((html: string) => html);
        mockGetEditorState.mockReturnValue({
            read: (callback: () => any) => callback(),
        });

        mockParseFromString.mockImplementation((_value: string) => {
            const parsedDocument = window.document.implementation.createHTMLDocument('');
            parsedDocument.body.innerHTML = _value;
            return parsedDocument;
        });

        global.DOMParser = jest.fn().mockImplementation(() => ({
            parseFromString: mockParseFromString,
        })) as any;
    });

    it('renders without crashing', () => {
        const { container } = render(<InitialValuePlugin value="" />);
        expect(container).toBeEmptyDOMElement();
    });

    it('does not call editor.update on initial render', () => {
        render(<InitialValuePlugin value="<p>Initial content</p>" />);
        expect(mockUpdate).not.toHaveBeenCalled();
    });

    it('updates editor when value prop changes to different content', () => {
        const { rerender } = render(<InitialValuePlugin value="<p>First</p>" />);

        expect(mockUpdate).not.toHaveBeenCalled();

        mockGenerateHtmlFromNodes.mockReturnValue('<p>First</p>');

        rerender(<InitialValuePlugin value="<p>Second</p>" />);

        expect(mockUpdate).toHaveBeenCalledTimes(1);
    });

    it('updates editor for consecutive external value changes', () => {
        const { rerender } = render(<InitialValuePlugin value="<p>First</p>" />);

        mockGenerateHtmlFromNodes.mockReturnValue('<p>First</p>');
        rerender(<InitialValuePlugin value="<p>Second</p>" />);

        mockGenerateHtmlFromNodes.mockReturnValue('<p>Second</p>');
        rerender(<InitialValuePlugin value="<p>Third</p>" />);

        expect(mockUpdate).toHaveBeenCalledTimes(2);
    });

    it('does not update when value remains the same', () => {
        const { rerender } = render(<InitialValuePlugin value="<p>Same content</p>" />);

        rerender(<InitialValuePlugin value="<p>Same content</p>" />);

        expect(mockUpdate).not.toHaveBeenCalled();
    });

    it('does not call editor.update on empty initial value', () => {
        render(<InitialValuePlugin value="" />);
        expect(mockUpdate).not.toHaveBeenCalled();
    });

    it('resets to new value after external change', () => {
        const { rerender } = render(<InitialValuePlugin value="<p>Original</p>" />);

        mockGenerateHtmlFromNodes.mockReturnValue('<p>Original</p>');

        rerender(<InitialValuePlugin value="<p>Updated externally</p>" />);

        expect(mockUpdate).toHaveBeenCalledTimes(1);

        const updateCallback = mockUpdate.mock.calls[0][0];
        updateCallback();

        expect(mockGetRoot).toHaveBeenCalled();
        expect(mockInsertNodes).toHaveBeenCalled();
    });

    it('does not update editor when value changes but HTML content is the same', () => {
        const { rerender } = render(<InitialValuePlugin value="<p>Content</p>" />);

        mockGenerateHtmlFromNodes.mockReturnValue('<p>Content</p>');

        rerender(<InitialValuePlugin value="<p>Content</p>" />);

        expect(mockUpdate).not.toHaveBeenCalled();
    });

    it('does not update editor when sanitized current and next HTML are the same', () => {
        mockSanitizeHtml.mockImplementation((html: string) =>
            html.replace(' class="current"', '').replace(' data-editor="true"', ''),
        );

        const { rerender } = render(<InitialValuePlugin value="<p>Content</p>" />);

        mockGenerateHtmlFromNodes.mockReturnValue('<p class="current">Content</p>');

        rerender(<InitialValuePlugin value='<p data-editor="true">Content</p>' />);

        expect(mockUpdate).not.toHaveBeenCalled();
    });

    it('parses a fallback paragraph when sanitized next HTML is empty', () => {
        mockSanitizeHtml.mockImplementation((html: string) => (html.includes('<script>') ? '' : html));

        const { rerender } = render(<InitialValuePlugin value="<p>Original</p>" />);

        mockGenerateHtmlFromNodes.mockReturnValue('<p>Original</p>');

        rerender(<InitialValuePlugin value="<script>alert(1)</script>" />);

        expect(mockUpdate).toHaveBeenCalledTimes(1);

        const updateCallback = mockUpdate.mock.calls[0][0];
        updateCallback();

        expect(mockParseFromString).toHaveBeenCalledWith('<p></p>', 'text/html');
    });

    it('handles whitespace differences in HTML comparison', () => {
        const { rerender } = render(<InitialValuePlugin value="<p>First</p><p>Second</p>" />);

        mockGenerateHtmlFromNodes.mockReturnValue('<p>First</p> <p>Second</p>');

        rerender(<InitialValuePlugin value="<p>First</p><p>Second</p>" />);

        expect(mockUpdate).not.toHaveBeenCalled();
    });
});
