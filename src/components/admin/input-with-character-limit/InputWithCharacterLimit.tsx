import React, { useState } from 'react';
import classNames from 'classnames';
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
}: InputWithCharacterLimitProps) => {
    const [isFocused, setIsFocused] = useState(false);
    const currentLength = value?.length ?? 0;

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
        setIsFocused(true);
        onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        setIsFocused(false);
        onBlur?.(e);
    };

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
                onChange={onChange}
                maxLength={maxLength}
                onFocus={handleFocus}
                onBlur={handleBlur}
                name={name}
                type={type}
                id={id}
                disabled={disabled}
                placeholder={placeholder}
                aria-describedby={countId}
                aria-invalid={currentLength > maxLength}
            />
            <output htmlFor={id} className="char-limit-input__counter" id={countId}>
                {currentLength}/{maxLength}
            </output>
        </div>
    );
};
