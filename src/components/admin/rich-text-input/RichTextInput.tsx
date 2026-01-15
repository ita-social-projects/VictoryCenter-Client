import React, { useState, useEffect, useRef, useCallback } from 'react';
import cn from 'classnames';
import styles from './RichTextInput.module.scss';
import { getTextLengthFromHtml } from '@/utils/functions/get-text-length-from-html/get-text-length-from-html';

export interface RichTextInputProps {
    value: string;
    onChange: (value: string) => void;
    onBlur?: () => void;
    onFocus?: () => void;
    id: string;
    maxLength: number;
    disabled?: boolean;
    placeholder?: string;
    className?: string;
}

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

    const updateLength = useCallback(() => {
        if (editorRef.current) {
            setCurrentLength(getTextLengthFromHtml(editorRef.current.innerHTML));
        }
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
        const textLength = getTextLengthFromHtml(value);

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
        const currentTextLength = getTextLengthFromHtml(value);
        const availableSpace = maxLength - currentTextLength;

        if (availableSpace <= 0) return;

        const textToInsert = text.slice(0, availableSpace);

        // Сучасний спосіб замість execCommand
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return;

        const range = selection.getRangeAt(0);
        range.deleteContents();

        const textNode = document.createTextNode(textToInsert);
        range.insertNode(textNode);

        // Переміщуємо курсор в кінець вставленого тексту
        range.setStartAfter(textNode);
        range.setEndAfter(textNode);
        range.collapse(true);

        selection.removeAllRanges();
        selection.addRange(range);

        // Тригеримо подію input для оновлення
        if (editorRef.current) {
            const event = new Event('input', { bubbles: true });
            editorRef.current.dispatchEvent(event);
        }
    };

    const isModifierKey = (e: React.KeyboardEvent<HTMLDivElement>) => e.ctrlKey || e.metaKey;

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (isModifierKey(e) && e.key === 'b') {
            e.preventDefault();
            formatBold();
            return;
        }

        if (isModifierKey(e) && e.key === 'i') {
            e.preventDefault();
            formatItalic();
            return;
        }

        if (e.key === 'Enter') {
            e.preventDefault();
            insertLineBreak();
            return;
        }

        const textLength = getTextLengthFromHtml(value);
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
            const isAllowedModifierKey =
                isModifierKey(e) && ['a', 'c', 'x', 'z', 'y', 'b', 'i'].includes(e.key.toLowerCase());

            if (!allowedKeys.includes(e.key) && !isAllowedModifierKey) {
                e.preventDefault();
            }
        }
    };

    const updateFormatStates = () => {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) {
            setIsBold(false);
            setIsItalic(false);
            return;
        }

        let node = selection.anchorNode;
        if (!node) return;

        let hasBold = false;
        let hasItalic = false;

        // Перевіряємо всі батьківські елементи
        while (node && node !== editorRef.current) {
            if (node.nodeType === Node.ELEMENT_NODE) {
                const element = node as HTMLElement;
                if (element.tagName === 'STRONG' || element.tagName === 'B') {
                    hasBold = true;
                }
                if (element.tagName === 'EM' || element.tagName === 'I') {
                    hasItalic = true;
                }
            }
            node = node.parentNode;
        }

        setIsBold(hasBold);
        setIsItalic(hasItalic);
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
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return;

        const range = selection.getRangeAt(0);

        // Перевіряємо чи вже є bold
        let parent = range.commonAncestorContainer;
        if (parent.nodeType === Node.TEXT_NODE) {
            parent = parent.parentNode as Node;
        }

        const isBold = (parent as HTMLElement).tagName === 'STRONG' || (parent as HTMLElement).tagName === 'B';

        if (isBold) {
            // Видаляємо bold
            const text = range.toString();
            range.deleteContents();
            const textNode = document.createTextNode(text);
            range.insertNode(textNode);
        } else {
            // Додаємо bold
            const contents = range.extractContents();
            const strong = document.createElement('strong');
            strong.appendChild(contents);
            range.insertNode(strong);
        }

        updateFormatStates();
        editorRef.current?.focus();
        if (editorRef.current) {
            onChange(editorRef.current.innerHTML);
            updateLength();
        }
    };

    const formatItalic = () => {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return;

        const range = selection.getRangeAt(0);

        let parent = range.commonAncestorContainer;
        if (parent.nodeType === Node.TEXT_NODE) {
            parent = parent.parentNode as Node;
        }

        const isItalic = (parent as HTMLElement).tagName === 'EM' || (parent as HTMLElement).tagName === 'I';

        if (isItalic) {
            // Видаляємо italic
            const text = range.toString();
            range.deleteContents();
            const textNode = document.createTextNode(text);
            range.insertNode(textNode);
        } else {
            // Додаємо italic
            const contents = range.extractContents();
            const em = document.createElement('em');
            em.appendChild(contents);
            range.insertNode(em);
        }

        updateFormatStates();
        editorRef.current?.focus();
        if (editorRef.current) {
            onChange(editorRef.current.innerHTML);
            updateLength();
        }
    };

    const insertLineBreak = () => {
        const textLength = getTextLengthFromHtml(value);
        if (textLength >= maxLength) return;

        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return;

        const range = selection.getRangeAt(0);
        range.deleteContents();

        const br = document.createElement('br');
        range.insertNode(br);

        // Додаємо ще один br щоб курсор міг стати на новий рядок
        const br2 = document.createElement('br');
        br.parentNode?.insertBefore(br2, br.nextSibling);

        range.setStartAfter(br2);
        range.setEndAfter(br2);
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
            className={cn(styles.root, {
                'rich-text-input--disabled': disabled,
                'rich-text-input--focused': isFocused && !disabled,
            })}
        >
            <div className={styles.toolbar}>
                <button
                    type="button"
                    className={cn(styles.toolbarBtn, {
                        [styles.toolbarBtnActive]: isBold,
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
                    className={cn(styles.toolbarBtn, {
                        [styles.toolbarBtnActive]: isItalic,
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
                    className={styles.toolbarBtn}
                    onClick={insertLineBreak}
                    disabled={disabled}
                    aria-label="Line break"
                    title="Line break"
                >
                    ↵
                </button>
            </div>
            <div className={styles.editorContainer}>
                <div
                    ref={editorRef}
                    id={id}
                    className={cn(styles.field, className)}
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
            <output className={styles.counter}>
                {currentLength}/{maxLength}
            </output>
        </div>
    );
};
