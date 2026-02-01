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

        const mockRoot = {
            clear: jest.fn(),
        };
        mockGetRoot.mockReturnValue(mockRoot);
        mockGenerateNodesFromDOM.mockReturnValue([{ type: 'paragraph' }]);
        mockGenerateHtmlFromNodes.mockReturnValue('<p></p>');

        // Mock sanitizeHtml to return the input as-is (passthrough)
        mockSanitizeHtml.mockImplementation((html: string) => html);

        // Mock getEditorState to return an object with a read method
        mockGetEditorState.mockReturnValue({
            read: (callback: () => any) => callback(),
        });

        global.DOMParser = jest.fn().mockImplementation(() => ({
            parseFromString: jest.fn(() => ({
                body: { innerHTML: '' },
            })),
        })) as any;
    });

    it('renders without crashing', () => {
        const { container } = render(<InitialValuePlugin value="" />);
        expect(container).toBeEmptyDOMElement();
    });

    it('updates editor on initial render with value', () => {
        render(<InitialValuePlugin value="<p>Initial content</p>" />);

        expect(mockUpdate).toHaveBeenCalled();

        const updateCallback = mockUpdate.mock.calls[0][0];
        updateCallback();

        expect(mockGetRoot).toHaveBeenCalled();
        expect(mockGenerateNodesFromDOM).toHaveBeenCalled();
        expect(mockInsertNodes).toHaveBeenCalledWith([{ type: 'paragraph' }]);
    });

    it('updates editor when value prop changes to different content', () => {
        // Initial render with "First"
        const { rerender } = render(<InitialValuePlugin value="<p>First</p>" />);

        expect(mockUpdate).toHaveBeenCalledTimes(1);

        // Mock the current editor HTML to be different from new value
        mockGenerateHtmlFromNodes.mockReturnValue('<p>First</p>');

        // Rerender with "Second" - this is truly different content
        rerender(<InitialValuePlugin value="<p>Second</p>" />);

        // Should update because content is different
        expect(mockUpdate).toHaveBeenCalledTimes(2);
    });

    it('does not update when value remains the same', () => {
        const { rerender } = render(<InitialValuePlugin value="<p>Same content</p>" />);

        expect(mockUpdate).toHaveBeenCalledTimes(1);

        rerender(<InitialValuePlugin value="<p>Same content</p>" />);

        expect(mockUpdate).toHaveBeenCalledTimes(1);
    });

    it('handles empty value by using default paragraph', () => {
        render(<InitialValuePlugin value="" />);

        expect(mockUpdate).toHaveBeenCalled();

        const updateCallback = mockUpdate.mock.calls[0][0];
        updateCallback();

        expect(global.DOMParser).toHaveBeenCalled();
        expect(mockGenerateNodesFromDOM).toHaveBeenCalled();
    });

    it('clears root before inserting new nodes', () => {
        const mockClear = jest.fn();
        const mockRoot = {
            clear: mockClear,
        };
        mockGetRoot.mockReturnValue(mockRoot);

        render(<InitialValuePlugin value="<p>Content</p>" />);

        const updateCallback = mockUpdate.mock.calls[0][0];
        updateCallback();

        expect(mockClear).toHaveBeenCalled();
        expect(mockInsertNodes).toHaveBeenCalled();
        const clearCallOrder = mockClear.mock.invocationCallOrder[0];
        const insertCallOrder = mockInsertNodes.mock.invocationCallOrder[0];
        expect(clearCallOrder).toBeLessThan(insertCallOrder);
    });

    it('uses DOMParser to parse HTML value', () => {
        const mockParseFromString = jest.fn(() => ({
            body: { innerHTML: '' },
        }));

        global.DOMParser = jest.fn().mockImplementation(() => ({
            parseFromString: mockParseFromString,
        })) as any;

        render(<InitialValuePlugin value="<p>Test <strong>HTML</strong></p>" />);

        const updateCallback = mockUpdate.mock.calls[0][0];
        updateCallback();

        expect(global.DOMParser).toHaveBeenCalled();
        expect(mockParseFromString).toHaveBeenCalledWith('<p>Test <strong>HTML</strong></p>', 'text/html');
    });

    it('handles complex HTML with multiple elements', () => {
        const complexHtml = '<p>First</p><p><strong>Bold</strong> and <em>italic</em></p>';

        render(<InitialValuePlugin value={complexHtml} />);

        const updateCallback = mockUpdate.mock.calls[0][0];
        updateCallback();

        expect(mockGenerateNodesFromDOM).toHaveBeenCalledWith(mockEditor, expect.any(Object));
    });

    it('resets to new value after external change', () => {
        const { rerender } = render(<InitialValuePlugin value="<p>Original</p>" />);

        mockUpdate.mockClear();

        // Mock current HTML to be different from new value
        mockGenerateHtmlFromNodes.mockReturnValue('<p>Original</p>');

        rerender(<InitialValuePlugin value="<p>Updated externally</p>" />);

        expect(mockUpdate).toHaveBeenCalled();

        const updateCallback = mockUpdate.mock.calls[0][0];
        updateCallback();

        expect(mockGetRoot).toHaveBeenCalled();
        expect(mockInsertNodes).toHaveBeenCalled();
    });

    it('does not update editor when value changes but HTML content is the same', () => {
        // Simulates OnChangePlugin sanitizing and triggering a state update
        const { rerender } = render(<InitialValuePlugin value="<p>Content</p>" />);

        expect(mockUpdate).toHaveBeenCalledTimes(1);
        mockUpdate.mockClear();

        // Mock current HTML to match the new value (after sanitization)
        mockGenerateHtmlFromNodes.mockReturnValue('<p>Content</p>');

        // Rerender with same content (simulating OnChangePlugin feedback loop)
        rerender(<InitialValuePlugin value="<p>Content</p>" />);

        // Should NOT update because content is the same
        expect(mockUpdate).not.toHaveBeenCalled();
    });

    it('handles whitespace differences in HTML comparison', () => {
        const { rerender } = render(<InitialValuePlugin value="<p>First</p><p>Second</p>" />);

        expect(mockUpdate).toHaveBeenCalledTimes(1);
        mockUpdate.mockClear();

        // Mock current HTML with extra whitespace
        mockGenerateHtmlFromNodes.mockReturnValue('<p>First</p> <p>Second</p>');

        // Rerender with same content but different whitespace
        rerender(<InitialValuePlugin value="<p>First</p><p>Second</p>" />);

        // Should NOT update because content is semantically the same
        expect(mockUpdate).not.toHaveBeenCalled();
    });
});
