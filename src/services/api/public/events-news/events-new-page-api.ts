import { eventsNewsPageMock } from '@/utils/mock-data/public/event-news';
import { EventsNewsPageData } from '@/types/public/events-news';
import { axiosInstance } from '@/services/api/axios';
import { API_ROUTES } from '@/const/common/api-routes/main-api';
import { EventsIntroSectionDto } from '@/types/admin/events';

export const EventsNewsPageApi = {
    get: async (): Promise<EventsNewsPageData> => {
        const mock = { ...eventsNewsPageMock };
        try {
            const response = await axiosInstance.get<EventsIntroSectionDto>(API_ROUTES.EVENTS_PAGE.PUBLIC);
            const data = response.data;
            mock.description = data.pageDescription;
            mock.isPageDescriptionHidden = !data.pageDescription;
            mock.eventsData = {
                ...mock.eventsData,
                title: data.eventsBlockTitle,
            };
            mock.isEventsBlockTitleHidden = !data.eventsBlockTitle;
        } catch (error) {
            // throw error
        }
        return mock;
    },
};
