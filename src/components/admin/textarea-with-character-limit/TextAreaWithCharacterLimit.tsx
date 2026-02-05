import { forwardRef } from 'react';
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
        },
        ref,
    ) => {
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
