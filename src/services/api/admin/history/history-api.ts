import { CreateUpdateHistorySectionDto, HistorySectionDto } from '@/types/common/history-sections';
import { AxiosInstance } from 'axios';
import { API_ROUTES } from '@/const/common/api-routes/main-api';

export const HistoryApi = {
    fetchSections: async (client: AxiosInstance): Promise<HistorySectionDto[]> => {
        const response = await client.get<HistorySectionDto[]>(API_ROUTES.HISTORY.BASE);
        return response.data;
    },

    syncSections: async (client: AxiosInstance, sections: CreateUpdateHistorySectionDto[]): Promise<HistorySectionDto[]> => {
        const response = await client.put<CreateUpdateHistorySectionDto[]>(API_ROUTES.HISTORY.BASE, sections);
        return response.data;
    },

};
