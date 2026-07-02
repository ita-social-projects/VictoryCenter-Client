import React, { useRef, useEffect, useState, useLayoutEffect } from 'react';
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
    rows,
    autoGrow,
    maxRows,
}: InputWithCharacterLimitProps) => {
    const [localValue, setLocalValue] = useState(value ?? '');
    const valueRef = useRef(value);

    useLayoutEffect(() => {
        valueRef.current = value;
    }, [value]);

    useEffect(() => {
        setLocalValue(value ?? '');
    }, [value]);

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

    const onInternalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLocalValue(e.target.value);
        handleChange(e);
        Promise.resolve().then(() => {
            setLocalValue(valueRef.current ?? '');
        });
    };

    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        const textarea = textareaRef.current;
        if (!autoGrow || !textarea) {
            return;
        }

        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight}px`;
        textarea.style.overflowY = 'hidden';
    }, [localValue, autoGrow, maxRows]);

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
                    value={localValue}
                    onChange={onInternalChange as unknown as React.ChangeEventHandler<HTMLTextAreaElement>}
                    onFocus={handleFocus as unknown as React.FocusEventHandler<HTMLTextAreaElement>}
                    onBlur={handleBlur as unknown as React.FocusEventHandler<HTMLTextAreaElement>}
                    name={name}
                    id={id}
                    disabled={disabled}
                    placeholder={placeholder}
                    rows={rows ?? 1}
                    maxLength={maxLength}
                    aria-describedby={countId}
                    aria-invalid={hasError || currentLength > maxLength}
                />
            ) : (
                <input
                    className={cn('char-limit-input__field', className)}
                    value={localValue}
                    onChange={onInternalChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    name={name}
                    type={type}
                    id={id}
                    disabled={disabled}
                    placeholder={placeholder}
                    maxLength={maxLength}
                    aria-describedby={countId}
                    aria-invalid={hasError || currentLength > maxLength}
                />
            )}
            <button
                type="button"
                className={cn('char-limit-input__clear-button', {
                    'char-limit-input__clear-button--hidden': !showClearButton || disabled,
                    'char-limit-input__clear-button--error': hasError || !!localWarning,
                })}
                onMouseDown={(e) => e.preventDefault()}
                onClick={handleClear}
                aria-label="Clear input"
                tabIndex={showClearButton && !disabled ? 0 : -1}
                disabled={!showClearButton || disabled}
            >
                <RemoveIcon />
            </button>
            {showCounter && (
                <output id={countId} className="char-limit-input__counter">
                    {currentLength}/{maxLength}
                </output>
            )}
        </div>
    );
};
