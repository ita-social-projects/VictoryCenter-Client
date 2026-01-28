import { useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { BLUR_COMMAND, COMMAND_PRIORITY_LOW, FOCUS_COMMAND } from 'lexical';

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
