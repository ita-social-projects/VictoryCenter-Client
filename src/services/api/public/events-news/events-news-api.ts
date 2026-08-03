import { eventsNewsMock } from '@/utils/mock-data/public/event-news';
import { EventsNews } from '@/types/public/events-news';
import { PaginationResult } from '@/types/admin/common';

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
        // const response = await axiosInstance.get(`${API_ROUTES. .PUBLIC}`);
        await delay(500);

        return getPaginatedEvents(tagId, offset, limit);
    },
};

export const EventNewsApi = {
    get: async (slug: string): Promise<EventsNews> => {
        // const response = await axiosInstance.get(`${API_ROUTES.EVENTS.BY_SLUG}/${slug}`);
        // return response.data;
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const event = eventsNewsMock.find((event) => event.slug === slug);
                if (event) {
                    resolve(event);
                } else {
                    reject(new Error('Event not found'));
                }
            }, 200);
        });
    },
};
