import { useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { BLUR_COMMAND, COMMAND_PRIORITY_LOW, FOCUS_COMMAND, $getRoot, TextNode } from 'lexical';

export interface FocusPluginProps {
    onFocus?: () => void;
    onBlur?: () => void;
    onFocusChange?: (isFocused: boolean) => void;
}

export const FocusPlugin = ({ onFocus, onBlur, onFocusChange }: FocusPluginProps) => {
    const [editor] = useLexicalComposerContext();

    useEffect(() => {
        const unregisterFocus = editor.registerCommand(
            FOCUS_COMMAND,
            () => {
                onFocus?.();
                onFocusChange?.(true);
                return false;
            },
            COMMAND_PRIORITY_LOW,
        );

        const unregisterBlur = editor.registerCommand(
            BLUR_COMMAND,
            () => {
                editor.update(() => {
                    const root = $getRoot();
                    const textNodes = root.getAllTextNodes() as TextNode[];

                    if (textNodes.length === 0) return;

                    const first = textNodes[0];
                    const firstText = first.getTextContent();
                    const trimmedFirst = firstText.replace(/^ +/, '');
                    if (trimmedFirst !== firstText) {
                        first.setTextContent(trimmedFirst);
                    }
                    const last = textNodes[textNodes.length - 1];
                    const lastText = last.getTextContent();
                    const trimmedLast = lastText.replace(/ +$/, '');
                    if (trimmedLast !== lastText) {
                        last.setTextContent(trimmedLast);
                    }
                });

                onBlur?.();
                onFocusChange?.(false);
                return false;
            },
            COMMAND_PRIORITY_LOW,
        );

        return () => {
            unregisterFocus();
            unregisterBlur();
        };
    }, [editor, onFocus, onBlur, onFocusChange]);

    return null;
};
