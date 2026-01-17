import { useEffect, useRef } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $generateNodesFromDOM } from '@lexical/html';
import { $getRoot, $insertNodes } from 'lexical';

export interface InitialValuePluginProps {
    value: string;
}

export const InitialValuePlugin = ({ value }: InitialValuePluginProps) => {
    const [editor] = useLexicalComposerContext();
    const isFirstRender = useRef(true);
    const lastValue = useRef(value);

    useEffect(() => {
        if (isFirstRender.current || lastValue.current !== value) {
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
        }
    }, [editor, value]);

    return null;
};
