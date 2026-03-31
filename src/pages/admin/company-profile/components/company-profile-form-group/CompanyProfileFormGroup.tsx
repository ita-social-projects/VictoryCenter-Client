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
                    showCounter={showCounter}
                    className={cn(styles['char-limit-input'], inputProps.className)}
                />

                {tooltipText && inputProps.disabled && (
                    <div className={styles['custom-form-group-tooltip-inside']}>
                        <ButtonTooltip position="bottom" isRenderInPortal>
                            {tooltipText}
                        </ButtonTooltip>
                    </div>
                )}
            </div>

            <InputError error={error} />
        </div>
    );
};
