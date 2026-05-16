import { eventsNewsMock } from '@/utils/mock-data/public/event-news';
import { EventsNews } from '@/types/public/events-news';
import { PaginationResult } from '@/types/admin/common';

export const EventsNewsApi = {
    get: async (tagId: string, offset: number = 0, limit: number = 5): Promise<PaginationResult<EventsNews>> => {
        // const response = await axiosInstance.get(`${API_ROUTES. .PUBLIC}`);
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const success = true;

                if (success) {
                    let items = [];
                    let totalItemsCount = 0;

                    items = tagId
                        ? eventsNewsMock.filter((event) => event.tags.some((tag) => tag.id === tagId))
                        : eventsNewsMock;
                    totalItemsCount = offset + limit >= items.length ? 0 : items.length;
                    items = items.slice(offset, offset + limit);

                    resolve({
                        items,
                        totalItemsCount,
                    });
                } else {
                    reject(new Error('Failed to fetch events news data'));
                }
            }, 500);
        });
    },
};
