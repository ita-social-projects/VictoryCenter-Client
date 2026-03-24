import React from 'react';
import cn from 'classnames';
import {
    InputWithCharacterLimit,
    InputWithCharacterLimitProps,
} from '@/components/admin/input-with-character-limit/InputWithCharacterLimit';
import { InputError } from '@/components/admin/input-error/InputError';
import { ButtonTooltip } from '@/components/admin/button-tooltip/ButtonTooltip';
import styles from './CompanyProfileFormGroup.module.scss';

export interface CustomFormGroupProps extends Omit<InputWithCharacterLimitProps, 'hasError'> {
    labelText: string;
    tooltipText?: string;
    isRequired?: boolean;
    error?: string;
    hideLabel?: boolean;
}

export const CustomFormGroup = ({
    id,
    labelText,
    tooltipText,
    isRequired,
    error,
    hideLabel = false,
    ...inputProps
}: CustomFormGroupProps) => {
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
                    counterPosition="bottom"
                    className={cn(styles['char-limit-input'], inputProps.className)}
                />

                <div className={styles['custom-form-group-tooltip-slot']}>
                    {tooltipText && (
                        <div className={styles['custom-form-group-tooltip']}>
                            <ButtonTooltip position="bottom">{tooltipText}</ButtonTooltip>
                        </div>
                    )}
                </div>
            </div>

            <InputError error={error} />
        </div>
    );
};
