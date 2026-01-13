import React, { useState, useEffect, useRef, useCallback } from 'react';
import cn from 'classnames';
import styles from './RichTextInput.module.scss';
import { getTextLengthFromHtml } from '@/utils/functions/get-text-lenght-from-html/get-text-lenght-from-html';

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
                // Save cursor position before updating content
                const selection = window.getSelection();
                let savedOffset = 0;
                let hasSelection = false;

                if (selection && selection.rangeCount > 0 && editorRef.current.contains(selection.anchorNode)) {
                    hasSelection = true;
                    // Calculate offset from start of editor
                    const range = selection.getRangeAt(0);
                    const preCaretRange = range.cloneRange();
                    preCaretRange.selectNodeContents(editorRef.current);
                    preCaretRange.setEnd(range.startContainer, range.startOffset);
                    savedOffset = preCaretRange.toString().length;
                }

                editorRef.current.innerHTML = value || '';
                updateLength();

                // Restore cursor position if editor was focused
                if (hasSelection && isFocused) {
                    try {
                        const newRange = document.createRange();
                        const walker = document.createTreeWalker(
                            editorRef.current,
                            NodeFilter.SHOW_TEXT,
                            null,
                        );

                        let currentOffset = 0;
                        let node: Node | null = walker.nextNode();
                        let targetNode: Node | null = null;
                        let targetOffset = 0;

                        while (node) {
                            const nodeLength = node.textContent?.length || 0;
                            if (currentOffset + nodeLength >= savedOffset) {
                                targetNode = node;
                                targetOffset = savedOffset - currentOffset;
                                break;
                            }
                            currentOffset += nodeLength;
                            node = walker.nextNode();
                        }

                        if (targetNode) {
                            newRange.setStart(targetNode, Math.min(targetOffset, targetNode.textContent?.length || 0));
                            newRange.collapse(true);
                            selection?.removeAllRanges();
                            selection?.addRange(newRange);
                        }
                    } catch {
                        // If cursor restoration fails, just place cursor at end
                        const range = document.createRange();
                        if (editorRef.current.lastChild) {
                            range.setStartAfter(editorRef.current.lastChild);
                            range.collapse(true);
                            selection?.removeAllRanges();
                            selection?.addRange(range);
                        }
                    }
                }
            }
        }
    }, [value, updateLength, isFocused]);

    useEffect(() => {
        if (isInitialMount.current && editorRef.current) {
            updateLength();
            isInitialMount.current = false;
        }
    }, [updateLength]);

    // Modern replacement for deprecated document.queryCommandState
    const updateFormatStates = useCallback(() => {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) {
            setIsBold(false);
            setIsItalic(false);
            return;
        }

        const range = selection.getRangeAt(0);
        const container = range.commonAncestorContainer;
        const element =
            container.nodeType === Node.TEXT_NODE ? container.parentElement : (container as Element);

        setIsBold(!!element?.closest('strong, b'));
        setIsItalic(!!element?.closest('em, i'));
    }, []);

    // Modern replacement for execCommand - wrap selection with tag
    const wrapSelectionWithTag = useCallback(
        (tagName: 'strong' | 'em') => {
            const selection = window.getSelection();
            if (!selection || selection.rangeCount === 0) return;

            const range = selection.getRangeAt(0);
            if (!editorRef.current?.contains(range.commonAncestorContainer)) return;

            // Check if selection is already wrapped with this tag
            const parentElement = range.commonAncestorContainer.parentElement;
            const isAlreadyWrapped =
                parentElement?.tagName.toLowerCase() === tagName ||
                parentElement?.closest(tagName) !== null;

            if (isAlreadyWrapped) {
                // Unwrap: extract content from the tag
                const wrapper =
                    parentElement?.tagName.toLowerCase() === tagName
                        ? parentElement
                        : parentElement?.closest(tagName);

                if (wrapper && wrapper.parentNode) {
                    const fragment = document.createDocumentFragment();
                    while (wrapper.firstChild) {
                        fragment.appendChild(wrapper.firstChild);
                    }
                    wrapper.parentNode.replaceChild(fragment, wrapper);
                }
            } else {
                // Wrap selection with tag
                const wrapper = document.createElement(tagName);
                try {
                    range.surroundContents(wrapper);
                } catch {
                    // Handle partial selection across elements
                    const content = range.extractContents();
                    wrapper.appendChild(content);
                    range.insertNode(wrapper);
                }
            }

            // Restore selection
            selection.removeAllRanges();
            selection.addRange(range);

            editorRef.current?.focus();
            if (editorRef.current) {
                onChange(editorRef.current.innerHTML);
                updateLength();
            }
            updateFormatStates();
        },
        [onChange, updateLength, updateFormatStates],
    );

    // Modern replacement for execCommand('insertText')
    const insertTextAtCursor = useCallback((text: string) => {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return;

        const range = selection.getRangeAt(0);
        range.deleteContents();

        const textNode = document.createTextNode(text);
        range.insertNode(textNode);

        // Move cursor to end of inserted text
        range.setStartAfter(textNode);
        range.setEndAfter(textNode);
        selection.removeAllRanges();
        selection.addRange(range);
    }, []);

    const formatBold = useCallback(() => {
        wrapSelectionWithTag('strong');
    }, [wrapSelectionWithTag]);

    const formatItalic = useCallback(() => {
        wrapSelectionWithTag('em');
    }, [wrapSelectionWithTag]);

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
        insertTextAtCursor(textToInsert);

        if (editorRef.current) {
            onChange(editorRef.current.innerHTML);
            updateLength();
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

    const insertLineBreak = () => {
        const textLength = getTextLengthFromHtml(value);
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
            className={cn(styles.root, {
                [styles['root--disabled']]: disabled,
                [styles['root--focused']]: isFocused && !disabled,
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
