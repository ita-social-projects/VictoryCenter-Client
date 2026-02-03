import React, { useState } from 'react';
import { InputLabel, InputLabelProps } from '@/components/admin/input-label/InputLabel';
import { InputError, InputErrorProps } from '@/components/admin/input-error/InputError';
import {
    InputWithCharacterLimit,
    InputWithCharacterLimitProps,
} from '@/components/admin/input-with-character-limit/InputWithCharacterLimit';
import '../input-group.scss';
import cn from 'classnames';

export interface InputWithCharacterLimitGroupProps extends InputWithCharacterLimitProps {
    label: InputLabelProps['text'];
    isRequired?: InputLabelProps['isRequired'];
    error?: InputErrorProps['error'];
    className?: string;
    maxLimitWarning?: string;
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
    className,
    maxLimitWarning,
}: InputWithCharacterLimitGroupProps) => {
    const [localWarning, setLocalWarning] = useState<string | null>(null);

    return (
        <div className={cn('input-group', className)}>
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
                hasError={!!error}
                maxLimitWarning={maxLimitWarning}
                onWarningChange={setLocalWarning}
            />
            <InputError error={localWarning || error} />
        </div>
    );
};
