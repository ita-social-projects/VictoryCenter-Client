import { AxiosInstance } from 'axios';
import { API_ROUTES } from '@/const/common/api-routes/main-api';
import {
    CreateFeedbackReviewLocalizationDto,
    FeedbackReviewLocalizationDto,
    UpdateFeedbackReviewLocalizationDto,
} from '@/types/admin/feedback';

export const FeedbackReviewLocalizationsApi = {
    create: async (
        client: AxiosInstance,
        data: CreateFeedbackReviewLocalizationDto,
    ): Promise<FeedbackReviewLocalizationDto> => {
        const response = await client.post<FeedbackReviewLocalizationDto>(
            API_ROUTES.FEEDBACK_REVIEW_LOCALIZATIONS.BASE,
            data,
        );

        return response.data;
    },

    update: async (
        client: AxiosInstance,
        entityId: number,
        languageId: number,
        data: UpdateFeedbackReviewLocalizationDto,
    ): Promise<FeedbackReviewLocalizationDto> => {
        const response = await client.put<FeedbackReviewLocalizationDto>(
            `${API_ROUTES.FEEDBACK_REVIEW_LOCALIZATIONS.BASE}/${entityId}/${languageId}`,
            data,
        );
        return response.data;
    },
};
