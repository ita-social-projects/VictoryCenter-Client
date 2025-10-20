import { useEffect, useRef, useState } from 'react';
import './Input.scss';
import { DONATE_TEXT } from '../../../../../const/admin/donate';

interface InputProps {
    label?: string;
    isRequired?: boolean;
    placeholder?: string;
    isTitle?: boolean;
    prefix?: string;
    name: string;
    value?: string;
    editable?: boolean;
    handleChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    handleBlur?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
    onValueChange?: (val: string) => void;
    onlyNumbers?: boolean;
    maxLength?: number;
    className?: string;
}

export const Input = ({
    label,
    placeholder = DONATE_TEXT.PLACEHOLDER.DEFAULT,
    isTitle = false,
    isRequired,
    prefix = '',
    name,
    value: externalValue,
    editable = true,
    handleChange,
    handleBlur,
    onValueChange,
    onlyNumbers = false,
    maxLength,
    className,
}: InputProps) => {
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

        handleChange?.(e);
    };

    const handleClear = () => {
        setValue(prefix);
        setHasEdited(true);
    };

    const showClearButton = isFocused && value.length > prefix.length;

    const hasValue = value && value !== prefix;

    return (
        <div className={`input ${isTitle ? 'input-title' : ''} ${hasEdited ? 'input-changed' : ''} ${className ?? ''}`}>
            {label && (
                <div className={isTitle ? 'input-title-label' : 'input-label'}>
                    {isRequired && editable && <span className="input-required">*</span>}
                    {!isTitle && label}
                </div>
            )}

            <div className={isTitle ? 'input-title-body' : 'input-body'}>
                {isTitle && editable && isRequired && <span className="input-required">*</span>}

                <textarea
                    ref={textAreaRef}
                    name={name}
                    placeholder={hasValue ? '' : placeholder}
                    value={value}
                    onChange={onChange}
                    onFocus={() => setIsFocused(true)}
                    onBlur={(e) => {
                        setIsFocused(false);
                        handleBlur?.(e);
                    }}
                    readOnly={!editable}
                    className="input-textarea"
                    inputMode={onlyNumbers ? 'numeric' : undefined}
                    maxLength={maxLength}
                />

                {showClearButton && (
                    <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={handleClear}></button>
                )}
            </div>
        </div>
    );
};
