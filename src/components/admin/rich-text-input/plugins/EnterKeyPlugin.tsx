import { useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { KEY_ENTER_COMMAND, COMMAND_PRIORITY_HIGH, $getSelection, $isRangeSelection } from 'lexical';
import { LineBreakNode } from 'lexical';

export const EnterKeyPlugin = () => {
    const [editor] = useLexicalComposerContext();

    useEffect(() => {
        const unregister = editor.registerCommand(
            KEY_ENTER_COMMAND,
            (event) => {
                const selection = $getSelection();

                if (!$isRangeSelection(selection)) {
                    return false;
                }

                if (event === null) {
                    return false;
                }

                if (event.shiftKey) {
                    return false;
                }

                event.preventDefault();

                selection.insertNodes([new LineBreakNode()]);

                return true;
            },
            COMMAND_PRIORITY_HIGH,
        );

        return unregister;
    }, [editor]);

    return null;
};
