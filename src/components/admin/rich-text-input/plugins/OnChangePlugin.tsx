import { useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $generateHtmlFromNodes } from '@lexical/html';
import DOMPurify from 'dompurify';

export interface OnChangePluginProps {
    onChange: (html: string) => void;
}

const sanitizeHtml = (html: string): string => {
    if (!html) return '';

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;

    tempDiv.querySelectorAll('[class]').forEach((el) => {
        el.removeAttribute('class');
    });

    tempDiv.querySelectorAll('[style]').forEach((el) => {
        el.removeAttribute('style');
    });

    tempDiv.querySelectorAll('b > strong').forEach((strong) => {
        const bTag = strong.parentElement;
        if (bTag && bTag.tagName === 'B') {
            bTag.replaceWith(strong);
        }
    });

    tempDiv.querySelectorAll('i > em').forEach((em) => {
        const iTag = em.parentElement;
        if (iTag && iTag.tagName === 'I') {
            iTag.replaceWith(em);
        }
    });

    tempDiv.querySelectorAll('span').forEach((span) => {
        if (!span.hasAttribute('style') && !span.hasAttribute('class')) {
            const parent = span.parentNode;
            while (span.firstChild) {
                parent?.insertBefore(span.firstChild, span);
            }
            span.remove();
        }
    });

    const cleanHtml = DOMPurify.sanitize(tempDiv.innerHTML, {
        ALLOWED_TAGS: ['p', 'strong', 'em', 'b', 'i', 'br'],
        ALLOWED_ATTR: [],
    });

    return cleanHtml;
};

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
