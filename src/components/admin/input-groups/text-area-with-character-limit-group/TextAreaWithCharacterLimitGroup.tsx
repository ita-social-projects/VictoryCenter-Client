import React from 'react';
import { InputLabel, InputLabelProps } from '@/components/admin/input-label/InputLabel';
import { InputErrorProps } from '@/components/admin/input-error/InputError';
import {
    TextAreaWithCharacterLimit,
    TextAreaWithCharacterLimitProps,
} from '@/components/admin/textarea-with-character-limit/TextAreaWithCharacterLimit';
import { InputErrorWithCharacterCounter } from '@/components/admin/input-error-with-character-counter/InputErrorWithCharacterCounter';
import '../input-group.scss';
import cn from 'classnames';

export interface TextAreaWithCharacterLimitGroupProps extends TextAreaWithCharacterLimitProps {
    label: InputLabelProps['text'];
    isRequired?: InputLabelProps['isRequired'];
    error?: InputErrorProps['error'];
    className?: string;
    currentLength?: number;
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
    currentLength,
    error,
    className,
}: TextAreaWithCharacterLimitGroupProps) => {
    const counterId = `${id}-character-count`;
    const resolvedCurrentLength = currentLength ?? value.length;

    return (
        <div className={cn('input-group', className)}>
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
            <InputErrorWithCharacterCounter
                error={error}
                currentLength={resolvedCurrentLength}
                maxLength={maxLength}
                counterId={counterId}
                htmlFor={id}
            />
        </div>
    );
};
