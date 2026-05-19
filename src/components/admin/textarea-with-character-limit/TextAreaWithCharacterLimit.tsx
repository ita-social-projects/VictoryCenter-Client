import React, { forwardRef, useCallback, useEffect, useRef, useState } from 'react';
import cn from 'classnames';
import { ReactComponent as RemoveIcon } from '@/assets/icons/remove-query.svg';
import { useInputWithCharacterLimit } from '@/hooks/admin/use-input-with-character-limit/useInputWithCharacterLimit';
import './TextAreaWithCharacterLimit.scss';

export interface TextAreaWithCharacterLimitProps {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    onBlur?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
    onFocus?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
    onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
    name: string;
    id: string;
    maxLength: number;
    disabled?: boolean;
    placeholder?: string;
    rows?: number;
    hasError?: boolean;
    maxLimitWarning?: string;
    onWarningChange?: (warning: string | null) => void;
    autoGrow?: boolean;
    maxRows?: number;
}

export const TextAreaWithCharacterLimit = forwardRef<HTMLTextAreaElement, TextAreaWithCharacterLimitProps>(
    (
        {
            value,
            onChange,
            onBlur,
            onFocus,
            onKeyDown,
            name,
            id,
            maxLength,
            disabled = false,
            placeholder,
            rows = 4,
            hasError = false,
            maxLimitWarning,
            onWarningChange,
            autoGrow = false,
            maxRows = 10,
        },
        ref,
    ) => {
        const [localValue, setLocalValue] = useState(value ?? '');

        useEffect(() => {
            setLocalValue(value ?? '');
        }, [value]);
        const internalRef = useRef<HTMLTextAreaElement>(null);

        const setTextareaRef = useCallback(
            (node: HTMLTextAreaElement | null) => {
                internalRef.current = node;
                if (typeof ref === 'function') {
                    ref(node);
                } else if (ref) {
                    ref.current = node;
                }
            },
            [ref],
        );

        const { isFocused, localWarning, showClearButton, handleChange, handleFocus, handleBlur, handleClear } =
            useInputWithCharacterLimit<HTMLTextAreaElement>({
                value: localValue,
                maxLength,
                name,
                id,
                disabled,
                maxLimitWarning,
                onChange,
                onFocus,
                onBlur,
                onWarningChange,
            });

        const onInternalChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
            setLocalValue(e.target.value);
            handleChange(e);
        };

        useEffect(() => {
            const textarea = internalRef.current;
            if (!autoGrow || !textarea) return;
            textarea.style.height = 'auto';
            const computedStyle = globalThis.getComputedStyle(textarea);

            let parsedLineHeight = Number.parseFloat(computedStyle.lineHeight);
            if (Number.isNaN(parsedLineHeight)) {
                const parsedFontSize = Number.parseFloat(computedStyle.fontSize) || 16;
                parsedLineHeight = parsedFontSize * 1.2;
            }

            const borderTop = Number.parseFloat(computedStyle.borderTopWidth) || 0;
            const borderBottom = Number.parseFloat(computedStyle.borderBottomWidth) || 0;
            const paddingTop = Number.parseFloat(computedStyle.paddingTop) || 0;
            const paddingBottom = Number.parseFloat(computedStyle.paddingBottom) || 0;

            const maxHeight = maxRows ? parsedLineHeight * maxRows + paddingTop + paddingBottom : Infinity;

            const finalTargetHeight = textarea.scrollHeight + borderTop + borderBottom;
            textarea.style.height = `${Math.min(finalTargetHeight, maxHeight)}px`;
            textarea.style.overflowY = finalTargetHeight > maxHeight ? 'auto' : 'hidden';
        }, [value, autoGrow, maxRows]);

        return (
            <div className="char-limit-textarea">
                <div
                    className={cn('char-limit-textarea__wrapper', {
                        'char-limit-textarea__wrapper--disabled': disabled,
                        'char-limit-textarea__wrapper--focused': isFocused && !disabled,
                        'char-limit-textarea__wrapper--error': hasError || !!localWarning,
                    })}
                >
                    <textarea
                        ref={setTextareaRef}
                        className="char-limit-textarea__field"
                        value={localValue}
                        onChange={onInternalChange}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        onKeyDown={onKeyDown}
                        aria-invalid={hasError}
                        name={name}
                        id={id}
                        disabled={disabled}
                        placeholder={placeholder}
                        rows={rows}
                        maxLength={maxLength}
                    />
                    {showClearButton && (
                        <button
                            type="button"
                            className={cn('char-limit-textarea__clear-button', {
                                'char-limit-textarea__clear-button--error': hasError || !!localWarning,
                            })}
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={handleClear}
                            aria-label="Clear input"
                        >
                            <RemoveIcon />
                        </button>
                    )}
                </div>
            </div>
        );
    },
);
