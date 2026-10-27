import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html';
import {
    $createLineBreakNode,
    $createParagraphNode,
    $createTextNode,
    $getRoot,
    $insertNodes,
    createEditor,
    LexicalEditor,
    LexicalNode,
} from 'lexical';
import { $getRichTextContent, getRichTextContentFromHtml } from '@/utils/functions/rich-text-content/rich-text-content';
import { HTML_EXPORT_CONFIG } from './htmlExportConfig';

const throwError = (error: Error) => {
    throw error;
};

const createTestEditor = () => createEditor({ onError: throwError, html: HTML_EXPORT_CONFIG });

const setParagraphs = (editor: LexicalEditor, ...paragraphs: (() => LexicalNode[])[]) =>
    editor.update(
        () => {
            paragraphs.forEach((nodes) => $getRoot().append($createParagraphNode().append(...nodes())));
        },
        { discrete: true },
    );

const exportHtml = (editor: LexicalEditor) => editor.getEditorState().read(() => $generateHtmlFromNodes(editor));

const importHtml = (html: string) => {
    const editor = createTestEditor();
    editor.update(
        () => {
            $getRoot().select();
            $insertNodes($generateNodesFromDOM(editor, new DOMParser().parseFromString(html, 'text/html')));
        },
        { discrete: true },
    );
    return editor;
};

const getText = (editor: LexicalEditor) => editor.getEditorState().read($getRichTextContent);

const PARAGRAPHS: Record<string, (() => LexicalNode[])[]> = {
    'a line break inside a paragraph': [() => [$createTextNode('ab'), $createLineBreakNode(), $createTextNode('c')]],
    'a line break at the end of a paragraph': [
        () => [$createTextNode('a'), $createLineBreakNode()],
        () => [$createTextNode('b')],
    ],
    'line breaks at the start of the text': [
        () => [$createLineBreakNode(), $createLineBreakNode(), $createTextNode('тест коня')],
    ],
    'several line breaks at the end of the text': [
        () => [$createTextNode('a'), $createLineBreakNode(), $createLineBreakNode()],
    ],
};

describe('HTML_EXPORT_CONFIG', () => {
    it('exports one more <br> after a line break that ends a paragraph', () => {
        const editor = createTestEditor();
        setParagraphs(editor, () => [$createTextNode('a'), $createLineBreakNode()]);

        expect(exportHtml(editor)).toMatch(/<br><br><\/p>$/);
    });

    it('does not add a <br> to a paragraph that ends with text', () => {
        const editor = createTestEditor();
        setParagraphs(editor, () => [$createTextNode('a'), $createLineBreakNode(), $createTextNode('b')]);

        expect(exportHtml(editor).match(/<br>/g)).toHaveLength(1);
    });

    it.each(Object.entries(PARAGRAPHS))('keeps the text after saving and reloading with %s', (_, paragraphs) => {
        const editor = createTestEditor();
        setParagraphs(editor, ...paragraphs);

        expect(getText(importHtml(exportHtml(editor)))).toBe(getText(editor));
    });

    it.each(Object.entries(PARAGRAPHS))('reads the same text from the exported HTML with %s', (_, paragraphs) => {
        const editor = createTestEditor();
        setParagraphs(editor, ...paragraphs);

        expect(getRichTextContentFromHtml(exportHtml(editor))).toBe(getText(editor));
    });
});
