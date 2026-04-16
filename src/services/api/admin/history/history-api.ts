import { HistorySectionDto } from '@/types/common/history-sections';
import { AxiosInstance } from 'axios';
import { API_ROUTES } from '@/const/common/api-routes/main-api';

export const HistoryApi = {
    fetchSections: async (client: AxiosInstance): Promise<HistorySectionDto[]> => {
        const response = await client.get<HistorySectionDto[]>(API_ROUTES.HISTORY.BASE);
        return response.data;
    },
};
