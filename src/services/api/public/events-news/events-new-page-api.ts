import { eventsNewsPageMock } from '@/utils/mock-data/public/event-news';
import { EventsNewsPageData, Tag } from '@/types/public/events-news';
import { axiosInstance } from '@/services/api/axios';
import { API_ROUTES } from '@/const/common/api-routes/main-api';

export const EventsNewsPageApi = {
    get: async (): Promise<EventsNewsPageData> => {
        try {
            const response = await axiosInstance.get(API_ROUTES.EVENTS_PAGE.PUBLIC);
            const data = response.data;

            const fetchedTags: Tag[] = (data.categories || []).map((category: any) => ({
                id: String(category.id),
                name: category.name,
                localizations: category.localizations,
            }));

            return {
                description: data.pageDescription || '',
                isPageDescriptionHidden: !data.pageDescription,
                chooseProgram: eventsNewsPageMock.chooseProgram,
                eventsData: {
                    title: data.eventsBlockTitle || '',
                    tags: fetchedTags,
                },
                isEventsBlockTitleHidden: !data.eventsBlockTitle,
            };
        } catch (error) {
            throw error;
        }
    },
};
