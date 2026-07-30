import { ModalMode } from '@/types/admin/common';
import { PartnerBanner, PartnerBannerLocalization } from '@/types/admin/partners';
import { LocalizationLanguage } from '@/types/common/language';
import { useAdminClient } from '../use-admin-client/useAdminClient';
import { useState } from 'react';
import { PartnerBannerLocalizationApi } from '@/services/api/admin/partners/partners-banner-localizations-api';
import { mapLocalizationDtoToModel } from '@/utils/functions/mappers/common/localization/localization-mappers';
import { PARTNERS_TEXT } from '@/const/admin/partners';
import { TranslatePartnerBannerFormValues } from '@/pages/admin/partners/components/translate-partner-banner-form/TranslatePartnerBannerForm';

interface UseTranslatePartnerBannerParams {
    banner: PartnerBanner | null;
    language: LocalizationLanguage;
    onSuccess: (updatedBanner: PartnerBanner) => void;
    mode: ModalMode;
}

export const useTranslatePartnerBanner = ({ banner, language, onSuccess, mode }: UseTranslatePartnerBannerParams) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string>('');

    const client = useAdminClient();
    const isEditMode = mode === ModalMode.Edit;

    const translateBanner = async (data: TranslatePartnerBannerFormValues) => {
        if (!banner) return;

        try {
            setIsSubmitting(true);
            setError('');

            if (isEditMode) {
                const updatedLocalizationDto = await PartnerBannerLocalizationApi.update(
                    client,
                    banner.id,
                    language.id,
                    {
                        title: data.title,
                        description: data.description,
                    },
                );

                const updatedLocalization = mapLocalizationDtoToModel<
                    typeof updatedLocalizationDto,
                    PartnerBannerLocalization
                >(updatedLocalizationDto);

                const updatedBanner: PartnerBanner = {
                    ...banner,
                    localizations:
                        banner.localizations?.map((loc) =>
                            loc.language.id === language.id ? updatedLocalization : loc,
                        ) || [],
                };
                onSuccess(updatedBanner);
            } else {
                const createdLocalizationDto = await PartnerBannerLocalizationApi.create(client, {
                    entityId: banner.id,
                    languageId: language.id,
                    title: data.title,
                    description: data.description,
                });

                const createdLocalization = mapLocalizationDtoToModel<
                    typeof createdLocalizationDto,
                    PartnerBannerLocalization
                >(createdLocalizationDto);

                const updatedBanner: PartnerBanner = {
                    ...banner,
                    localizations: [...(banner.localizations || []), createdLocalization],
                };
                onSuccess(updatedBanner);
            }
        } catch (err) {
            const errorMessage = isEditMode
                ? PARTNERS_TEXT.MESSAGE.FAIL_TO_UPDATE_TRANSLATION_FOR_BANNER
                : PARTNERS_TEXT.MESSAGE.FAIL_TO_TRANSLATE_BANNER;
            setError(errorMessage);
            throw err;
        } finally {
            setIsSubmitting(false);
        }
    };

    const clearError = () => setError('');

    return {
        translateBanner,
        isSubmitting,
        error,
        clearError,
    };
};
