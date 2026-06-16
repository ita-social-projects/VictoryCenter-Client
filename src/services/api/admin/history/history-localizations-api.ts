import { AxiosInstance } from 'axios';
import { API_ROUTES } from '@/const/common/api-routes/main-api';
import { CreateHistorySectionLocalizationDto } from '@/types/common/history-sections';

export const HistoryLocalizationsApi = {
    create: async (client: AxiosInstance, data: CreateHistorySectionLocalizationDto): Promise<void> => {
        await client.post(API_ROUTES.HISTORY_LOCALIZATIONS.BASE, data);
    },
    update: async (
        client: AxiosInstance,
        entityId: number,
        languageId: number,
        data: CreateHistorySectionLocalizationDto,
    ): Promise<void> => {
        await client.put(`${API_ROUTES.HISTORY_LOCALIZATIONS.BASE}/${entityId}/language/${languageId}`, data);
    },
};
