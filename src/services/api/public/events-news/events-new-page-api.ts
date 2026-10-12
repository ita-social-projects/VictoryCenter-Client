import { EventsNewsPageData } from '@/types/public/events-news';
import { API_ROUTES } from '@/const/common/api-routes/main-api';
import { axiosInstance } from '../../axios';
import { mapToEventsNewsPage } from '@/utils/functions/mappers/public/event-news/events-news-page';

export const EventsNewsPageApi = {
    get: async (): Promise<EventsNewsPageData> => {
        const response = await axiosInstance.get(`${API_ROUTES.EVENTS_PAGE.PUBLIC}`);
        return mapToEventsNewsPage(response.data);
    },
};
