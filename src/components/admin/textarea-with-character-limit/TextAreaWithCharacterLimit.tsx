import React, { useState } from 'react';
import classNames from 'classnames';
import './TextAreaWithCharacterLimit.scss';

export interface TextAreaWithCharacterLimitProps {
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
        <div className="char-limit-textarea">
            <div
                className={classNames('char-limit-textarea__wrapper', {
                    'char-limit-textarea__wrapper--disabled': disabled,
                    'char-limit-textarea__wrapper--focused': isFocused && !disabled,
                })}
            >
                <textarea
                    className="char-limit-textarea__field"
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
            <div className="char-limit-textarea__counter-container">
                <output className="char-limit-textarea__counter" id={countId} aria-live="polite">
                    {currentLength}/{maxLength}
                </output>
            </div>
        </div>
    );
};
