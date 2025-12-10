import React from 'react';
import { InputLabel, InputLabelProps } from '@/components/admin/input-label/InputLabel';
import { InputError, InputErrorProps } from '@/components/admin/input-error/InputError';
import {
    InputWithCharacterLimit,
    InputWithCharacterLimitProps,
} from '@/components/admin/input-with-character-limit/InputWithCharacterLimit';
import '../input-group.scss';

export interface InputWithCharacterLimitGroupProps extends InputWithCharacterLimitProps {
    label: InputLabelProps['text'];
    isRequired?: InputLabelProps['isRequired'];
    error?: InputErrorProps['error'];
}

export const InputWithCharacterLimitGroup = ({
    label,
    isRequired,
    id,
    name,
    value,
    onChange,
    onBlur,
    onFocus,
    maxLength,
    type,
    disabled,
    placeholder,
    error,
}: InputWithCharacterLimitGroupProps) => {
    return (
        <div className="input-group">
            <InputLabel htmlFor={id} text={label} isRequired={isRequired} />
            <InputWithCharacterLimit
                id={id}
                name={name}
                value={value}
                onChange={onChange}
                onBlur={onBlur}
                onFocus={onFocus}
                maxLength={maxLength}
                type={type}
                disabled={disabled}
                placeholder={placeholder}
            />
            <InputError error={error} />
        </div>
    );
};
