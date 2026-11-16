import { act, render } from '@testing-library/react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
    $createLineBreakNode,
    $createParagraphNode,
    $createTextNode,
    $getRoot,
    $getSelection,
    $isRangeSelection,
    createEditor,
    LexicalEditor,
    LexicalNode,
    ParagraphNode,
    RangeSelection,
    TextNode,
} from 'lexical';
import { $getRichTextContent } from '@/utils/functions/rich-text-content/rich-text-content';
import { MaxLengthPlugin, registerMaxLength } from './MaxLengthPlugin';

const throwError = (error: Error) => {
    throw error;
};

const createTestEditor = (maxLength: number) => {
    const editor = createEditor({ onError: throwError });
    registerMaxLength(editor, maxLength);
    return editor;
};

const update = (editor: LexicalEditor, fn: () => void) => editor.update(fn, { discrete: true });

const setParagraphs = (editor: LexicalEditor, ...paragraphs: string[]) =>
    update(editor, () => {
        const root = $getRoot();
        root.clear();
        paragraphs.forEach((text) => root.append($createParagraphNode().append($createTextNode(text))));
    });

const placeCaret = (editor: LexicalEditor, offset: number, paragraphIndex = 0) =>
    update(editor, () => {
        const paragraph = $getRoot().getChildAtIndex<ParagraphNode>(paragraphIndex);
        paragraph?.getFirstDescendant<TextNode>()?.select(offset, offset);
    });

const withSelection = (editor: LexicalEditor, fn: (selection: RangeSelection) => void) =>
    update(editor, () => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) fn(selection);
    });

const typeText = (editor: LexicalEditor, text: string) =>
    withSelection(editor, (selection) => selection.insertText(text));

const insertLineBreak = (editor: LexicalEditor) =>
    withSelection(editor, (selection) => selection.insertNodes([$createLineBreakNode()]));

const pasteText = (editor: LexicalEditor, text: string) =>
    withSelection(editor, (selection) => selection.insertRawText(text));

const deleteBackward = (editor: LexicalEditor) =>
    withSelection(editor, ({ anchor }) => {
        const node = anchor.getNode() as TextNode;
        if (anchor.offset > 0) {
            node.spliceText(anchor.offset - 1, 1, '', true);
        } else {
            node.getPreviousSibling()?.remove();
        }
    });

const getText = (editor: LexicalEditor) => editor.getEditorState().read($getRichTextContent);

const TEXT = 'abcdefghij';

describe('registerMaxLength', () => {
    it('does not add a line break to a full field and keeps all of its characters', () => {
        const editor = createTestEditor(TEXT.length);
        setParagraphs(editor, TEXT);
        placeCaret(editor, 5);

        insertLineBreak(editor);

        expect(getText(editor)).toBe(TEXT);
    });

    it('does not add a line break at the end of a full field', () => {
        const editor = createTestEditor(TEXT.length);
        setParagraphs(editor, TEXT);
        placeCaret(editor, TEXT.length);

        insertLineBreak(editor);

        expect(getText(editor)).toBe(TEXT);
    });

    it('does not add a typed character to a full field', () => {
        const editor = createTestEditor(TEXT.length);
        setParagraphs(editor, TEXT);
        placeCaret(editor, 3);

        typeText(editor, 'x');

        expect(getText(editor)).toBe(TEXT);
    });

    it('counts a line break as one character', () => {
        const editor = createTestEditor(TEXT.length + 1);
        setParagraphs(editor, TEXT);
        placeCaret(editor, 5);

        insertLineBreak(editor);

        expect(getText(editor)).toBe('abcde\nfghij');
    });

    it('keeps the characters after the caret when removing the line break with Backspace', () => {
        const editor = createTestEditor(TEXT.length + 1);
        setParagraphs(editor, TEXT);
        placeCaret(editor, 5);
        insertLineBreak(editor);

        deleteBackward(editor);

        expect(getText(editor)).toBe(TEXT);
    });

    it('cuts the end of a pasted text that does not fit and keeps the characters around it', () => {
        const editor = createTestEditor(TEXT.length + 2);
        setParagraphs(editor, TEXT);
        placeCaret(editor, 5);

        pasteText(editor, 'xy\nz');

        expect(getText(editor)).toBe('abcdexyfghij');
    });

    it('pastes a text with a line break that fits exactly', () => {
        const editor = createTestEditor(TEXT.length + 4);
        setParagraphs(editor, TEXT);
        placeCaret(editor, TEXT.length);

        pasteText(editor, 'xy\nz');

        expect(getText(editor)).toBe('abcdefghijxy\nz');
    });

    it('counts the boundary between two paragraphs as one character', () => {
        const editor = createTestEditor(10);
        setParagraphs(editor, 'abcd', 'efgh');
        placeCaret(editor, 4);

        typeText(editor, 'x');
        expect(getText(editor)).toBe('abcdx\nefgh');

        typeText(editor, 'y');
        expect(getText(editor)).toBe('abcdx\nefgh');
    });

    it('removes only the overflow when the caret is after a whole paragraph', () => {
        const editor = createTestEditor(15);
        setParagraphs(editor, TEXT);

        update(editor, () => {
            const root = $getRoot();
            root.append($createParagraphNode().append($createTextNode('klmnopqrst')));
            root.select(2, 2);
        });

        expect(getText(editor)).toBe('abcdefghij\nklmn');
    });

    it('does not cut a value that is already over the limit, but does not let it grow', () => {
        const editor = createTestEditor(5);
        setParagraphs(editor, TEXT);
        placeCaret(editor, TEXT.length);

        typeText(editor, 'x');
        expect(getText(editor)).toBe(TEXT);

        deleteBackward(editor);
        expect(getText(editor)).toBe('abcdefghi');
    });
});

const EditorCapture = ({ onEditor }: { onEditor: (editor: LexicalEditor) => void }) => {
    const [editor] = useLexicalComposerContext();
    onEditor(editor);
    return null;
};

const renderPlugin = (props: Partial<React.ComponentProps<typeof MaxLengthPlugin>> = {}) => {
    let editor: LexicalEditor | null = null;
    const utils = render(
        <LexicalComposer initialConfig={{ namespace: 'test', onError: throwError }}>
            <MaxLengthPlugin maxLength={10} {...props} />
            <EditorCapture onEditor={(instance) => (editor = instance)} />
        </LexicalComposer>,
    );
    return { ...utils, editor: editor as unknown as LexicalEditor };
};

const setNodes = (editor: LexicalEditor, ...paragraphs: (() => LexicalNode[])[]) =>
    act(() => {
        update(editor, () => {
            const root = $getRoot();
            root.clear();
            paragraphs.forEach((nodes) => root.append($createParagraphNode().append(...nodes())));
        });
    });

describe('MaxLengthPlugin', () => {
    it('renders nothing inside a Lexical composer', () => {
        const { container } = renderPlugin();

        expect(container).toBeEmptyDOMElement();
    });

    it('reports a line break and a paragraph boundary as one character each', () => {
        const onLengthChange = jest.fn();
        const { editor } = renderPlugin({ onLengthChange });

        setNodes(
            editor,
            () => [$createTextNode('ab'), $createLineBreakNode(), $createTextNode('c')],
            () => [$createTextNode('d')],
        );

        expect(onLengthChange).toHaveBeenLastCalledWith(6);
    });

    it.each([
        [false, 9],
        [true, 5],
    ])('counts trailing whitespace only when ignoreTrailingWhitespace is %s', (ignoreTrailingWhitespace, expected) => {
        const onLengthChange = jest.fn();
        const { editor } = renderPlugin({ onLengthChange, ignoreTrailingWhitespace });

        setNodes(editor, () => [$createTextNode('Hello  '), $createLineBreakNode(), $createLineBreakNode()]);

        expect(onLengthChange).toHaveBeenLastCalledWith(expected);
    });

    it('does not limit the text when max length enforcement is disabled', () => {
        const { editor } = renderPlugin({ maxLength: 3, enforceMaxLength: false });
        setNodes(editor, () => [$createTextNode('abc')]);

        act(() => {
            placeCaret(editor, 3);
            typeText(editor, 'd');
        });

        expect(getText(editor)).toBe('abcd');
    });

    it('limits the text when max length enforcement is enabled', () => {
        const { editor } = renderPlugin({ maxLength: 3 });
        setNodes(editor, () => [$createTextNode('abc')]);

        act(() => {
            placeCaret(editor, 3);
            typeText(editor, 'd');
        });

        expect(getText(editor)).toBe('abc');
    });
});
