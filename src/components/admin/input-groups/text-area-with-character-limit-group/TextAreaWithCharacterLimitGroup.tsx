import React, { useState } from 'react';
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
    maxLimitWarning?: string;
    isWhiteLabel?: boolean;
    errorCounterContainerClassName?: string;
    normalizeValue?: (value: string) => string;
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
    className,
    maxLimitWarning,
    isWhiteLabel,
    errorCounterContainerClassName,
    autoGrow,
    maxRows,
    normalizeValue,
}: TextAreaWithCharacterLimitGroupProps) => {
    const [localWarning, setLocalWarning] = useState<string | null>(null);
    const counterId = `${id}-character-count`;

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
                hasError={!!error || !!localWarning}
                maxLimitWarning={maxLimitWarning}
                onWarningChange={setLocalWarning}
                autoGrow={autoGrow}
                maxRows={maxRows}
                normalizeValue={normalizeValue}
            />
            <InputErrorWithCharacterCounter
                error={localWarning || error}
                maxLength={maxLength}
                counterId={counterId}
                htmlFor={id}
                value={value}
                isWhiteLabel={isWhiteLabel}
                containerClassName={errorCounterContainerClassName}
            />
        </div>
    );
};
