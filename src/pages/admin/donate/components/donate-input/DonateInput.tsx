import { useEffect, useRef, useState } from 'react';
import './DonateInput.scss';
import { DONATE_TEXT } from '@/const/admin/donate';
import classNames from 'classnames';
import { getNormalizedInputText } from '@/utils/functions/formatters/text-formatters';

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
    ignoreSpacesInCount?: boolean;
    className?: string;
    error?: string;
    maxLimitWarning?: string;
    digitsOnlyWarning?: string;
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
    ignoreSpacesInCount = false,
    className,
    error,
    maxLimitWarning,
    digitsOnlyWarning,
}: DonateInputProps) => {
    const computedInitialValue =
        externalValue !== undefined && externalValue !== null ? prefix + externalValue.replace(prefix, '') : prefix;

    const [value, setValue] = useState(computedInitialValue);
    const [initialValue, setInitialValue] = useState(computedInitialValue);
    const [hasEdited, setHasEdited] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const textAreaRef = useRef<HTMLTextAreaElement>(null);
    const [localWarning, setLocalWarning] = useState<string | null>(null);
    const warningTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        return () => {
            if (warningTimerRef.current) {
                clearTimeout(warningTimerRef.current);
            }
        };
    }, []);

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

    const showTemporaryWarning = (text: string) => {
        setLocalWarning(text);

        if (warningTimerRef.current) {
            clearTimeout(warningTimerRef.current);
        }

        warningTimerRef.current = setTimeout(() => {
            setLocalWarning(null);
            warningTimerRef.current = null;
        }, 2000);
    };

    const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        let newValue = e.target.value;
        let warningTriggered = false;

        if (prefix && newValue === '') {
            newValue = prefix;
        }

        if (onlyNumbers) {
            const numbers = newValue.replace(/\D/g, '');
            const sanitizedValue = prefix ? prefix + numbers : numbers;

            if (newValue !== sanitizedValue) {
                if (digitsOnlyWarning) {
                    showTemporaryWarning(digitsOnlyWarning);
                    warningTriggered = true;
                }
            }

            newValue = sanitizedValue;
        }

        if (maxLength) {
            const textWithoutPrefix = newValue.startsWith(prefix) ? newValue.slice(prefix.length) : newValue;

            const currentLength = ignoreSpacesInCount
                ? textWithoutPrefix.replace(/\s/g, '').length
                : textWithoutPrefix.trimStart().length;

            if (currentLength > maxLength) {
                if (maxLimitWarning) {
                    showTemporaryWarning(maxLimitWarning);

                    if (warningTimerRef.current) {
                        clearTimeout(warningTimerRef.current);
                    }
                    warningTimerRef.current = setTimeout(() => {
                        setLocalWarning(null);
                        warningTimerRef.current = null;
                    }, 2000);
                }

                let allowedText = textWithoutPrefix;

                if (ignoreSpacesInCount) {
                    let validCharsCount = 0;
                    let cutIndex = 0;

                    for (let i = 0; i < textWithoutPrefix.length; i++) {
                        if (textWithoutPrefix[i] !== ' ') {
                            validCharsCount++;
                        }

                        if (validCharsCount > maxLength) {
                            break;
                        }
                        cutIndex = i + 1;
                    }
                    allowedText = textWithoutPrefix.slice(0, cutIndex).trimEnd();
                } else {
                    const leadingSpacesCount = textWithoutPrefix.length - textWithoutPrefix.trimStart().length;
                    allowedText = textWithoutPrefix.slice(0, maxLength + leadingSpacesCount);
                }

                newValue = prefix + allowedText;
            } else {
                if (!warningTriggered) {
                    setLocalWarning(null);
                    if (warningTimerRef.current) {
                        clearTimeout(warningTimerRef.current);
                        warningTimerRef.current = null;
                    }
                }
            }
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

    const currentLength = ignoreSpacesInCount
        ? getNormalizedInputText(value, prefix).replace(/\s/g, '').length
        : getNormalizedInputText(value, prefix).length;
    const showCharacterCounter = maxLength !== undefined;
    const showFooter = editable && (showCharacterCounter || error || localWarning);

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
                        maxLength={undefined}
                    />

                    {showClearButton && (
                        <button
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={handleClear}
                            aria-label="Clear input"
                            className={classNames('donate-input-clear-button', {
                                error: !!error || !!localWarning,
                            })}
                        ></button>
                    )}
                </div>
            </div>

            {showFooter && (
                <div className="donate-input-footer">
                    <span className="donate-input-error">{localWarning || error || ''}</span>
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
