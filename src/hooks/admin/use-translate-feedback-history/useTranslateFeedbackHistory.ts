import { useState } from 'react';
import { FEEDBACK_TEXT } from '@/const/admin/feedback';
import { TranslateFeedbackHistoryFormValues } from '@/pages/admin/feedback-page/components/translate-feedback-history-form/TranslateFeedbackHistoryForm';
import { FeedbackHistoryLocalizationsApi } from '@/services/api/admin/feedback/feedback-history-localizations/feedback-history-localizations-api';
import { FeedbackHistoryDto, FeedbackHistoryLocalization } from '@/types/admin/feedback';
import { LocalizationLanguage } from '@/types/common/language';
import { mapLocalizationDtoToModel } from '@/utils/functions/mappers/common/localization/localization-mappers';
import { useAdminClient } from '../use-admin-client/useAdminClient';
import { ModalMode } from '@/types/admin/common';

interface UseTranslateFeedbackHistoryParams {
    history: FeedbackHistoryDto | null;
    language: LocalizationLanguage;
    onSuccess: (updatedHistory: FeedbackHistoryDto) => void;
    mode: ModalMode;
}

export const useTranslateFeedbackHistory = ({
    history,
    language,
    onSuccess,
    mode,
}: UseTranslateFeedbackHistoryParams) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string>('');

    const client = useAdminClient();
    const isEditMode = mode === ModalMode.Edit;

    const translateHistory = async (data: TranslateFeedbackHistoryFormValues) => {
        if (!history) return;

        try {
            setIsSubmitting(true);
            setError('');

            if (isEditMode) {
                const updatedLocalizationDto = await FeedbackHistoryLocalizationsApi.update(
                    client,
                    history.id,
                    language.id,
                    { title: data.title, story: data.story },
                );

                const updatedLocalization = mapLocalizationDtoToModel<
                    typeof updatedLocalizationDto,
                    FeedbackHistoryLocalization
                >(updatedLocalizationDto);

                const updatedHistory: FeedbackHistoryDto = {
                    ...history,
                    localizations:
                        history.localizations?.map((loc) =>
                            loc.language.id === language.id ? updatedLocalization : loc,
                        ) || [],
                };

                onSuccess(updatedHistory);
            } else {
                const createdLocalizationDto = await FeedbackHistoryLocalizationsApi.create(client, {
                    entityId: history.id,
                    languageId: language.id,
                    title: data.title,
                    story: data.story,
                });

                const createdLocalization = mapLocalizationDtoToModel<
                    typeof createdLocalizationDto,
                    FeedbackHistoryLocalization
                >(createdLocalizationDto);

                const updatedHistory: FeedbackHistoryDto = {
                    ...history,
                    localizations: [...(history.localizations || []), createdLocalization],
                };

                onSuccess(updatedHistory);
            }
        } catch (err) {
            setError(FEEDBACK_TEXT.MESSAGE.FAIL_TO_TRANSLATE);
            throw err;
        } finally {
            setIsSubmitting(false);
        }
    };

    const clearError = () => setError('');

    return {
        translateHistory,
        isSubmitting,
        error,
        clearError,
    };
};
