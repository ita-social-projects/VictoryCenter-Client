import React, { useMemo } from 'react';
import { InputLabel, InputLabelProps } from '@/components/admin/input-label/InputLabel';
import { InputError, InputErrorProps } from '@/components/admin/input-error/InputError';
import { InputErrorWithCharacterCounter } from '@/components/admin/input-error-with-character-counter/InputErrorWithCharacterCounter';
import { RichTextInput, RichTextInputProps } from '@/components/admin/rich-text-input/RichTextInput';
import '../input-group.scss';
import cn from 'classnames';

export interface RichTextInputGroupProps extends Omit<RichTextInputProps, 'onChange' | 'hasError' | 'showCounter'> {
    label: InputLabelProps['text'];
    isRequired?: InputLabelProps['isRequired'];
    error?: InputErrorProps['error'];
    className?: string;
    onChange: (value: string) => void;
    showCounterBelow?: boolean;
    isWhiteLabel?: boolean;
}

export const RichTextInputGroup = ({
    label,
    isRequired,
    id,
    name,
    value,
    onChange,
    onBlur,
    onFocus,
    maxLength,
    disabled,
    hideToolbar,
    placeholder,
    error,
    className,
    trimOnBlur,
    showCounterBelow = false,
    isWhiteLabel,
}: RichTextInputGroupProps) => {
    const counterId = `${id}-character-count`;

    const plainTextValue = useMemo(() => {
        if (!value) return '';
        const parsedDocument = new DOMParser().parseFromString(value, 'text/html');
        return parsedDocument.body.textContent ?? '';
    }, [value]);

    return (
        <div className={cn('input-group', className)}>
            <InputLabel htmlFor={id} text={label} isRequired={isRequired} />
            <RichTextInput
                id={id}
                name={name}
                value={value}
                onChange={onChange}
                onBlur={onBlur}
                onFocus={onFocus}
                maxLength={maxLength}
                disabled={disabled}
                hideToolbar={hideToolbar}
                placeholder={placeholder}
                hasError={!!error}
                trimOnBlur={trimOnBlur}
                showCounter={!showCounterBelow}
            />
            {showCounterBelow ? (
                <InputErrorWithCharacterCounter
                    error={error}
                    maxLength={maxLength}
                    counterId={counterId}
                    htmlFor={id}
                    value={plainTextValue}
                    isWhiteLabel={isWhiteLabel}
                />
            ) : (
                <InputError error={error} />
            )}
        </div>
    );
};
