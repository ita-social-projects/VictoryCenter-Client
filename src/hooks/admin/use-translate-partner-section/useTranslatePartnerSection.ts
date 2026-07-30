import { useEffect, useState } from 'react';
import { useAdminClient } from '../use-admin-client/useAdminClient';
import { PartnerSectionLocalizationApi } from '@/services/api/admin/partners/partner-section-localizations-api';
import { PartnerLocalizationDto, PartnerSection, PartnerSectionLocalizationDto } from '@/types/admin/partners';
import { LocalizationLanguage } from '@/types/common/language';
import { PARTNERS_TEXT } from '@/const/admin/partners';

export interface TranslatePartnerSectionFormValues {
    title: string;
    description: string;
    partners: { partnerId: number; description: string }[];
}

interface UseTranslatePartnerSectionParams {
    section: PartnerSection | null;
    language: LocalizationLanguage | null;
    isOpen: boolean;
    onSuccess: () => void;
}

export const useTranslatePartnerSection = ({
    section,
    language,
    isOpen,
    onSuccess,
}: UseTranslatePartnerSectionParams) => {
    const client = useAdminClient();

    const [isLoadingTranslation, setIsLoadingTranslation] = useState(false);
    const [translationFetchError, setTranslationFetchError] = useState<string>('');
    const [existingTranslation, setExistingTranslation] = useState<PartnerSectionLocalizationDto | null>(null);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        if (!isOpen || !section || !language) {
            setExistingTranslation(null);
            setTranslationFetchError('');
            return;
        }

        let cancelled = false;

        const fetchTranslation = async () => {
            setIsLoadingTranslation(true);
            setTranslationFetchError('');

            try {
                const result = await PartnerSectionLocalizationApi.get(client, section.id, language.id);
                if (!cancelled) {
                    setExistingTranslation(result);
                }
            } catch {
                if (!cancelled) {
                    setTranslationFetchError(PARTNERS_TEXT.MESSAGE.FAIL_TO_LOAD_TRANSLATION_FOR_SECTION);
                }
            } finally {
                if (!cancelled) {
                    setIsLoadingTranslation(false);
                }
            }
        };

        fetchTranslation();

        return () => {
            cancelled = true;
        };
    }, [isOpen, section, language, client]);

    const isEditMode = existingTranslation !== null;

    const translateSection = async (data: TranslatePartnerSectionFormValues) => {
        if (!section || !language) return;

        try {
            setIsSubmitting(true);
            setError('');

            const partnersPayload: PartnerLocalizationDto[] = data.partners.map((partner) => ({
                partnerId: partner.partnerId,
                description: partner.description,
            }));

            if (isEditMode) {
                await PartnerSectionLocalizationApi.update(client, section.id, language.id, {
                    title: data.title,
                    description: data.description,
                    partners: partnersPayload,
                });
            } else {
                await PartnerSectionLocalizationApi.create(client, {
                    entityId: section.id,
                    languageId: language.id,
                    title: data.title,
                    description: data.description,
                    partners: partnersPayload,
                });
            }

            onSuccess();
        } catch (err) {
            const errorMessage = isEditMode
                ? PARTNERS_TEXT.MESSAGE.FAIL_TO_UPDATE_TRANSLATION_FOR_SECTION
                : PARTNERS_TEXT.MESSAGE.FAIL_TO_TRANSLATE_SECTION;
            setError(errorMessage);
            throw err;
        } finally {
            setIsSubmitting(false);
        }
    };

    const clearError = () => setError('');

    return {
        translateSection,
        isSubmitting,
        error,
        clearError,
        isEditMode,
        existingTranslation,
        isLoadingTranslation,
        translationFetchError,
    };
};
