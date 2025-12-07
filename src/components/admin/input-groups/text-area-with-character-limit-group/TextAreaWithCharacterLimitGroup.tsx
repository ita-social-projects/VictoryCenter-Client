import React from 'react';
import { InputLabel, InputLabelProps } from '@components/admin/input-label/InputLabel';
import { InputError, InputErrorProps } from '@components/admin/input-error/InputError';
import {
    TextAreaWithCharacterLimit,
    TextAreaWithCharacterLimitProps,
} from '@components/admin/textarea-with-character-limit/TextAreaWithCharacterLimit';
import '../input-group.scss';

export interface TextAreaWithCharacterLimitGroupProps extends TextAreaWithCharacterLimitProps {
    label: InputLabelProps['text'];
    isRequired?: InputLabelProps['isRequired'];
    error?: InputErrorProps['error'];
}

export const TextAreaWithCharacterLimitGroup = ({
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
    placeholder,
    rows,
    error,
}: TextAreaWithCharacterLimitGroupProps) => {
    return (
        <div className="input-group">
            <InputLabel htmlFor={id} text={label} isRequired={isRequired} />
            <TextAreaWithCharacterLimit
                id={id}
                name={name}
                value={value}
                onChange={onChange}
                onBlur={onBlur}
                onFocus={onFocus}
                maxLength={maxLength}
                disabled={disabled}
                placeholder={placeholder}
                rows={rows}
            />
            <InputError error={error} />
        </div>
    );
};
