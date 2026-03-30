import React from 'react';
import cn from 'classnames';
import {
    InputWithCharacterLimit,
    InputWithCharacterLimitProps,
} from '@/components/admin/input-with-character-limit/InputWithCharacterLimit';
import { ButtonTooltip } from '@/components/admin/button-tooltip/ButtonTooltip';
import { InputErrorWithCharacterCounter } from '@/components/admin/input-error-with-character-counter/InputErrorWithCharacterCounter';
import styles from './CompanyProfileFormGroup.module.scss';

export interface CustomFormGroupProps extends Omit<InputWithCharacterLimitProps, 'hasError'> {
    labelText: string;
    tooltipText?: string;
    isRequired?: boolean;
    error?: string;
    hideLabel?: boolean;
    showCounter?: boolean;
}

export const CustomFormGroup = ({
    id,
    labelText,
    tooltipText,
    isRequired,
    error,
    hideLabel = false,
    showCounter = true,
    ...inputProps
}: CustomFormGroupProps) => {
    const counterId = `${id}-character-count`;

    return (
        <div className={styles['custom-form-group']}>
            {!hideLabel && (
                <div className={styles['custom-form-group-label-wrapper']}>
                    <label htmlFor={id}>
                        {isRequired && <span className={styles['custom-form-group-required']}>*</span>}
                        {labelText}
                    </label>
                </div>
            )}

            <div className={styles['custom-form-group-input-wrapper']}>
                <InputWithCharacterLimit
                    {...inputProps}
                    id={id}
                    hasError={!!error}
                    showCounter={false}
                    className={cn(styles['char-limit-input'], inputProps.className)}
                />

                {tooltipText && (
                    <div className={styles['custom-form-group-tooltip-inside']}>
                        <ButtonTooltip position="bottom" isRenderInPortal>
                            {tooltipText}
                        </ButtonTooltip>
                    </div>
                )}
            </div>

            {showCounter ? (
                <InputErrorWithCharacterCounter
                    error={error}
                    maxLength={inputProps.maxLength}
                    value={String(inputProps.value ?? '')}
                    counterId={counterId}
                    htmlFor={id}
                />
            ) : (
                <InputErrorWithCharacterCounter
                    error={error}
                    maxLength={inputProps.maxLength}
                    value={String(inputProps.value ?? '')}
                    counterId={counterId}
                    htmlFor={id}
                    containerClassName={styles['meta-row--error-only']}
                />
            )}
        </div>
    );
};
