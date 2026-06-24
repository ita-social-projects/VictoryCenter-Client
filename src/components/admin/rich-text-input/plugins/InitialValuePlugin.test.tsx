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

        global.DOMParser = jest.fn().mockImplementation(() => ({
            parseFromString: jest.fn((_value: string) => {
                const parsedDocument = window.document.implementation.createHTMLDocument('');
                parsedDocument.body.innerHTML = _value;
                return parsedDocument;
            }),
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

    it('wraps plain text external values before importing them into Lexical', () => {
        const { rerender } = render(<InitialValuePlugin value="<p>Original</p>" />);

        mockGenerateHtmlFromNodes.mockReturnValue('<p>Original</p>');

        rerender(<InitialValuePlugin value="About us and who we are" />);

        const updateCallback = mockUpdate.mock.calls[0][0];
        updateCallback();

        const parserResults = (global.DOMParser as jest.Mock).mock.results;
        const parser = parserResults[parserResults.length - 1].value;
        expect(parser.parseFromString).toHaveBeenCalledWith('<p>About us and who we are</p>', 'text/html');
        expect(mockGenerateNodesFromDOM.mock.calls[0][1].body.innerHTML).toBe('<p>About us and who we are</p>');
    });

    it('does not update editor when value changes but HTML content is the same', () => {
        const { rerender } = render(<InitialValuePlugin value="<p>Content</p>" />);

        mockGenerateHtmlFromNodes.mockReturnValue('<p>Content</p>');

        rerender(<InitialValuePlugin value="<p>Content</p>" />);

        expect(mockUpdate).not.toHaveBeenCalled();
    });

    it('does not update editor when sanitized current and next HTML are the same', () => {
        mockSanitizeHtml.mockImplementation((html: string) => html.replace(' class="external"', ''));

        const { rerender } = render(<InitialValuePlugin value="<p>Content</p>" />);

        mockGenerateHtmlFromNodes.mockReturnValue('<p>Content</p>');

        rerender(<InitialValuePlugin value='<p class="external">Content</p>' />);

        expect(mockUpdate).not.toHaveBeenCalled();
    });

    it('handles whitespace differences in HTML comparison', () => {
        const { rerender } = render(<InitialValuePlugin value="<p>First</p><p>Second</p>" />);

        mockGenerateHtmlFromNodes.mockReturnValue('<p>First</p> <p>Second</p>');

        rerender(<InitialValuePlugin value="<p>First</p><p>Second</p>" />);

        expect(mockUpdate).not.toHaveBeenCalled();
    });
});
