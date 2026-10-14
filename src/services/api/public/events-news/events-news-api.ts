import { EventsNews } from '@/types/public/events-news';
import { PaginationResult } from '@/types/admin/common';
import { axiosInstance } from '@/services/api/axios';
import { API_ROUTES } from '@/const/common/api-routes/main-api';

export const EventsNewsApi = {
    get: async (tagId: string, offset: number = 0, limit: number = 5): Promise<PaginationResult<EventsNews>> => {
        const response = await axiosInstance.get(`${API_ROUTES.EVENTS.PUBLISHED}`, {
            params: {
                categoryId: tagId || undefined,
                offset: offset,
                limit: limit,
            },
        });
        return response.data;
    },
};

export const EventNewsApi = {
    get: async (slug: string): Promise<EventsNews> => {
        const response = await axiosInstance.get(`${API_ROUTES.EVENTS.PUBLISHED}/${slug}`);
        return response.data;
    },
};
