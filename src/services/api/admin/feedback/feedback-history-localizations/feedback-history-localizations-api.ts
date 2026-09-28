import { AxiosInstance } from 'axios';
import { API_ROUTES } from '@/const/common/api-routes/main-api';
import {
    CreateFeedbackHistoryLocalizationDto,
    FeedbackHistoryLocalizationDto,
    UpdateFeedbackHistoryLocalizationDto,
} from '@/types/admin/feedback';

export const FeedbackHistoryLocalizationsApi = {
    create: async (
        client: AxiosInstance,
        data: CreateFeedbackHistoryLocalizationDto,
    ): Promise<FeedbackHistoryLocalizationDto> => {
        const response = await client.post<FeedbackHistoryLocalizationDto>(
            API_ROUTES.FEEDBACK_HISTORY_LOCALIZATIONS.BASE,
            data,
        );

        return response.data;
    },

    update: async (
        client: AxiosInstance,
        entityId: number,
        languageId: number,
        data: UpdateFeedbackHistoryLocalizationDto,
    ): Promise<FeedbackHistoryLocalizationDto> => {
        const response = await client.put<FeedbackHistoryLocalizationDto>(
            `${API_ROUTES.FEEDBACK_HISTORY_LOCALIZATIONS.BASE}/${entityId}/${languageId}`,
            data,
        );
        return response.data;
    },
};
