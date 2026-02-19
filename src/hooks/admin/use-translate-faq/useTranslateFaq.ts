import { useState } from 'react';
import { FAQ_TEXT } from '@/const/admin/faq';
import { TranslateFaqFormValues } from '@/pages/admin/faq/components/faq-modals/translate-faq-modal/TranslateFaqForm';
import { FaqLocalizationsApi } from '@/services/api/admin/faq/faq-localizations/faq-localizations-api';
import { FaqQuestion, FaqLocalization } from '@/types/admin/faq';
import { LocalizationLanguage } from '@/types/common/language';
import { mapLocalizationDtoToModel } from '@/utils/functions/mappers/common/localization/localization-mappers';
import { useAdminClient } from '@/hooks/admin/use-admin-client/useAdminClient';
import { ModalMode } from '@/types/admin/common';

interface UseTranslateFaqParams {
    faq: FaqQuestion | null;
    language: LocalizationLanguage;
    onSuccess: (updatedFaq: FaqQuestion) => void;
    mode: ModalMode;
}

export const useTranslateFaq = ({ faq, language, onSuccess, mode }: UseTranslateFaqParams) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string>('');

    const client = useAdminClient();
    const isEditMode = mode === ModalMode.Edit;

    const translateFaq = async (data: TranslateFaqFormValues) => {
        if (!faq) return;

        try {
            setIsSubmitting(true);
            setError('');

            if (isEditMode) {
                const updatedLocalizationDto = await FaqLocalizationsApi.update(client, faq.id, language.id, {
                    questionText: data.question,
                    answerText: data.answer,
                });

                const updatedLocalization = mapLocalizationDtoToModel<typeof updatedLocalizationDto, FaqLocalization>(
                    updatedLocalizationDto,
                );

                const updatedFaq: FaqQuestion = {
                    ...faq,
                    localizations:
                        faq.localizations?.map((loc) =>
                            loc.language.id === language.id ? updatedLocalization : loc,
                        ) || [],
                };

                onSuccess(updatedFaq);
            } else {
                const createdLocalizationDto = await FaqLocalizationsApi.create(client, {
                    entityId: faq.id,
                    languageId: language.id,
                    questionText: data.question,
                    answerText: data.answer,
                });

                const createdLocalization = mapLocalizationDtoToModel<typeof createdLocalizationDto, FaqLocalization>(
                    createdLocalizationDto,
                );

                const updatedFaq: FaqQuestion = {
                    ...faq,
                    localizations: [...(faq.localizations || []), createdLocalization],
                };

                onSuccess(updatedFaq);
            }
        } catch (err) {
            const errorMessage = isEditMode
                ? FAQ_TEXT.FORM?.MESSAGE?.FAIL_TO_UPDATE_TRANSLATION
                : FAQ_TEXT.FORM?.MESSAGE?.FAIL_TO_TRANSLATE_FAQ;
            setError(errorMessage);
            throw err;
        } finally {
            setIsSubmitting(false);
        }
    };

    const clearError = () => setError('');

    return {
        translateFaq,
        isSubmitting,
        error,
        clearError,
    };
};
