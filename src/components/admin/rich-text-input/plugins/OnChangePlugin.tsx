import { useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $generateHtmlFromNodes } from '@lexical/html';
import DOMPurify from 'dompurify';

export interface OnChangePluginProps {
    onChange: (html: string) => void;
}

/**
 * Sanitizes HTML from Lexical editor output.
 * Removes CSS module class names, unnecessary styles, and ensures clean portable HTML.
 */
const sanitizeHtml = (html: string): string => {
    if (!html) return '';

    // First pass: Use DOM to clean up the HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;

    // Remove all class attributes (CSS module hashes are environment-specific)
    tempDiv.querySelectorAll('[class]').forEach((el) => {
        el.removeAttribute('class');
    });

    // Remove style attributes (white-space: pre-wrap, etc.)
    tempDiv.querySelectorAll('[style]').forEach((el) => {
        el.removeAttribute('style');
    });

    // Remove redundant <b> tags that wrap <strong> tags
    tempDiv.querySelectorAll('b > strong').forEach((strong) => {
        const bTag = strong.parentElement;
        if (bTag && bTag.tagName === 'B') {
            bTag.replaceWith(strong);
        }
    });

    // Remove redundant <i> tags that wrap <em> tags
    tempDiv.querySelectorAll('i > em').forEach((em) => {
        const iTag = em.parentElement;
        if (iTag && iTag.tagName === 'I') {
            iTag.replaceWith(em);
        }
    });

    // Unwrap span tags that have no attributes (but preserve their content including whitespace)
    tempDiv.querySelectorAll('span').forEach((span) => {
        if (!span.hasAttribute('style') && !span.hasAttribute('class')) {
            const parent = span.parentNode;
            while (span.firstChild) {
                parent?.insertBefore(span.firstChild, span);
            }
            span.remove();
        }
    });

    // Second pass: DOMPurify for security (XSS protection)
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
