import { API_ROUTES } from '@/const/common/api-routes/main-api';
import { EventCategory } from '@/types/admin/event-category';
import { AxiosInstance } from 'axios';

export const EventCategoriesApi = {
    getAll: async (client: AxiosInstance): Promise<EventCategory[]> => {
        const response = await client.get<EventCategory[]>(API_ROUTES.EVENT_CATEGORIES.BASE);
        return response.data;
    },

    create: async (client: AxiosInstance, category: Pick<EventCategory, 'name'>): Promise<EventCategory> => {
        const response = await client.post<EventCategory>(API_ROUTES.EVENT_CATEGORIES.BASE, {
            name: category.name,
        });
        return response.data;
    },

    update: async (client: AxiosInstance, category: EventCategory): Promise<EventCategory> => {
        if (category.id == null) {
            throw new Error('EventCategoriesApi.update: category id is required.');
        }

        const response = await client.put<EventCategory>(
            `${API_ROUTES.EVENT_CATEGORIES.BASE}/${category.id}`,
            category,
        );
        return response.data;
    },
};
