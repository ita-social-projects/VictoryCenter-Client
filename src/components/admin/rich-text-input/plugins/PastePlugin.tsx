import { useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $generateNodesFromDOM } from '@lexical/html';
import {
    $addUpdateTag,
    $createLineBreakNode,
    $getSelection,
    $isElementNode,
    $isRangeSelection,
    COMMAND_PRIORITY_HIGH,
    ElementNode,
    LexicalEditor,
    LexicalNode,
    PASTE_COMMAND,
    PASTE_TAG,
} from 'lexical';

const $isBlockNode = (node: LexicalNode | undefined): node is ElementNode => $isElementNode(node) && !node.isInline();

const $toInlineNodes = (nodes: LexicalNode[]): LexicalNode[] =>
    nodes.flatMap((node, index) => {
        const lineBreak =
            index > 0 && ($isBlockNode(node) || $isBlockNode(nodes[index - 1])) ? [$createLineBreakNode()] : [];
        return [...lineBreak, ...($isBlockNode(node) ? $toInlineNodes(node.getChildren()) : [node])];
    });

export const registerPaste = (editor: LexicalEditor) =>
    editor.registerCommand(
        PASTE_COMMAND,
        (event) => {
            const selection = $getSelection();
            const clipboardData = 'clipboardData' in event ? event.clipboardData : null;
            const html = clipboardData?.getData('text/html');
            const text = clipboardData?.getData('text/plain');

            if (!$isRangeSelection(selection) || (!html && !text)) {
                return false;
            }

            event.preventDefault();
            $addUpdateTag(PASTE_TAG);

            if (html && html !== text) {
                const dom = new DOMParser().parseFromString(html, 'text/html');
                selection.insertNodes($toInlineNodes($generateNodesFromDOM(editor, dom)));
            } else if (text) {
                selection.insertRawText(text);
            }

            return true;
        },
        COMMAND_PRIORITY_HIGH,
    );

export const PastePlugin = () => {
    const [editor] = useLexicalComposerContext();

    useEffect(() => registerPaste(editor), [editor]);

    return null;
};
