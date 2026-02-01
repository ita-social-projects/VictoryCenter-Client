import { forwardRef, useState } from 'react';
import cn from 'classnames';
import { ReactComponent as RemoveIcon } from '@/assets/icons/remove-query.svg';
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
        },
        ref,
    ) => {
        const [isFocused, setIsFocused] = useState(false);

        const handleFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
            setIsFocused(true);
            onFocus?.(e);
        };

        const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
            setIsFocused(false);
            onBlur?.(e);
        };

        const handleClear = () => {
            const syntheticEvent = {
                target: { value: '', name, id },
            } as React.ChangeEvent<HTMLTextAreaElement>;
            onChange(syntheticEvent);
        };

        const showClearButton = isFocused && value.length > 0 && !disabled;

        return (
            <div className="char-limit-textarea">
                <div
                    className={cn('char-limit-textarea__wrapper', {
                        'char-limit-textarea__wrapper--disabled': disabled,
                        'char-limit-textarea__wrapper--focused': isFocused && !disabled,
                    })}
                >
                    <textarea
                        ref={ref}
                        className="char-limit-textarea__field"
                        value={value}
                        onChange={onChange}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        onKeyDown={onKeyDown}
                        maxLength={maxLength}
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
                                'char-limit-textarea__clear-button--error': hasError,
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
