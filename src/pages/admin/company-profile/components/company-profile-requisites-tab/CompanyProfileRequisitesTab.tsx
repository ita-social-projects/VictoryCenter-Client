import React from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { CustomFormGroup } from '../company-profile-form-group/CompanyProfileFormGroup';
import styles from './CompanyProfileRequisitesTab.module.scss';
import { COMPANY_PROFILE_TEXT } from '@/const/admin/company-profile';
import { CompanyProfileFormValues } from '@/types/admin/company-profile';

interface CompanyProfileRequisitesTabProps {
    disabled: boolean;
}

export const CompanyProfileRequisitesTab = ({ disabled }: CompanyProfileRequisitesTabProps) => {
    const {
        control,
        formState: { errors },
    } = useFormContext<CompanyProfileFormValues>();

    const showCounter = !disabled;

    return (
        <div className={styles['requisites-tab-container']}>
            <div className={styles['form-row']}>
                <h2 className={styles['requisites-tab-title']}>{COMPANY_PROFILE_TEXT.REQUISITES_TAB.SECTION_TITLE}</h2>
            </div>

            <div className={styles['requisites-tab-fields']}>
                <Controller
                    name="requisitesUa"
                    control={control}
                    render={({ field }) => (
                        <CustomFormGroup
                            {...field}
                            id="requisitesUa"
                            labelText={COMPANY_PROFILE_TEXT.REQUISITES_TAB.REQUISITES_UA_LABEL}
                            tooltipText={COMPANY_PROFILE_TEXT.REQUISITES_TAB.TOOLTIP_REQUISITES_UA}
                            isRequired
                            maxLength={100}
                            disabled={disabled}
                            showCounter={showCounter}
                            error={errors.requisitesUa?.message as string}
                        />
                    )}
                />

                <Controller
                    name="requisitesEn"
                    control={control}
                    render={({ field }) => (
                        <CustomFormGroup
                            {...field}
                            id="requisitesEn"
                            labelText={COMPANY_PROFILE_TEXT.REQUISITES_TAB.REQUISITES_EN_LABEL}
                            tooltipText={COMPANY_PROFILE_TEXT.REQUISITES_TAB.TOOLTIP_REQUISITES_EN}
                            isRequired
                            maxLength={100}
                            disabled={disabled}
                            showCounter={showCounter}
                            error={errors.requisitesEn?.message as string}
                        />
                    )}
                />

                <Controller
                    name="companyRegistrationNumber"
                    control={control}
                    render={({ field }) => (
                        <CustomFormGroup
                            {...field}
                            id="companyRegistrationNumber"
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                const raw = e.target.value ?? '';
                                const digitsOnly = raw.replace(/\D/g, '').slice(0, 8);
                                field.onChange(digitsOnly);
                            }}
                            labelText={COMPANY_PROFILE_TEXT.REQUISITES_TAB.COMPANY_REGISTRATION_NUMBER_LABEL}
                            tooltipText={COMPANY_PROFILE_TEXT.REQUISITES_TAB.TOOLTIP_COMPANY_REGISTRATION_NUMBER}
                            isRequired
                            maxLength={8}
                            disabled={disabled}
                            showCounter={showCounter}
                            error={errors.companyRegistrationNumber?.message as string}
                        />
                    )}
                />

                <Controller
                    name="addressUa_requisites"
                    control={control}
                    render={({ field }) => (
                        <CustomFormGroup
                            {...field}
                            id="addressUa_requisites"
                            labelText={COMPANY_PROFILE_TEXT.REQUISITES_TAB.REQUISITES_ADDRESS_UA_LABEL}
                            tooltipText={COMPANY_PROFILE_TEXT.REQUISITES_TAB.TOOLTIP_REQUISITES_ADDRESS_UA}
                            isRequired
                            maxLength={100}
                            disabled={disabled}
                            showCounter={showCounter}
                            error={errors.addressUa_requisites?.message as string}
                        />
                    )}
                />

                <Controller
                    name="addressEn_requisites"
                    control={control}
                    render={({ field }) => (
                        <CustomFormGroup
                            {...field}
                            id="addressEn_requisites"
                            labelText={COMPANY_PROFILE_TEXT.REQUISITES_TAB.REQUISITES_ADDRESS_EN_LABEL}
                            tooltipText={COMPANY_PROFILE_TEXT.REQUISITES_TAB.TOOLTIP_REQUISITES_ADDRESS_EN}
                            isRequired
                            maxLength={100}
                            disabled={disabled}
                            showCounter={showCounter}
                            error={errors.addressEn_requisites?.message as string}
                        />
                    )}
                />
            </div>
        </div>
    );
};
