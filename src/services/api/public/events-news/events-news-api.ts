import { eventsNewsMock } from '@/utils/mock-data/public/event-news';
import { EventsNews } from '@/types/public/events-news';
import { PaginationResult } from '@/types/admin/common';
import { axiosInstance } from '@/services/api/axios';
import { API_ROUTES } from '@/const/common/api-routes/main-api';

const delay = (milliseconds: number): Promise<void> =>
    new Promise((resolve) => {
        setTimeout(resolve, milliseconds);
    });

const getPaginatedEvents = (tagId: string, offset: number, limit: number): PaginationResult<EventsNews> => {
    const items = tagId ? eventsNewsMock.filter((event) => event.tags.some((tag) => tag.id === tagId)) : eventsNewsMock;

    const totalItemsCount = offset + limit >= items.length ? 0 : items.length;

    return {
        items: items.slice(offset, offset + limit),
        totalItemsCount,
    };
};

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
