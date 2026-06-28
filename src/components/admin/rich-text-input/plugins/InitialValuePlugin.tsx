import { useEffect, useRef } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $generateNodesFromDOM, $generateHtmlFromNodes } from '@lexical/html';
import { $getRoot, $insertNodes } from 'lexical';
import { sanitizeHtml } from './htmlSanitizer';

export interface InitialValuePluginProps {
    value: string;
}

export const InitialValuePlugin = ({ value }: InitialValuePluginProps) => {
    const [editor] = useLexicalComposerContext();
    const isFirstRender = useRef(true);
    const lastValue = useRef(value);

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            lastValue.current = value;
            return;
        }

        if (lastValue.current === value) {
            return;
        }

        const currentHtmlRaw = editor.getEditorState().read(() => {
            return $generateHtmlFromNodes(editor);
        });

        const currentHtmlSanitized = sanitizeHtml(currentHtmlRaw);

        const normalizeHtml = (html: string) => html.replace(/>\s+</g, '><').trim();

        const nextHtml = sanitizeHtml(value);

        if (normalizeHtml(currentHtmlSanitized) === normalizeHtml(nextHtml)) {
            lastValue.current = value;
            return;
        }

        lastValue.current = value;

        editor.update(() => {
            const root = $getRoot();

            const parser = new DOMParser();
            const dom = parser.parseFromString(nextHtml, 'text/html');
            const nodes = $generateNodesFromDOM(editor, dom);

            root.clear();
            $insertNodes(nodes);
        });
    }, [editor, value]);

    return null;
};
