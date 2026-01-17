import { useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getRoot, $getSelection, $isRangeSelection, RootNode } from 'lexical';
import { trimTextContentFromAnchor } from '@lexical/selection';

export interface MaxLengthPluginProps {
    maxLength: number;
    onLengthChange?: (length: number) => void;
}

export const MaxLengthPlugin = ({ maxLength, onLengthChange }: MaxLengthPluginProps) => {
    const [editor] = useLexicalComposerContext();

    useEffect(() => {
        return editor.registerNodeTransform(RootNode, (rootNode: RootNode) => {
            const selection = $getSelection();
            if (!$isRangeSelection(selection) || !selection.isCollapsed()) {
                return;
            }

            const prevTextContent = editor.getEditorState().read(() => $getRoot().getTextContent());
            const currentTextContent = rootNode.getTextContent();

            onLengthChange?.(currentTextContent.length);

            if (prevTextContent !== currentTextContent) {
                const textLength = currentTextContent.length;

                if (textLength > maxLength) {
                    const overflowLength = textLength - maxLength;
                    trimTextContentFromAnchor(editor, selection.anchor, overflowLength);
                }
            }
        });
    }, [editor, maxLength, onLengthChange]);

    return null;
};
