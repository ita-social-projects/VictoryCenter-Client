import { useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getRoot, $getSelection, $isRangeSelection, RootNode, COMMAND_PRIORITY_HIGH, PASTE_COMMAND } from 'lexical';
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
        if (!enforceMaxLength) return;

        const removePasteListener = editor.registerCommand(
            PASTE_COMMAND,
            (event: ClipboardEvent | KeyboardEvent | null) => {
                const clipboardData = (event as ClipboardEvent)?.clipboardData;
                if (!clipboardData) return false;

                const clipboardText = clipboardData.getData('text/plain');
                if (!clipboardText) return false;

                let handled = false;

                editor.getEditorState().read(() => {
                    const selection = $getSelection();

                    if (!$isRangeSelection(selection)) {
                        return;
                    }

                    const currentLength = $getRoot().getTextContent().length;
                    const selectedLength = selection.getTextContent().length;
                    const availableSpace = Math.max(0, maxLength - currentLength + selectedLength);

                    if (clipboardText.length > availableSpace) {
                        event?.preventDefault();
                        const textToInsert = clipboardText.slice(0, availableSpace);

                        editor.update(() => {
                            const currentSelection = $getSelection();
                            if ($isRangeSelection(currentSelection)) {
                                currentSelection.insertText(textToInsert);
                            }
                        });
                        handled = true;
                    }
                });

                return handled;
            },
            COMMAND_PRIORITY_HIGH,
        );

        const removeTransformListener = editor.registerNodeTransform(RootNode, (rootNode: RootNode) => {
            const selection = $getSelection();
            if (!$isRangeSelection(selection) || !selection.isCollapsed()) {
                return;
            }

            const prevTextContent = editor.getEditorState().read(() => $getRoot().getTextContent());
            const currentTextContent = rootNode.getTextContent();

            if (prevTextContent !== currentTextContent) {
                const textLength = currentTextContent.length;

                if (textLength > maxLength) {
                    const overflowLength = textLength - maxLength;
                    trimTextContentFromAnchor(editor, selection.anchor, overflowLength);
                }
            }
        });

        return () => {
            removePasteListener();
            removeTransformListener();
        };
    }, [editor, enforceMaxLength, maxLength]);

    return null;
};
