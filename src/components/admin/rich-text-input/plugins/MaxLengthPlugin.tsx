import { useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getRoot, $getSelection, $isRangeSelection, RootNode } from 'lexical';
import { trimTextContentFromAnchor } from '@lexical/selection';

export interface MaxLengthPluginProps {
    maxLength: number;
    onLengthChange?: (length: number) => void;
    enforceMaxLength?: boolean;
    /** If true, trailing whitespace is not counted in the reported length. */
    ignoreTrailingWhitespace?: boolean;
}

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
                const text = $getRoot().getTextContent();
                onLengthChange?.((ignoreTrailingWhitespace ? text.trimEnd() : text).length);
            });
        });
    }, [editor, onLengthChange, ignoreTrailingWhitespace]);

    useEffect(() => {
        return editor.registerNodeTransform(RootNode, (rootNode: RootNode) => {
            const selection = $getSelection();
            if (!$isRangeSelection(selection) || !selection.isCollapsed()) {
                return;
            }

            const prevTextContent = editor.getEditorState().read(() => $getRoot().getTextContent());
            const currentTextContent = rootNode.getTextContent();

            if (prevTextContent !== currentTextContent) {
                const textLength = currentTextContent.length;

                if (enforceMaxLength && textLength > maxLength) {
                    const overflowLength = textLength - maxLength;
                    trimTextContentFromAnchor(editor, selection.anchor, overflowLength);
                }
            }
        });
    }, [editor, enforceMaxLength, maxLength]);

    return null;
};
