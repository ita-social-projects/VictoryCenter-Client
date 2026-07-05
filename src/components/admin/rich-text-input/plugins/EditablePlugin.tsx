import { useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';

interface EditablePluginProps {
    disabled: boolean;
}

export const EditablePlugin = ({ disabled }: EditablePluginProps) => {
    const [editor] = useLexicalComposerContext();

    useEffect(() => {
        editor.setEditable(!disabled);
    }, [disabled, editor]);

    return null;
};
