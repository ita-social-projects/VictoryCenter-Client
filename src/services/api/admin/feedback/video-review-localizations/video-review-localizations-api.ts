import { AxiosInstance } from 'axios';
import { API_ROUTES } from '@/const/common/api-routes/main-api';
import {
    CreateFeedbackVideoLocalizationDto,
    FeedbackVideoLocalizationDto,
    UpdateFeedbackVideoLocalizationDto,
} from '@/types/admin/feedback';

export const VideoReviewLocalizationsApi = {
    create: async (
        client: AxiosInstance,
        data: CreateFeedbackVideoLocalizationDto,
    ): Promise<FeedbackVideoLocalizationDto> => {
        const response = await client.post<FeedbackVideoLocalizationDto>(
            API_ROUTES.VIDEO_REVIEW_LOCALIZATIONS.BASE,
            data,
        );

        return response.data;
    },

    update: async (
        client: AxiosInstance,
        entityId: number,
        languageId: number,
        data: UpdateFeedbackVideoLocalizationDto,
    ): Promise<FeedbackVideoLocalizationDto> => {
        const response = await client.put<FeedbackVideoLocalizationDto>(
            `${API_ROUTES.VIDEO_REVIEW_LOCALIZATIONS.BASE}/${entityId}/${languageId}`,
            data,
        );
        return response.data;
    },
};
