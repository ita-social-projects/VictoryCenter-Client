import { useEffect, useRef } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $generateHtmlFromNodes } from '@lexical/html';
import { sanitizeHtml } from './htmlSanitizer';

export interface OnChangePluginProps {
    onChange: (html: string) => void;
}

export const OnChangePlugin = ({ onChange }: OnChangePluginProps) => {
    const [editor] = useLexicalComposerContext();
    const isFirstRender = useRef(true);

    useEffect(() => {
        return editor.registerUpdateListener(({ editorState, dirtyElements, dirtyLeaves }) => {
            if (isFirstRender.current) {
                isFirstRender.current = false;
                return;
            }
            if (dirtyElements.size === 0 && dirtyLeaves.size === 0) return;

            editorState.read(() => {
                const rawHtml = $generateHtmlFromNodes(editor);
                const cleanHtml = sanitizeHtml(rawHtml);
                onChange(cleanHtml);
            });
        });
    }, [editor, onChange]);

    return null;
};
