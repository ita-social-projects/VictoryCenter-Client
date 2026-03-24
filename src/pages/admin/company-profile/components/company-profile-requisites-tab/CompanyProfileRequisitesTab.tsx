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
                            isRequired={true}
                            maxLength={100}
                            disabled={disabled}
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
                            isRequired={true}
                            maxLength={100}
                            disabled={disabled}
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
                            labelText={COMPANY_PROFILE_TEXT.REQUISITES_TAB.COMPANY_REGISTRATION_NUMBER_LABEL}
                            tooltipText={COMPANY_PROFILE_TEXT.REQUISITES_TAB.TOOLTIP_COMPANY_REGISTRATION_NUMBER}
                            isRequired={true}
                            maxLength={8}
                            disabled={disabled}
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
                            isRequired={true}
                            maxLength={100}
                            disabled={disabled}
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
                            isRequired={true}
                            maxLength={100}
                            disabled={disabled}
                            error={errors.addressEn_requisites?.message as string}
                        />
                    )}
                />
            </div>
        </div>
    );
};
