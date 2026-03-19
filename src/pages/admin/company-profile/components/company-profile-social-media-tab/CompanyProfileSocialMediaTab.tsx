import { useFormContext, Controller } from 'react-hook-form';
import { CustomFormGroup } from '../company-profile-form-group/CompanyProfileFormGroup';
import { COMPANY_PROFILE_TEXT } from '@/const/admin/company-profile';
import './CompanyProfileSocialMediaTab.scss';

interface CompanyProfileSocialMediaTabProps {
    disabled: boolean;
}

export const CompanyProfileSocialMediaTab = ({ disabled }: CompanyProfileSocialMediaTabProps) => {
    const {
        control,
        formState: { errors },
    } = useFormContext();

    return (
        <div className="social-media-tab-container">
            <div className="form-row full-width">
                <h2 className="social-media-tab-title">{COMPANY_PROFILE_TEXT.SOCIAL_MEDIA_TAB.SECTION_TITLE}</h2>
            </div>

            <div className="form-row">
                <Controller
                    name="facebookUrl"
                    control={control}
                    render={({ field }) => (
                        <CustomFormGroup
                            {...field}
                            id="facebookUrl"
                            labelText={COMPANY_PROFILE_TEXT.SOCIAL_MEDIA_TAB.FACEBOOK_LABEL}
                            isRequired={false}
                            maxLength={500}
                            disabled={disabled}
                            error={errors.facebookUrl?.message as string}
                        />
                    )}
                />
                <Controller
                    name="instagramUrl"
                    control={control}
                    render={({ field }) => (
                        <CustomFormGroup
                            {...field}
                            id="instagramUrl"
                            labelText={COMPANY_PROFILE_TEXT.SOCIAL_MEDIA_TAB.INSTAGRAM_LABEL}
                            isRequired={false}
                            maxLength={500}
                            disabled={disabled}
                            error={errors.instagramUrl?.message as string}
                        />
                    )}
                />
                <Controller
                    name="telegramUrl"
                    control={control}
                    render={({ field }) => (
                        <CustomFormGroup
                            {...field}
                            id="telegramUrl"
                            labelText={COMPANY_PROFILE_TEXT.SOCIAL_MEDIA_TAB.TELEGRAM_LABEL}
                            isRequired={false}
                            maxLength={500}
                            disabled={disabled}
                            error={errors.telegramUrl?.message as string}
                        />
                    )}
                />
            </div>
        </div>
    );
};
