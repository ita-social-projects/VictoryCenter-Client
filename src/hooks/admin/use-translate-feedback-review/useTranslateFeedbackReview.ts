import { useState } from 'react';
import { FEEDBACK_TEXT } from '@/const/admin/feedback';
import { TranslateFeedbackReviewFormValues } from '@/pages/admin/feedback-page/components/translate-feedback-review-form/TranslateFeedbackReviewForm';
import { FeedbackReviewLocalizationsApi } from '@/services/api/admin/feedback/feedback-review-localizations/feedback-review-localizations-api';
import { FeedbackReviewDto, FeedbackReviewLocalization } from '@/types/admin/feedback';
import { LocalizationLanguage } from '@/types/common/language';
import { mapLocalizationDtoToModel } from '@/utils/functions/mappers/common/localization/localization-mappers';
import { useAdminClient } from '../use-admin-client/useAdminClient';
import { ModalMode } from '@/types/admin/common';

interface UseTranslateFeedbackReviewParams {
    review: FeedbackReviewDto | null;
    language: LocalizationLanguage | null;
    onSuccess: (updatedReview: FeedbackReviewDto) => void;
    mode: ModalMode;
}

export const useTranslateFeedbackReview = ({ review, language, onSuccess, mode }: UseTranslateFeedbackReviewParams) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string>('');

    const client = useAdminClient();
    const isEditMode = mode === ModalMode.Edit;

    const translateReview = async (data: TranslateFeedbackReviewFormValues) => {
        if (!review || !language) return;

        try {
            setIsSubmitting(true);
            setError('');

            if (isEditMode) {
                const updatedLocalizationDto = await FeedbackReviewLocalizationsApi.update(
                    client,
                    review.id,
                    language.id,
                    { authorName: data.authorName, text: data.text },
                );

                const updatedLocalization = mapLocalizationDtoToModel<
                    typeof updatedLocalizationDto,
                    FeedbackReviewLocalization
                >(updatedLocalizationDto);

                const updatedReview: FeedbackReviewDto = {
                    ...review,
                    localizations:
                        review.localizations?.map((loc) =>
                            loc.language.id === language.id ? updatedLocalization : loc,
                        ) || [],
                };

                onSuccess(updatedReview);
            } else {
                const createdLocalizationDto = await FeedbackReviewLocalizationsApi.create(client, {
                    entityId: review.id,
                    languageId: language.id,
                    authorName: data.authorName,
                    text: data.text,
                });

                const createdLocalization = mapLocalizationDtoToModel<
                    typeof createdLocalizationDto,
                    FeedbackReviewLocalization
                >(createdLocalizationDto);

                const updatedReview: FeedbackReviewDto = {
                    ...review,
                    localizations: [...(review.localizations || []), createdLocalization],
                };

                onSuccess(updatedReview);
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
        translateReview,
        isSubmitting,
        error,
        clearError,
    };
};
