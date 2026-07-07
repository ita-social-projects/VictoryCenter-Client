import { useState, useCallback, useMemo, useRef } from 'react';
import cn from 'classnames';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { $generateNodesFromDOM } from '@lexical/html';
import { $getRoot, $insertNodes, LexicalEditor } from 'lexical';
import { ReactComponent as RemoveIcon } from '@/assets/icons/remove-query.svg';
import styles from './RichTextInput.module.scss';
import {
    MaxLengthPlugin,
    OnChangePlugin,
    FocusPlugin,
    ToolbarPlugin,
    InitialValuePlugin,
    EnterKeyPlugin,
    EditablePlugin,
} from './plugins';

export interface RichTextInputProps {
    value: string;
    onChange: (value: string) => void;
    onBlur?: () => void;
    onFocus?: () => void;
    name: string;
    id: string;
    maxLength: number;
    disabled?: boolean;
    hideToolbar?: boolean;
    placeholder?: string;
    className?: string;
    hasError?: boolean;
    /**
     * If true, automatically trims leading and trailing whitespace from the editor's
     * text content when the input loses focus.
     */
    trimOnBlur?: boolean;
}

const theme = {
    paragraph: styles.paragraph,
    text: {
        bold: styles['text-bold'],
        italic: styles['text-italic'],
    },
};

const EMPTY_HTML = '<p><br></p>';

const isEditorEmpty = (value: string) => !value || value === EMPTY_HTML;

export const RichTextInput = ({
    value,
    onChange,
    onBlur,
    onFocus,
    id,
    maxLength,
    disabled = false,
    hideToolbar = false,
    placeholder = 'Enter text...',
    className,
    hasError = false,
    trimOnBlur = false,
}: RichTextInputProps) => {
    const [isFocused, setIsFocused] = useState(false);
    const [currentLength, setCurrentLength] = useState(0);

    const handleFocusChange = useCallback((focused: boolean) => {
        setIsFocused(focused);
    }, []);

    const handleLengthChange = useCallback((length: number) => {
        setCurrentLength(length);
    }, []);

    const showClearButton = isFocused && !isEditorEmpty(value) && !disabled;

    const initialValueRef = useRef(value);

    const initialConfig = useMemo(
        () => ({
            namespace: 'RichTextInput-' + id,
            theme,
            onError: () => {},
            editable: !disabled,
            editorState: (editor: LexicalEditor) => {
                if (initialValueRef.current) {
                    const parser = new DOMParser();
                    const dom = parser.parseFromString(initialValueRef.current, 'text/html');
                    const nodes = $generateNodesFromDOM(editor, dom);
                    const root = $getRoot();
                    root.clear();
                    $insertNodes(nodes);
                }
            },
        }),
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
                <ToolbarPlugin disabled={disabled} hidden={hideToolbar} />
                <div className={styles['editor-container']}>
                    <RichTextPlugin
                        contentEditable={
                            <ContentEditable
                                id={id}
                                className={cn(styles.field, className)}
                                aria-label="Rich text editor"
                                aria-disabled={disabled}
                                tabIndex={disabled ? -1 : undefined}
                            />
                        }
                        placeholder={<div className={styles.placeholder}>{placeholder}</div>}
                        ErrorBoundary={LexicalErrorBoundary}
                    />
                </div>
                <HistoryPlugin />
                <OnChangePlugin onChange={onChange} />
                <MaxLengthPlugin maxLength={maxLength} onLengthChange={handleLengthChange} />
                <FocusPlugin
                    onFocus={onFocus}
                    onBlur={onBlur}
                    onFocusChange={handleFocusChange}
                    trimOnBlur={trimOnBlur}
                />
                <InitialValuePlugin value={value} />
                <EditablePlugin disabled={disabled} />
                <EnterKeyPlugin />
            </LexicalComposer>
            <div className={styles.footer}>
                <button
                    type="button"
                    className={cn(styles['clear-button'], {
                        [styles['clear-button--hidden']]: !showClearButton,
                        [styles['clear-button--error']]: hasError,
                    })}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => onChange(EMPTY_HTML)}
                    aria-label="Clear input"
                    tabIndex={showClearButton ? 0 : -1}
                    disabled={!showClearButton}
                >
                    <RemoveIcon />
                </button>
                <output className={styles.counter}>
                    {currentLength}/{maxLength}
                </output>
            </div>
        </div>
    );
};
