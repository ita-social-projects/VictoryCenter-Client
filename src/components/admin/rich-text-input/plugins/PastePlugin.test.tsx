import { render } from '@testing-library/react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import {
    $createParagraphNode,
    $createTextNode,
    $getRoot,
    $isTextNode,
    createEditor,
    LexicalEditor,
    PASTE_COMMAND,
    TextNode,
} from 'lexical';
import { $getRichTextContent } from '@/utils/functions/rich-text-content/rich-text-content';
import { PastePlugin, registerPaste } from './PastePlugin';

const throwError = (error: Error) => {
    throw error;
};

const createTestEditor = (text: string) => {
    const editor = createEditor({ onError: throwError });
    registerPaste(editor);
    editor.update(
        () => {
            const textNode = $createTextNode(text);
            $getRoot().append($createParagraphNode().append(textNode));
            textNode.select(text.length, text.length);
        },
        { discrete: true },
    );
    return editor;
};

const createPasteEvent = (data: Record<string, string>) =>
    ({
        clipboardData: { getData: (type: string) => data[type] ?? '' },
        preventDefault: jest.fn(),
    }) as unknown as ClipboardEvent;

const paste = (editor: LexicalEditor, event: ClipboardEvent) => {
    let handled = false;
    editor.update(() => (handled = editor.dispatchCommand(PASTE_COMMAND, event)), { discrete: true });
    return handled;
};

const read = <T,>(editor: LexicalEditor, fn: () => T) => editor.getEditorState().read(fn);

const getParagraphCount = (editor: LexicalEditor) => read(editor, () => $getRoot().getChildrenSize());

describe('registerPaste', () => {
    it('pastes the lines of a plain text as line breaks in the current paragraph', () => {
        const editor = createTestEditor('abc');

        paste(editor, createPasteEvent({ 'text/plain': 'de\r\nfg' }));

        expect(read(editor, $getRichTextContent)).toBe('abcde\nfg');
        expect(getParagraphCount(editor)).toBe(1);
    });

    it('pastes HTML paragraphs as line breaks and keeps their formatting', () => {
        const editor = createTestEditor('abc');

        paste(editor, createPasteEvent({ 'text/html': '<p>de</p><p><b>fg</b></p>', 'text/plain': 'de\n\nfg' }));

        expect(read(editor, $getRichTextContent)).toBe('abcde\nfg');
        expect(getParagraphCount(editor)).toBe(1);
        expect(
            read(editor, () =>
                $getRoot()
                    .getAllTextNodes()
                    .some(
                        (node: TextNode) =>
                            $isTextNode(node) && node.getTextContent() === 'fg' && node.hasFormat('bold'),
                    ),
            ),
        ).toBe(true);
    });

    it('keeps an empty pasted paragraph as an empty line', () => {
        const editor = createTestEditor('');

        paste(editor, createPasteEvent({ 'text/html': '<p>a</p><p></p><p>b</p>', 'text/plain': 'a\n\nb' }));

        expect(read(editor, $getRichTextContent)).toBe('a\n\nb');
    });

    it('pastes the plain text when the HTML is the same text', () => {
        const editor = createTestEditor('');

        paste(editor, createPasteEvent({ 'text/html': 'a\nb', 'text/plain': 'a\nb' }));

        expect(read(editor, $getRichTextContent)).toBe('a\nb');
    });

    it('leaves the paste to Lexical when there is no text in the clipboard', () => {
        const editor = createTestEditor('abc');
        const event = createPasteEvent({});

        expect(paste(editor, event)).toBe(false);
        expect(event.preventDefault).not.toHaveBeenCalled();
        expect(read(editor, $getRichTextContent)).toBe('abc');
    });
});

describe('PastePlugin', () => {
    it('renders nothing inside a Lexical composer', () => {
        const { container } = render(
            <LexicalComposer initialConfig={{ namespace: 'test', onError: throwError }}>
                <PastePlugin />
            </LexicalComposer>,
        );

        expect(container).toBeEmptyDOMElement();
    });
});
