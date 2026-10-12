import { render } from '@testing-library/react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import {
    $createParagraphNode,
    $createTextNode,
    $getRoot,
    $getSelection,
    $isRangeSelection,
    $setCompositionKey,
    createEditor,
    LexicalEditor,
    TextNode,
} from 'lexical';
import { registerSpaceNormalization, SpaceNormalizationPlugin } from './SpaceNormalizationPlugin';

const throwError = (error: Error) => {
    throw error;
};

const createTestEditor = () => {
    const editor = createEditor({ onError: throwError });
    registerSpaceNormalization(editor);
    return editor;
};

const update = (editor: LexicalEditor, fn: () => void) => editor.update(fn, { discrete: true });

const setParagraphs = (editor: LexicalEditor, buildParagraphs: () => TextNode[][]) =>
    update(editor, () => {
        const root = $getRoot();
        root.clear();
        buildParagraphs().forEach((nodes) => root.append($createParagraphNode().append(...nodes)));
    });

const placeCaret = (editor: LexicalEditor, offset: number) =>
    update(editor, () => {
        $getRoot().getFirstDescendant<TextNode>()?.select(offset, offset);
    });

const typeText = (editor: LexicalEditor, text: string) =>
    update(editor, () => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) selection.insertText(text);
    });

const getText = (editor: LexicalEditor) => editor.getEditorState().read(() => $getRoot().getTextContent());

const getCaretOffset = (editor: LexicalEditor) =>
    editor.getEditorState().read(() => {
        const selection = $getSelection();
        return $isRangeSelection(selection) ? selection.anchor.offset : null;
    });

describe('registerSpaceNormalization', () => {
    it('collapses a space typed next to another one and keeps the caret in place', () => {
        const editor = createTestEditor();
        setParagraphs(editor, () => [[$createTextNode('123 4567')]]);
        placeCaret(editor, 4);

        typeText(editor, ' ');

        expect(getText(editor)).toBe('123 4567');
        expect(getCaretOffset(editor)).toBe(4);
    });

    it('keeps the caret after the typed character when collapsing spaces before it', () => {
        const editor = createTestEditor();
        setParagraphs(editor, () => [[$createTextNode('a  b')]]);

        expect(getText(editor)).toBe('a b');

        placeCaret(editor, 3);
        typeText(editor, 'c');

        expect(getText(editor)).toBe('a bc');
        expect(getCaretOffset(editor)).toBe(4);
    });

    it('removes spaces at the start of the field', () => {
        const editor = createTestEditor();
        setParagraphs(editor, () => [[$createTextNode('   hello')]]);

        expect(getText(editor)).toBe('hello');
    });

    it('does not let the field start with a typed space', () => {
        const editor = createTestEditor();
        setParagraphs(editor, () => [[$createTextNode('')]]);
        placeCaret(editor, 0);

        typeText(editor, ' ');

        expect(getText(editor)).toBe('');
    });

    it('keeps a single trailing space so the next word can be typed', () => {
        const editor = createTestEditor();
        setParagraphs(editor, () => [[$createTextNode('hello')]]);
        placeCaret(editor, 5);

        typeText(editor, ' ');

        expect(getText(editor)).toBe('hello ');
    });

    it('collapses runs of non-breaking spaces from pasted text', () => {
        const editor = createTestEditor();
        setParagraphs(editor, () => [[$createTextNode('a\u00A0\u00A0 b')]]);

        expect(getText(editor)).toBe('a b');
    });

    it('collapses spaces across a formatting boundary', () => {
        const editor = createTestEditor();
        setParagraphs(editor, () => [[$createTextNode('a '), $createTextNode(' b').toggleFormat('bold')]]);

        expect(getText(editor)).toBe('a b');
    });

    it('collapses a space typed before a formatted node that starts with a space', () => {
        const editor = createTestEditor();
        setParagraphs(editor, () => [[$createTextNode('a'), $createTextNode(' b').toggleFormat('bold')]]);
        placeCaret(editor, 1);

        typeText(editor, ' ');

        expect(getText(editor)).toBe('a b');
    });

    it('keeps the leading space of a paragraph that is not the first one', () => {
        const editor = createTestEditor();
        setParagraphs(editor, () => [[$createTextNode('first')], [$createTextNode(' second')]]);

        expect(getText(editor)).toBe('first\n\n second');
    });

    it('does not change a node during IME composition (Lexical skips transforms for it)', () => {
        const editor = createTestEditor();
        update(editor, () => {
            const node = $createTextNode('a  b');
            $getRoot().append($createParagraphNode().append(node));
            $setCompositionKey(node.getKey());
        });

        expect(getText(editor)).toBe('a  b');
    });
});

describe('SpaceNormalizationPlugin', () => {
    it('renders nothing inside a Lexical composer', () => {
        const { container } = render(
            <LexicalComposer initialConfig={{ namespace: 'test', onError: throwError }}>
                <SpaceNormalizationPlugin />
            </LexicalComposer>,
        );

        expect(container).toBeEmptyDOMElement();
    });
});
