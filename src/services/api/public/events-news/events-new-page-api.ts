import { EventsNewsPageData, PublicEventsPageDto } from '@/types/public/events-news';
import { RequestOptions } from '@/types/common/api';
import { API_ROUTES } from '@/const/common/api-routes/main-api';
import { DEFAULT_LOCALE } from '@/const/common/locales';
import { axiosInstance } from '@/services/api/axios';
import { mapToEventsNewsPage } from '@/utils/functions/mappers/public/event-news/events-news-page';

export const EventsNewsPageApi = {
    get: async (
        languageCode: string = DEFAULT_LOCALE,
        requestOptions?: RequestOptions,
    ): Promise<EventsNewsPageData> => {
        const { data } = await axiosInstance.get<PublicEventsPageDto>(API_ROUTES.EVENTS_PAGE.PUBLIC, {
            signal: requestOptions?.cancellationSignal,
        });

        return mapToEventsNewsPage(data, languageCode);
    },
};
