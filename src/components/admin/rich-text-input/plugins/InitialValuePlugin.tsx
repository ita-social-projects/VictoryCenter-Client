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
    const isInternalUpdate = useRef(false);

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            lastValue.current = value;

            editor.update(() => {
                const root = $getRoot();

                const parser = new DOMParser();
                const dom = parser.parseFromString(value || '<p></p>', 'text/html');
                const nodes = $generateNodesFromDOM(editor, dom);

                root.clear();
                $insertNodes(nodes);
            });
            return;
        }

        // Skip if value hasn't changed
        if (lastValue.current === value) {
            return;
        }

        // Skip if this is an internal update from OnChangePlugin
        if (isInternalUpdate.current) {
            isInternalUpdate.current = false;
            lastValue.current = value;
            return;
        }

        // Check if the incoming value matches current editor content
        // This prevents cursor jumping when OnChangePlugin triggers a state update
        const currentHtmlRaw = editor.getEditorState().read(() => {
            return $generateHtmlFromNodes(editor);
        });

        // CRITICAL: Sanitize currentHtml the same way OnChangePlugin does
        // Otherwise they'll never match (raw spaces vs &nbsp; entities)
        const currentHtmlSanitized = sanitizeHtml(currentHtmlRaw);

        // Normalize both HTMLs for comparison (remove insignificant whitespace differences)
        const normalizeHtml = (html: string) => html.replace(/>\s+</g, '><').trim();

        if (normalizeHtml(currentHtmlSanitized) === normalizeHtml(value)) {
            // Content is the same, just update the ref without touching the editor
            lastValue.current = value;
            return;
        }

        // Content is different (external change), update the editor
        lastValue.current = value;
        isInternalUpdate.current = true;

        editor.update(() => {
            const root = $getRoot();

            const parser = new DOMParser();
            const dom = parser.parseFromString(value || '<p></p>', 'text/html');
            const nodes = $generateNodesFromDOM(editor, dom);

            root.clear();
            $insertNodes(nodes);
        });
    }, [editor, value]);

    return null;
};
