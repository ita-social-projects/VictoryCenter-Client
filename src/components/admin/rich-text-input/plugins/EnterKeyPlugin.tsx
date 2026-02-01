import { useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { KEY_ENTER_COMMAND, COMMAND_PRIORITY_HIGH, $getSelection, $isRangeSelection } from 'lexical';
import { $insertNodes, LineBreakNode } from 'lexical';

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

                // Prevent the default behavior only for Enter without Shift
                // Let Shift+Enter work as default (it also inserts line breaks)
                if (event.shiftKey) {
                    return false;
                }

                event.preventDefault();

                // Insert a line break node
                selection.insertNodes([new LineBreakNode()]);

                return true;
            },
            COMMAND_PRIORITY_HIGH,
        );

        return unregister;
    }, [editor]);

    return null;
};
