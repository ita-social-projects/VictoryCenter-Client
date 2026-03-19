import { useFormContext, Controller } from 'react-hook-form';
import { CustomFormGroup } from '../company-profile-form-group/CompanyProfileFormGroup';
import { COMPANY_PROFILE_TEXT } from '@/const/admin/company-profile';
import './CompanyProfileTab.scss';

interface ProfileTabProps {
    disabled: boolean;
}

export const CompanyProfileTab = ({ disabled }: ProfileTabProps) => {
    const {
        control,
        formState: { errors },
    } = useFormContext();

    return (
        <div className="profile-tab-container">
            <div className="form-row full-width">
                <h2 className="profile-tab-title">{COMPANY_PROFILE_TEXT.PROFILE_TAB.SECTION_TITLE}</h2>
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
                            error={errors.phone?.message as string}
                        />
                    )}
                />
            </div>

            <div className="form-row">
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
                            error={errors.addressEng?.message as string}
                        />
                    )}
                />
            </div>

            <div className="form-row">
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
                            error={errors.correspondenceEmail?.message as string}
                        />
                    )}
                />
            </div>

            <div className="form-row">
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
                            error={errors.mottoEng?.message as string}
                        />
                    )}
                />
            </div>
        </div>
    );
};
