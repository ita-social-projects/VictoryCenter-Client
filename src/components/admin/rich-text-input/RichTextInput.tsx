import React, { useState, useEffect, useRef, useCallback } from 'react';
import classNames from 'classnames';
import './RichTextInput.scss';

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

export const getPlainTextFromHtml = (html: string): string => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    return tempDiv.innerText || tempDiv.textContent || '';
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
    const [isBold, setIsBold] = useState(false);
    const [isItalic, setIsItalic] = useState(false);
    const [currentLength, setCurrentLength] = useState(0);
    const editorRef = useRef<HTMLDivElement>(null);
    const isInitialMount = useRef(true);

    const getTextLength = (): number => {
        if (!editorRef.current) return 0;
        const text = editorRef.current.innerText || editorRef.current.textContent || '';
        return text.replace(/\n/g, '').length;
    };

    const updateLength = useCallback(() => {
        setCurrentLength(getTextLength());
    }, []);

    useEffect(() => {
        if (editorRef.current) {
            const currentHtml = editorRef.current.innerHTML;
            if (value !== currentHtml) {
                editorRef.current.innerHTML = value || '';
                updateLength();
            }
        }
    }, [value, updateLength]);

    useEffect(() => {
        if (isInitialMount.current && editorRef.current) {
            updateLength();
            isInitialMount.current = false;
        }
    }, [updateLength]);

    const handleInput = () => {
        const textLength = getTextLength();

        if (textLength > maxLength) {
            if (editorRef.current) {
                editorRef.current.innerHTML = value;
                const range = document.createRange();
                const sel = window.getSelection();
                if (editorRef.current.lastChild) {
                    range.setStartAfter(editorRef.current.lastChild);
                    range.collapse(true);
                    sel?.removeAllRanges();
                    sel?.addRange(range);
                }
            }
            updateLength();
            return;
        }

        if (editorRef.current) {
            const newHtml = editorRef.current.innerHTML;
            onChange(newHtml);
            updateLength();
        }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
        e.preventDefault();
        const text = e.clipboardData.getData('text/plain');
        const currentTextLength = getTextLength();
        const availableSpace = maxLength - currentTextLength;

        if (availableSpace <= 0) return;

        const textToInsert = text.slice(0, availableSpace);
        document.execCommand('insertText', false, textToInsert);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
            e.preventDefault();
            formatBold();
            return;
        }

        if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
            e.preventDefault();
            formatItalic();
            return;
        }

        if (e.key === 'Enter') {
            e.preventDefault();
            insertLineBreak();
            return;
        }

        const textLength = getTextLength();
        if (textLength >= maxLength) {
            const allowedKeys = [
                'Backspace',
                'Delete',
                'ArrowLeft',
                'ArrowRight',
                'ArrowUp',
                'ArrowDown',
                'Home',
                'End',
            ];
            const isCtrlKey = e.ctrlKey || e.metaKey;
            const isAllowedCtrl = isCtrlKey && ['a', 'c', 'x', 'z', 'y', 'b', 'i'].includes(e.key.toLowerCase());

            if (!allowedKeys.includes(e.key) && !isAllowedCtrl) {
                e.preventDefault();
            }
        }
    };

    const updateFormatStates = () => {
        setIsBold(document.queryCommandState('bold'));
        setIsItalic(document.queryCommandState('italic'));
    };

    const handleFocus = () => {
        setIsFocused(true);
        onFocus?.();
        updateFormatStates();
        updateLength();
    };

    const handleBlur = () => {
        setIsFocused(false);
        onBlur?.();
    };

    const handleMouseUp = () => {
        updateFormatStates();
    };

    const handleKeyUp = () => {
        updateFormatStates();
    };

    const formatBold = () => {
        document.execCommand('bold', false);
        updateFormatStates();
        editorRef.current?.focus();
        if (editorRef.current) {
            onChange(editorRef.current.innerHTML);
            updateLength();
        }
    };

    const formatItalic = () => {
        document.execCommand('italic', false);
        updateFormatStates();
        editorRef.current?.focus();
        if (editorRef.current) {
            onChange(editorRef.current.innerHTML);
            updateLength();
        }
    };

    const insertLineBreak = () => {
        const textLength = getTextLength();
        if (textLength >= maxLength) return;

        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return;

        const range = selection.getRangeAt(0);
        range.deleteContents();

        const br = document.createElement('br');
        range.insertNode(br);

        const textNode = document.createTextNode('\u200B');
        br.parentNode?.insertBefore(textNode, br.nextSibling);

        range.setStart(textNode, 1);
        range.setEnd(textNode, 1);
        range.collapse(true);

        selection.removeAllRanges();
        selection.addRange(range);

        editorRef.current?.focus();
        if (editorRef.current) {
            onChange(editorRef.current.innerHTML);
            updateLength();
        }
    };

    return (
        <div
            className={classNames('rich-text-input', {
                'rich-text-input--disabled': disabled,
                'rich-text-input--focused': isFocused && !disabled,
            })}
        >
            <div className="rich-text-input__toolbar">
                <button
                    type="button"
                    className={classNames('rich-text-input__toolbar-btn', {
                        'rich-text-input__toolbar-btn--active': isBold,
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
                    className={classNames('rich-text-input__toolbar-btn', {
                        'rich-text-input__toolbar-btn--active': isItalic,
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
                    className="rich-text-input__toolbar-btn"
                    onClick={insertLineBreak}
                    disabled={disabled}
                    aria-label="Line break"
                    title="Line break"
                >
                    ↵
                </button>
            </div>
            <div className="rich-text-input__editor-container">
                <div
                    ref={editorRef}
                    id={id}
                    className={classNames('rich-text-input__field', className)}
                    contentEditable={!disabled}
                    onInput={handleInput}
                    onPaste={handlePaste}
                    onKeyDown={handleKeyDown}
                    onKeyUp={handleKeyUp}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    onMouseUp={handleMouseUp}
                    data-placeholder={placeholder}
                    aria-label="Rich text editor"
                    suppressContentEditableWarning
                />
            </div>
            <output className="rich-text-input__counter">
                {currentLength}/{maxLength}
            </output>
        </div>
    );
};
