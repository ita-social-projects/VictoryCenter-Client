import React from 'react';
import { InputLabel, InputLabelProps } from '@/components/admin/input-label/InputLabel';
import { InputError, InputErrorProps } from '@/components/admin/input-error/InputError';
import { RichTextInput, RichTextInputProps } from '@/components/admin/rich-text-input/RichTextInput';
import '../input-group.scss';
import cn from 'classnames';

export interface RichTextInputGroupProps extends Omit<RichTextInputProps, 'onChange'> {
    label: InputLabelProps['text'];
    isRequired?: InputLabelProps['isRequired'];
    error?: InputErrorProps['error'];
    className?: string;
    onChange: (value: string) => void;
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
}: RichTextInputGroupProps) => {
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
            />
            <InputError error={error} />
        </div>
    );
};
