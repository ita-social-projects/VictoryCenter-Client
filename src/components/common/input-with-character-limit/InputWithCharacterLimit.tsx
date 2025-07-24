import React, { useState } from 'react';
import classNames from 'classnames';
import './input-with-character-limit.scss';

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
    className?: string;
    placeholder?: string;
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
            className={classNames('input-line-wrapper', {
                'input-line-wrapper-disabled': disabled,
                'input-line-wrapper-focused': isFocused && !disabled,
            })}
        >
            <input
                className="input-line-wrapper-input"
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
            <div className="input-line-wrapper-character-limit" id={countId} aria-live="polite" role="status">
                {currentLength}/{maxLength}
            </div>
        </div>
    );
};
