import React, { useState } from 'react';
import classNames from 'classnames';
import './TextAreaWithCharacterLimit.scss';

interface TextAreaWithCharacterLimitProps {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    onBlur?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
    onFocus?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
    name: string;
    id: string;
    maxLength: number;
    disabled?: boolean;
    placeholder?: string;
    rows?: number;
}

export const TextAreaWithCharacterLimit = ({
    value,
    onChange,
    onBlur,
    onFocus,
    name,
    id,
    maxLength,
    disabled = false,
    placeholder,
    rows = 4,
}: TextAreaWithCharacterLimitProps) => {
    const [isFocused, setIsFocused] = useState(false);
    const currentLength = value.length;

    const handleFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
        setIsFocused(true);
        onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
        setIsFocused(false);
        onBlur?.(e);
    };

    const countId = `${id}-character-count`;

    return (
        <div className="textarea-with-limit">
            <div
                className={classNames('textarea-wrapper', {
                    'textarea-wrapper-disabled': disabled,
                    'textarea-wrapper-focused': isFocused && !disabled,
                })}
            >
                <textarea
                    className="textarea-input"
                    value={value}
                    onChange={onChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    maxLength={maxLength}
                    name={name}
                    id={id}
                    disabled={disabled}
                    placeholder={placeholder}
                    rows={rows}
                    aria-describedby={countId}
                    aria-invalid={currentLength > maxLength}
                />
            </div>
            <div className="character-limit" id={countId} aria-live="polite" role="status">
                {currentLength}/{maxLength}
            </div>
        </div>
    );
};
