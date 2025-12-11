import { useEffect, useRef, useState } from 'react';
import './DonateInput.scss';
import { DONATE_TEXT } from '@/const/admin/donate';
import classNames from 'classnames';

interface DonateInputProps {
    label?: string;
    isRequired?: boolean;
    placeholder?: string;
    isTitle?: boolean;
    prefix?: string;
    name: string;
    value?: string;
    editable?: boolean;
    onBlur?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
    onValueChange?: (val: string) => void;
    onlyNumbers?: boolean;
    maxLength?: number;
    className?: string;
    error?: string;
}

export const DonateInput = ({
    label,
    placeholder = DONATE_TEXT.PLACEHOLDER.DEFAULT,
    isTitle = false,
    isRequired,
    prefix = '',
    name,
    value: externalValue,
    editable = true,
    onBlur,
    onValueChange,
    onlyNumbers = false,
    maxLength,
    className,
    error,
}: DonateInputProps) => {
    const computedInitialValue =
        externalValue !== undefined && externalValue !== null ? prefix + externalValue.replace(prefix, '') : prefix;

    const [value, setValue] = useState(computedInitialValue);
    const [initialValue, setInitialValue] = useState(computedInitialValue);
    const [hasEdited, setHasEdited] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const textAreaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        const newValue =
            externalValue !== undefined && externalValue !== null ? prefix + externalValue.replace(prefix, '') : prefix;

        setValue(newValue);
        setInitialValue(newValue);
    }, [externalValue, prefix]);

    useEffect(() => {
        if (!textAreaRef.current) return;

        const ta = textAreaRef.current;
        const style = window.getComputedStyle(ta);
        const minHeight = parseFloat(style.minHeight);

        if (value && value !== prefix && ta.scrollHeight > minHeight) {
            ta.style.height = style.minHeight;
            ta.style.height = `${ta.scrollHeight}px`;
        }
    }, [value, prefix]);

    const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        let newValue = e.target.value;

        if (onlyNumbers) {
            const numbers = newValue.replace(/\D/g, '');
            newValue = prefix ? prefix + numbers : numbers;
        }
        setValue(newValue);

        onValueChange?.(newValue);

        if (!hasEdited && newValue !== initialValue) {
            setHasEdited(true);
        }
    };

    const handleClear = () => {
        setValue(prefix);
        onValueChange?.(prefix);
        setHasEdited(true);
    };

    const showClearButton = isFocused && value.length > prefix.length;
    const currentLength = value.length - prefix.length;
    const showCharacterCounter = maxLength !== undefined;
    const showFooter = showCharacterCounter || error;

    return (
        <>
            <div
                className={classNames(
                    'donate-input',
                    {
                        'donate-input-title': isTitle,
                        'donate-input-changed': hasEdited,
                        'donate-input-title-create': isTitle && name === 'name',
                    },
                    className,
                )}
            >
                {label && (
                    <div className={isTitle ? 'donate-input-title-label' : 'donate-input-label'}>
                        {isRequired && editable && <span className="donate-input-required">*</span>}
                        {label}
                    </div>
                )}

                <div className={isTitle ? 'donate-input-title-body' : 'donate-input-body'}>
                    {isTitle && editable && isRequired && <span className="donate-input-required">*</span>}

                    <textarea
                        ref={textAreaRef}
                        name={name}
                        placeholder={placeholder}
                        value={value}
                        onChange={onChange}
                        onFocus={() => setIsFocused(true)}
                        onBlur={(e) => {
                            setIsFocused(false);
                            onBlur?.(e);
                        }}
                        readOnly={!editable}
                        className="donate-input-textarea"
                        inputMode={onlyNumbers ? 'numeric' : undefined}
                        maxLength={maxLength ? prefix.length + maxLength : undefined}
                    />

                    {showClearButton && (
                        <button
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={handleClear}
                            aria-label="Clear input"
                            className="donate-input-clear-button"
                        ></button>
                    )}
                </div>
            </div>

            {showFooter && (
                <div className="donate-input-footer">
                    <span className="donate-input-error">{error || ''}</span>
                    {showCharacterCounter && (
                        <span className="donate-input-character-counter">
                            {currentLength}/{maxLength}
                        </span>
                    )}
                </div>
            )}
        </>
    );
};
