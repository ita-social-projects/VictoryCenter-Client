import React, { useRef, useEffect } from 'react';
import cn from 'classnames';
import { ReactComponent as RemoveIcon } from '@/assets/icons/remove-query.svg';
import { useInputWithCharacterLimit } from '@/hooks/admin/use-input-with-character-limit/useInputWithCharacterLimit';
import './InputWithCharacterLimit.scss';

export interface InputWithCharacterLimitProps {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
    onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
    name: string;
    id: string;
    maxLength: number;
    disabled?: boolean;
    type?: 'text' | 'email' | 'password' | 'number';
    placeholder?: string;
    className?: string;
    hasError?: boolean;
    maxLimitWarning?: string;
    onWarningChange?: (warning: string | null) => void;
    showCounter?: boolean;
    counterPosition?: 'inside' | 'bottom';
    rows?: number;
    autoGrow?: boolean;
    maxRows?: number;
}

export const InputWithCharacterLimit = ({
    value,
    onChange,
    onBlur,
    onFocus,
    name,
    id,
    maxLength,
    disabled = false,
    type = 'text',
    placeholder,
    className,
    hasError = false,
    maxLimitWarning,
    onWarningChange,
    showCounter = true,
    counterPosition = 'inside',
    rows,
    autoGrow,
    maxRows,
}: InputWithCharacterLimitProps) => {
    const {
        isFocused,
        currentLength,
        localWarning,
        showClearButton,
        handleChange,
        handleFocus,
        handleBlur,
        handleClear,
    } = useInputWithCharacterLimit<HTMLInputElement>({
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

    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        const textarea = textareaRef.current;
        if (!autoGrow || !textarea) {
            return;
        }

        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight}px`;
        textarea.style.overflowY = 'hidden';
    }, [value, autoGrow, maxRows]);

    const countId = `${id}-character-count`;

    return (
        <div
            className={cn('char-limit-input', {
                'char-limit-input--disabled': disabled,
                'char-limit-input--focused': isFocused && !disabled,
                'char-limit-input--error': hasError || !!localWarning,
                'char-limit-input--textarea': rows !== undefined || autoGrow,
            })}
        >
            {rows !== undefined || autoGrow ? (
                <textarea
                    ref={textareaRef}
                    className={cn('char-limit-input__field', 'char-limit-input__field--textarea', className)}
                    value={value ?? ''}
                    onChange={handleChange as unknown as React.ChangeEventHandler<HTMLTextAreaElement>}
                    onFocus={handleFocus as unknown as React.FocusEventHandler<HTMLTextAreaElement>}
                    onBlur={handleBlur as unknown as React.FocusEventHandler<HTMLTextAreaElement>}
                    name={name}
                    id={id}
                    disabled={disabled}
                    placeholder={placeholder}
                    rows={rows ?? 1}
                    aria-describedby={countId}
                    aria-invalid={hasError || currentLength > maxLength}
                />
            ) : (
                <input
                    className={cn('char-limit-input__field', className)}
                    value={value ?? ''}
                    onChange={handleChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    name={name}
                    type={type}
                    id={id}
                    disabled={disabled}
                    placeholder={placeholder}
                    aria-describedby={countId}
                    aria-invalid={hasError || currentLength > maxLength}
                />
            )}
            <button
                type="button"
                className={cn('char-limit-input__clear-button', {
                    'char-limit-input__clear-button--visible': showClearButton,
                    'char-limit-input__clear-button--error': hasError || !!localWarning,
                })}
                onMouseDown={(e) => e.preventDefault()}
                onClick={handleClear}
                aria-label="Clear input"
                tabIndex={showClearButton ? 0 : -1}
            >
                <RemoveIcon />
            </button>
            {showCounter && counterPosition === 'inside' && (
                <output id={countId} className="char-limit-input__counter">
                    {currentLength}/{maxLength}
                </output>
            )}
            {showCounter && counterPosition === 'bottom' && (
                <output id={countId} className="char-limit-input__counter char-limit-input__counter--bottom">
                    {currentLength}/{maxLength}
                </output>
            )}
        </div>
    );
};
