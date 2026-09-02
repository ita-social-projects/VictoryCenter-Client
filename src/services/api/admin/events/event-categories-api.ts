import { API_ROUTES } from '@/const/common/api-routes/main-api';
import { EventCategoryUpdate, EventCategoryCreate, EventCategoryDto } from '@/types/admin/event-category';
import { AxiosInstance } from 'axios';

export const EventCategoriesApi = {
    getAll: async (client: AxiosInstance): Promise<EventCategoryDto[]> => {
        const response = await client.get<EventCategoryDto[]>(API_ROUTES.EVENT_CATEGORIES.BASE);
        return response.data;
    },

    create: async (client: AxiosInstance, category: EventCategoryCreate): Promise<EventCategoryDto> => {
        const response = await client.post<EventCategoryDto>(API_ROUTES.EVENT_CATEGORIES.BASE, category);
        return response.data;
    },

    update: async (client: AxiosInstance, category: EventCategoryUpdate): Promise<EventCategoryDto> => {
        if (category.id == null) {
            throw new Error('EventCategoriesApi.update: category id is required.');
        }

        const response = await client.put<EventCategoryDto>(
            `${API_ROUTES.EVENT_CATEGORIES.BASE}/${category.id}`,
            category,
        );
        return response.data;
    },

    delete: async (client: AxiosInstance, categoryId: number): Promise<EventCategoryDto> => {
        if (categoryId == null) {
            throw new Error('EventCategoriesApi.delete: category id is required.');
        }

        const response = await client.delete<EventCategoryDto>(`${API_ROUTES.EVENT_CATEGORIES.BASE}/${categoryId}`);
        return response.data;
    },
};
