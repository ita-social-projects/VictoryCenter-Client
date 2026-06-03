import React, { useState } from 'react';
import { InputLabel, InputLabelProps } from '@/components/admin/input-label/InputLabel';
import { InputError, InputErrorProps } from '@/components/admin/input-error/InputError';
import { InputErrorWithCharacterCounter } from '@/components/admin/input-error-with-character-counter/InputErrorWithCharacterCounter';
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
    showCounterBelow?: boolean;
    isWhiteLabel?: boolean;
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
    rows,
    autoGrow,
    maxRows,
    className,
    maxLimitWarning,
    showCounterBelow = false,
    isWhiteLabel,
}: InputWithCharacterLimitGroupProps) => {
    const [localWarning, setLocalWarning] = useState<string | null>(null);
    const displayedError = localWarning || error;
    const counterId = `${id}-character-count`;

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
                hasError={!!displayedError}
                maxLimitWarning={maxLimitWarning}
                onWarningChange={setLocalWarning}
                showCounter={!showCounterBelow}
                rows={rows}
                autoGrow={autoGrow}
                maxRows={maxRows}
            />
            {showCounterBelow ? (
                <InputErrorWithCharacterCounter
                    error={displayedError}
                    maxLength={maxLength}
                    counterId={counterId}
                    htmlFor={id}
                    value={value}
                    isWhiteLabel={isWhiteLabel}
                />
            ) : (
                <InputError error={displayedError} />
            )}
        </div>
    );
};
