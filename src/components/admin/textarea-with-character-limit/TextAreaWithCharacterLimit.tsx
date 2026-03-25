import { forwardRef, useEffect, useRef } from 'react';
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
    /** Enable auto-grow behavior: textarea expands as user types up to maxRows limit */
    autoGrow?: boolean;
    /** Maximum number of rows to allow when autoGrow is enabled (default: 10) */
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
        const internalRef = useRef<HTMLTextAreaElement>(null);
        const textareaRef = ref || internalRef;

        const { isFocused, localWarning, showClearButton, handleChange, handleFocus, handleBlur, handleClear } =
            useInputWithCharacterLimit<HTMLTextAreaElement>({
                value,
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

        // Auto-grow logic: adjust height based on content
        useEffect(() => {
            if (!autoGrow || typeof textareaRef !== 'object' || !textareaRef.current) {
                return;
            }

            const textarea = textareaRef.current;
            const parsedLineHeight = parseInt(window.getComputedStyle(textarea).lineHeight, 10);

            // Prevent NaN errors in environments without CSS rendering like JSDOM
            if (isNaN(parsedLineHeight)) return;

            const maxHeight = parsedLineHeight * maxRows;

            textarea.style.height = 'auto';
            textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`;
            textarea.style.overflowY = textarea.scrollHeight > maxHeight ? 'auto' : 'hidden';
        }, [value, autoGrow, maxRows, textareaRef]);

        return (
            <div className="char-limit-textarea">
                <div
                    className={cn('char-limit-textarea__wrapper', {
                        'char-limit-textarea__wrapper--disabled': disabled,
                        'char-limit-textarea__wrapper--focused': isFocused && !disabled,
                    })}
                >
                    <textarea
                        ref={textareaRef}
                        className="char-limit-textarea__field"
                        value={value ?? ''}
                        onChange={handleChange}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        onKeyDown={onKeyDown}
                        name={name}
                        id={id}
                        disabled={disabled}
                        placeholder={placeholder}
                        rows={rows}
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
