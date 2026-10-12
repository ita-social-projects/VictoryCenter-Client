import { EventsNews } from '@/types/public/events-news';
import { PaginationResult } from '@/types/admin/common';
import { API_ROUTES } from '@/const/common/api-routes/main-api';
import { axiosInstance } from '../../axios';
import { mapToEventsNews } from '@/utils/functions/mappers/public/event-news/event-news';

export const EventsNewsApi = {
    get: async (tagId?: string, offset = 0, limit = 5): Promise<PaginationResult<EventsNews>> => {
        const response = await axiosInstance.get(API_ROUTES.EVENTS.PUBLISHED, {
            params: { categoryId: tagId || undefined, offset, limit },
        });
        return { ...response.data, items: (response.data?.items ?? []).map(mapToEventsNews) };
    },
};

export const EventNewsApi = {
    get: async (slug: string): Promise<EventsNews> => {
        const response = await axiosInstance.get(`${API_ROUTES.EVENTS.PUBLISHED}/${encodeURIComponent(slug)}`);
        return mapToEventsNews(response.data);
    },
};
