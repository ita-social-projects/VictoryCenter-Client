import { useState } from 'react';
import { FAQ_TEXT } from '@/const/admin/faq';
import { TranslateFaqFormValues } from '@/pages/admin/faq/components/faq-modals/translate-faq-modal/TranslateFaqForm';
import { FaqLocalizationsApi } from '@/services/api/admin/faq/faq-localizations/faq-localizations-api'; // Проверь путь к этому сервису
import { FaqQuestion, FaqLocalization } from '@/types/admin/faq'; // Проверь, экспортируется ли FaqLocalization
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
                // UPDATE: Обновление существующего перевода
                const updatedLocalizationDto = await FaqLocalizationsApi.update(client, faq.id, language.id, {
                    question: data.question, // Используем поля из твоей формы
                    answer: data.answer,
                });

                const updatedLocalization = mapLocalizationDtoToModel<typeof updatedLocalizationDto, FaqLocalization>(
                    updatedLocalizationDto,
                );

                // Создаем новый объект FAQ с обновленным массивом локализаций
                const updatedFaq: FaqQuestion = {
                    ...faq,
                    localizations:
                        faq.localizations?.map((loc) =>
                            loc.language.id === language.id ? updatedLocalization : loc,
                        ) || [],
                };

                onSuccess(updatedFaq);
            } else {
                // CREATE: Создание нового перевода
                const createdLocalizationDto = await FaqLocalizationsApi.create(client, {
                    entityId: faq.id,
                    languageId: language.id,
                    question: data.question,
                    answer: data.answer,
                });

                const createdLocalization = mapLocalizationDtoToModel<typeof createdLocalizationDto, FaqLocalization>(
                    createdLocalizationDto,
                );

                // Создаем новый объект FAQ, добавляя новую локализацию в массив
                const updatedFaq: FaqQuestion = {
                    ...faq,
                    localizations: [...(faq.localizations || []), createdLocalization],
                };

                onSuccess(updatedFaq);
            }
        } catch (err) {
            const errorMessage = isEditMode
                ? FAQ_TEXT.FORM?.MESSAGE?.FAIL_TO_UPDATE_TRANSLATION || 'Failed to update translation'
                : FAQ_TEXT.FORM?.MESSAGE?.FAIL_TO_TRANSLATE_FAQ || 'Failed to translate FAQ';
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
