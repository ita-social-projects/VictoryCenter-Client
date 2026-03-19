import React from 'react';
import {
    InputWithCharacterLimit,
    InputWithCharacterLimitProps,
} from '@/components/admin/input-with-character-limit/InputWithCharacterLimit';
import { InputError } from '@/components/admin/input-error/InputError';
import { ButtonTooltip } from '@/components/admin/button-tooltip/ButtonTooltip';
import './CompanyProfileFormGroup.scss';

export interface CustomFormGroupProps extends Omit<InputWithCharacterLimitProps, 'hasError'> {
    labelText: string;
    tooltipText?: string;
    isRequired?: boolean;
    error?: string;
}

export const CustomFormGroup = ({
    id,
    labelText,
    tooltipText,
    isRequired,
    error,
    ...inputProps
}: CustomFormGroupProps) => {
    return (
        <div className="custom-form-group">
            <div className="custom-form-group__label-wrapper">
                <label htmlFor={id}>
                    {isRequired && <span className="custom-form-group__required">*</span>}
                    {labelText}
                </label>
            </div>

            <div className="custom-form-group__input-wrapper">
                <InputWithCharacterLimit {...inputProps} id={id} hasError={!!error} />

                {tooltipText && (
                    <div className="custom-form-group__tooltip">
                        <ButtonTooltip position="bottom">{tooltipText}</ButtonTooltip>
                    </div>
                )}
            </div>

            <InputError error={error} />
        </div>
    );
};
