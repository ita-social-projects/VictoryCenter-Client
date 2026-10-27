import { useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
    $getSelection,
    $isElementNode,
    $isRangeSelection,
    $isTextNode,
    ElementNode,
    LexicalEditor,
    LexicalNode,
    RangeSelection,
    RootNode,
    TextNode,
} from 'lexical';
import { $getRichTextContent } from '@/utils/functions/rich-text-content/rich-text-content';

export interface MaxLengthPluginProps {
    maxLength: number;
    onLengthChange?: (length: number) => void;
    enforceMaxLength?: boolean;
    /** If true, trailing whitespace is not counted in the reported length. */
    ignoreTrailingWhitespace?: boolean;
}

const $getNodeBeforeCaret = (selection: RangeSelection): LexicalNode | null => {
    const { anchor } = selection;
    if (anchor.type === 'element') {
        return anchor.offset > 0 ? (anchor.getNode() as ElementNode).getChildAtIndex(anchor.offset - 1) : null;
    }

    const textNode = anchor.getNode() as TextNode;
    return anchor.offset === textNode.getTextContentSize() ? textNode : textNode.getPreviousSibling();
};

const $removeCharactersBeforeCaret = (selection: RangeSelection, count: number) => {
    const { anchor } = selection;
    let remaining = count;

    if (anchor.type === 'text' && anchor.offset > 0) {
        const textNode = anchor.getNode() as TextNode;
        if (anchor.offset < textNode.getTextContentSize()) {
            const removedCount = Math.min(anchor.offset, remaining);
            textNode.spliceText(anchor.offset - removedCount, removedCount, '', true);
            remaining -= removedCount;
        }
    }

    let node = remaining > 0 ? $getNodeBeforeCaret(selection) : null;
    while (remaining > 0 && node !== null) {
        if ($isElementNode(node) && !node.isEmpty()) {
            node = node.getLastDescendant();
            continue;
        }

        const previous = node.getPreviousSibling();
        const size = node.getTextContentSize();

        if ($isTextNode(node) && size > remaining) {
            node.spliceText(size - remaining, remaining, '', node.getKey() === anchor.key);
            remaining = 0;
        } else {
            node.remove();
            remaining -= size;
        }
        node = previous;
    }
};

export const registerMaxLength = (editor: LexicalEditor, maxLength: number) =>
    editor.registerNodeTransform(RootNode, () => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection) || !selection.isCollapsed()) {
            return;
        }

        const previousLength = editor.getEditorState().read($getRichTextContent).length;
        const overflowLength = $getRichTextContent().length - Math.max(maxLength, previousLength);

        if (overflowLength > 0) {
            $removeCharactersBeforeCaret(selection, overflowLength);
        }
    });

export const MaxLengthPlugin = ({
    maxLength,
    onLengthChange,
    enforceMaxLength = true,
    ignoreTrailingWhitespace = false,
}: MaxLengthPluginProps) => {
    const [editor] = useLexicalComposerContext();

    useEffect(() => {
        return editor.registerUpdateListener(({ editorState }) => {
            editorState.read(() => {
                const text = $getRichTextContent();
                onLengthChange?.((ignoreTrailingWhitespace ? text.trimEnd() : text).length);
            });
        });
    }, [editor, onLengthChange, ignoreTrailingWhitespace]);

    useEffect(() => {
        if (!enforceMaxLength) return;
        return registerMaxLength(editor, maxLength);
    }, [editor, enforceMaxLength, maxLength]);

    return null;
};
