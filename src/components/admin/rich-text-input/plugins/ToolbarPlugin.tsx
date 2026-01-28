import { useCallback, useEffect, useState } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
    $getSelection,
    $isRangeSelection,
    FORMAT_TEXT_COMMAND,
    SELECTION_CHANGE_COMMAND,
    COMMAND_PRIORITY_CRITICAL,
    $createLineBreakNode,
} from 'lexical';
import cn from 'classnames';
import styles from '../RichTextInput.module.scss';

export interface ToolbarPluginProps {
    disabled?: boolean;
}

export const ToolbarPlugin = ({ disabled = false }: ToolbarPluginProps) => {
    const [editor] = useLexicalComposerContext();
    const [isBold, setIsBold] = useState(false);
    const [isItalic, setIsItalic] = useState(false);

    const updateToolbar = useCallback(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
            setIsBold(selection.hasFormat('bold'));
            setIsItalic(selection.hasFormat('italic'));
        }
    }, []);

    useEffect(() => {
        return editor.registerCommand(
            SELECTION_CHANGE_COMMAND,
            () => {
                updateToolbar();
                return false;
            },
            COMMAND_PRIORITY_CRITICAL,
        );
    }, [editor, updateToolbar]);

    useEffect(() => {
        return editor.registerUpdateListener(({ editorState }) => {
            editorState.read(() => {
                updateToolbar();
            });
        });
    }, [editor, updateToolbar]);

    const formatBold = useCallback(() => {
        editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold');
    }, [editor]);

    const formatItalic = useCallback(() => {
        editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic');
    }, [editor]);

    const insertLineBreak = useCallback(() => {
        editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
                selection.insertNodes([$createLineBreakNode()]);
            }
        });
    }, [editor]);

    return (
        <div className={styles.toolbar}>
            <button
                type="button"
                className={cn(styles['toolbar-btn'], {
                    [styles['toolbar-btn-active']]: isBold,
                })}
                onClick={formatBold}
                disabled={disabled}
                aria-label="Bold"
                title="Bold (Ctrl+B)"
            >
                <strong>B</strong>
            </button>
            <button
                type="button"
                className={cn(styles['toolbar-btn'], {
                    [styles['toolbar-btn-active']]: isItalic,
                })}
                onClick={formatItalic}
                disabled={disabled}
                aria-label="Italic"
                title="Italic (Ctrl+I)"
            >
                <em>I</em>
            </button>
            <button
                type="button"
                className={styles['toolbar-btn']}
                onClick={insertLineBreak}
                disabled={disabled}
                aria-label="Line break"
                title="Line break"
            >
                ↵
            </button>
        </div>
    );
};
