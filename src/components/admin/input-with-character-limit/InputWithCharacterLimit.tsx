import React, { useState } from 'react';
import classNames from 'classnames';
import { ReactComponent as RemoveIcon } from '@/assets/icons/remove-query.svg';
import { getNormalizedInputText } from '@/utils/functions/formatters/text-formatters';
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
}: InputWithCharacterLimitProps) => {
    const [isFocused, setIsFocused] = useState(false);

    const currentLength = getNormalizedInputText(value).length;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let newValue = e.target.value;
        const normalized = getNormalizedInputText(newValue);

        if (maxLength && normalized.length > maxLength) {
            newValue = normalized.slice(0, maxLength);
        }

        const syntheticEvent = {
            ...e,
            target: {
                ...e.target,
                value: newValue,
            },
        };

        onChange(syntheticEvent);
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
        setIsFocused(true);
        onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        setIsFocused(false);
        onBlur?.(e);
    };

    const handleClear = () => {
        const syntheticEvent = {
            target: { value: '', name, id },
        } as React.ChangeEvent<HTMLInputElement>;

        onChange(syntheticEvent);
    };

    const showClearButton = isFocused && value.length > 0 && !disabled;
    const countId = `${id}-character-count`;

    return (
        <div
            className={classNames('char-limit-input', {
                'char-limit-input--disabled': disabled,
                'char-limit-input--focused': isFocused && !disabled,
            })}
        >
            <input
                className={classNames('char-limit-input__field', className)}
                value={value}
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

            <button
                type="button"
                className={classNames('char-limit-input__clear-button', {
                    'char-limit-input__clear-button--visible': showClearButton,
                    'char-limit-input__clear-button--error': hasError,
                })}
                onMouseDown={(e) => e.preventDefault()}
                onClick={handleClear}
                aria-label="Clear input"
                tabIndex={showClearButton ? 0 : -1}
            >
                <RemoveIcon />
            </button>

            <output id={countId} className="char-limit-input__counter">
                {currentLength}/{maxLength}
            </output>
        </div>
    );
};
