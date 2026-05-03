import { eventsNewsMock } from '@/utils/mock-data/public/event-news';
import { EventsNewsPageData } from '@/types/public/events-news';

export const EventsNewsApi = {
    get: async (): Promise<EventsNewsPageData> => {
        // const response = await axiosInstance.get(`${API_ROUTES. .PUBLIC}`);
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const success = true;

                if (success) {
                    resolve(eventsNewsMock);
                } else {
                    reject(new Error('Failed to fetch events news data'));
                }
            }, 1000);
        });
    },
};
