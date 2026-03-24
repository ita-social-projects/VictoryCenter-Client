import { useFormContext, Controller } from 'react-hook-form';
import { CustomFormGroup } from '../company-profile-form-group/CompanyProfileFormGroup';
import { COMPANY_PROFILE_TEXT } from '@/const/admin/company-profile';
import styles from './CompanyProfileTab.module.scss';
import { CompanyProfileFormValues } from '@/types/admin/company-profile';

interface ProfileTabProps {
    disabled: boolean;
}

export const CompanyProfileTab = ({ disabled }: ProfileTabProps) => {
    const {
        control,
        formState: { errors },
    } = useFormContext<CompanyProfileFormValues>();

    const showCounter = !disabled;

    return (
        <div className={styles['profile-tab-container']}>
            <div className={styles['form-row']}>
                <h2 className={styles['profile-tab-title']}>{COMPANY_PROFILE_TEXT.PROFILE_TAB.SECTION_TITLE}</h2>
            </div>

            <div className={styles['profile-tab-fields']}>
                <Controller
                    name="phone"
                    control={control}
                    render={({ field }) => (
                        <CustomFormGroup
                            {...field}
                            id="phone"
                            labelText={COMPANY_PROFILE_TEXT.PROFILE_TAB.PHONE_LABEL}
                            isRequired={true}
                            maxLength={20}
                            disabled={disabled}
                            showCounter={showCounter}
                            error={errors.phone?.message as string}
                        />
                    )}
                />

                <Controller
                    name="addressUa"
                    control={control}
                    render={({ field }) => (
                        <CustomFormGroup
                            {...field}
                            id="addressUa"
                            labelText={COMPANY_PROFILE_TEXT.PROFILE_TAB.PROFILE_ADDRESS_UA_LABEL}
                            tooltipText={COMPANY_PROFILE_TEXT.PROFILE_TAB.TOOLTIP_ADDRESS_UA}
                            isRequired={true}
                            maxLength={100}
                            disabled={disabled}
                            showCounter={showCounter}
                            error={errors.addressUa?.message as string}
                        />
                    )}
                />

                <Controller
                    name="addressEng"
                    control={control}
                    render={({ field }) => (
                        <CustomFormGroup
                            {...field}
                            id="addressEng"
                            labelText={COMPANY_PROFILE_TEXT.PROFILE_TAB.PROFILE_ADDRESS_EN_LABEL}
                            tooltipText={COMPANY_PROFILE_TEXT.PROFILE_TAB.TOOLTIP_ADDRESS_EN}
                            isRequired={true}
                            maxLength={100}
                            disabled={disabled}
                            showCounter={showCounter}
                            error={errors.addressEng?.message as string}
                        />
                    )}
                />

                <Controller
                    name="email"
                    control={control}
                    render={({ field }) => (
                        <CustomFormGroup
                            {...field}
                            id="email"
                            labelText={COMPANY_PROFILE_TEXT.PROFILE_TAB.EMAIL_LABEL}
                            isRequired={true}
                            type="email"
                            maxLength={50}
                            disabled={disabled}
                            showCounter={showCounter}
                            error={errors.email?.message as string}
                        />
                    )}
                />

                <Controller
                    name="correspondenceEmail"
                    control={control}
                    render={({ field }) => (
                        <CustomFormGroup
                            {...field}
                            id="correspondenceEmail"
                            labelText={COMPANY_PROFILE_TEXT.PROFILE_TAB.CORRESPONDENCE_EMAIL_LABEL}
                            isRequired={true}
                            type="email"
                            maxLength={50}
                            disabled={disabled}
                            showCounter={showCounter}
                            error={errors.correspondenceEmail?.message as string}
                        />
                    )}
                />

                <Controller
                    name="mottoUa"
                    control={control}
                    render={({ field }) => (
                        <CustomFormGroup
                            {...field}
                            id="mottoUa"
                            labelText={COMPANY_PROFILE_TEXT.PROFILE_TAB.MOTTO_UA_LABEL}
                            maxLength={200}
                            disabled={disabled}
                            showCounter={showCounter}
                            error={errors.mottoUa?.message as string}
                        />
                    )}
                />

                <Controller
                    name="mottoEng"
                    control={control}
                    render={({ field }) => (
                        <CustomFormGroup
                            {...field}
                            id="mottoEng"
                            labelText={COMPANY_PROFILE_TEXT.PROFILE_TAB.MOTTO_EN_LABEL}
                            maxLength={200}
                            disabled={disabled}
                            showCounter={showCounter}
                            error={errors.mottoEng?.message as string}
                        />
                    )}
                />
            </div>
        </div>
    );
};
