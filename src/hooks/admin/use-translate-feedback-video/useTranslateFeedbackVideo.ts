import { useState } from 'react';
import { FEEDBACK_TEXT } from '@/const/admin/feedback';
import { TranslateFeedbackVideoFormValues } from '@/pages/admin/feedback-page/components/translate-feedback-video-form/TranslateFeedbackVideoForm';
import { VideoReviewLocalizationsApi } from '@/services/api/admin/feedback/video-review-localizations/video-review-localizations-api';
import { FeedbackVideoDto, FeedbackVideoLocalization } from '@/types/admin/feedback';
import { LocalizationLanguage } from '@/types/common/language';
import { mapLocalizationDtoToModel } from '@/utils/functions/mappers/common/localization/localization-mappers';
import { useAdminClient } from '../use-admin-client/useAdminClient';
import { ModalMode } from '@/types/admin/common';

interface UseTranslateFeedbackVideoParams {
    video: FeedbackVideoDto | null;
    language: LocalizationLanguage;
    onSuccess: (updatedVideo: FeedbackVideoDto) => void;
    mode: ModalMode;
}

export const useTranslateFeedbackVideo = ({ video, language, onSuccess, mode }: UseTranslateFeedbackVideoParams) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string>('');

    const client = useAdminClient();
    const isEditMode = mode === ModalMode.Edit;

    const translateVideo = async (data: TranslateFeedbackVideoFormValues) => {
        if (!video) return;

        try {
            setIsSubmitting(true);
            setError('');

            if (isEditMode) {
                const updatedLocalizationDto = await VideoReviewLocalizationsApi.update(client, video.id, language.id, {
                    title: data.title,
                });

                const updatedLocalization = mapLocalizationDtoToModel<
                    typeof updatedLocalizationDto,
                    FeedbackVideoLocalization
                >(updatedLocalizationDto);

                const updatedVideo: FeedbackVideoDto = {
                    ...video,
                    localizations:
                        video.localizations?.map((loc) =>
                            loc.language.id === language.id ? updatedLocalization : loc,
                        ) || [],
                };

                onSuccess(updatedVideo);
            } else {
                const createdLocalizationDto = await VideoReviewLocalizationsApi.create(client, {
                    entityId: video.id,
                    languageId: language.id,
                    title: data.title,
                });

                const createdLocalization = mapLocalizationDtoToModel<
                    typeof createdLocalizationDto,
                    FeedbackVideoLocalization
                >(createdLocalizationDto);

                const updatedVideo: FeedbackVideoDto = {
                    ...video,
                    localizations: [...(video.localizations || []), createdLocalization],
                };

                onSuccess(updatedVideo);
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
        translateVideo,
        isSubmitting,
        error,
        clearError,
    };
};
