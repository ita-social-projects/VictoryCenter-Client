import { useState, useCallback, useMemo } from 'react';
import cn from 'classnames';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { $generateNodesFromDOM } from '@lexical/html';
import { $getRoot, $insertNodes, LexicalEditor } from 'lexical';
import styles from './RichTextInput.module.scss';
import { MaxLengthPlugin, OnChangePlugin, FocusPlugin, ToolbarPlugin, InitialValuePlugin } from './plugins';

export interface RichTextInputProps {
    value: string;
    onChange: (value: string) => void;
    onBlur?: () => void;
    onFocus?: () => void;
    name: string;
    id: string;
    maxLength: number;
    disabled?: boolean;
    placeholder?: string;
    className?: string;
}

const theme = {
    paragraph: styles.paragraph,
    text: {
        bold: styles.textBold,
        italic: styles.textItalic,
    },
};

export const RichTextInput = ({
    value,
    onChange,
    onBlur,
    onFocus,
    id,
    maxLength,
    disabled = false,
    placeholder = 'Enter text...',
    className,
}: RichTextInputProps) => {
    const [isFocused, setIsFocused] = useState(false);
    const [currentLength, setCurrentLength] = useState(0);

    const handleFocusChange = useCallback((focused: boolean) => {
        setIsFocused(focused);
    }, []);

    const handleLengthChange = useCallback((length: number) => {
        setCurrentLength(length);
    }, []);

    const initialConfig = useMemo(
        () => ({
            namespace: 'RichTextInput-' + id,
            theme,
            // eslint-disable-next-line no-console
            onError: (error: Error) => console.error('Lexical error:', error),
            editable: !disabled,
            editorState: (editor: LexicalEditor) => {
                if (value) {
                    const parser = new DOMParser();
                    const dom = parser.parseFromString(value, 'text/html');
                    const nodes = $generateNodesFromDOM(editor, dom);
                    const root = $getRoot();
                    root.clear();
                    $insertNodes(nodes);
                }
            },
        }),
        // Only use id for initial config - value changes handled by plugin
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [id, disabled],
    );

    return (
        <div
            className={cn(styles.root, {
                [styles['root--disabled']]: disabled,
                [styles['root--focused']]: isFocused && !disabled,
            })}
        >
            <LexicalComposer initialConfig={initialConfig}>
                <ToolbarPlugin disabled={disabled} />
                <div className={styles.editorContainer}>
                    <RichTextPlugin
                        contentEditable={
                            <ContentEditable
                                id={id}
                                className={cn(styles.field, className)}
                                aria-label="Rich text editor"
                            />
                        }
                        placeholder={<div className={styles.placeholder}>{placeholder}</div>}
                        ErrorBoundary={LexicalErrorBoundary}
                    />
                </div>
                <HistoryPlugin />
                <OnChangePlugin onChange={onChange} />
                <MaxLengthPlugin maxLength={maxLength} onLengthChange={handleLengthChange} />
                <FocusPlugin onFocus={onFocus} onBlur={onBlur} onFocusChange={handleFocusChange} />
                <InitialValuePlugin value={value} />
            </LexicalComposer>
            <output className={styles.counter}>
                {currentLength}/{maxLength}
            </output>
        </div>
    );
};
