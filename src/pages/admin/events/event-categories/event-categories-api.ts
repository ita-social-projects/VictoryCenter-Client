import { API_ROUTES } from '@/const/common/api-routes/main-api';
import { EventCategory } from '@/types/admin/event-category';
import { AxiosInstance } from 'axios';

export const EventCategoriesApi = {
    getAll: async (client: AxiosInstance): Promise<EventCategory[]> => {
        const response = await client.get<EventCategory[]>(API_ROUTES.EVENT_CATEGORIES.BASE);
        return response.data;
    },
};
