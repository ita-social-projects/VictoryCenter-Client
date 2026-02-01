import { useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $generateHtmlFromNodes } from '@lexical/html';
import { sanitizeHtml } from './htmlSanitizer';

export interface OnChangePluginProps {
    onChange: (html: string) => void;
}

export const OnChangePlugin = ({ onChange }: OnChangePluginProps) => {
    const [editor] = useLexicalComposerContext();

    useEffect(() => {
        return editor.registerUpdateListener(({ editorState }) => {
            editorState.read(() => {
                const rawHtml = $generateHtmlFromNodes(editor);
                const cleanHtml = sanitizeHtml(rawHtml);
                onChange(cleanHtml);
            });
        });
    }, [editor, onChange]);

    return null;
};
