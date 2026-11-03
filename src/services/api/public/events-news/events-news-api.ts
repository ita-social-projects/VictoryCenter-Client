import { EventsNews, PublishedEventNewsDto } from '@/types/public/events-news';
import { PaginationResult } from '@/types/admin/common';
import { RequestOptions } from '@/types/common/api';
import { API_ROUTES } from '@/const/common/api-routes/main-api';
import { axiosInstance } from '@/services/api/axios';
import { DEFAULT_LOCALE } from '@/const/common/locales';
import { mapToEventsNews } from '@/utils/functions/mappers/public/event-news/event-news';

export const EventsNewsApi = {
    get: async (
        tagId?: string,
        offset = 0,
        limit = 5,
        languageCode: string = DEFAULT_LOCALE,
        requestOptions?: RequestOptions,
    ): Promise<PaginationResult<EventsNews>> => {
        const { data } = await axiosInstance.get<PaginationResult<PublishedEventNewsDto>>(API_ROUTES.EVENTS.PUBLISHED, {
            params: { categoryId: tagId || undefined, offset, limit },
            signal: requestOptions?.cancellationSignal,
        });

        return {
            items: (data?.items ?? []).map((dto) => mapToEventsNews(dto, languageCode)),
            totalItemsCount: data?.totalItemsCount ?? 0,
        };
    },
};

export const EventNewsApi = {
    get: async (
        slug: string,
        languageCode: string = DEFAULT_LOCALE,
        requestOptions?: RequestOptions,
    ): Promise<EventsNews> => {
        const { data } = await axiosInstance.get<PublishedEventNewsDto>(
            `${API_ROUTES.EVENTS.PUBLISHED}/${encodeURIComponent(slug)}`,
            { signal: requestOptions?.cancellationSignal },
        );

        if (!data) {
            throw new Error(`Failed to load event news: empty response for slug "${slug}"`);
        }

        return mapToEventsNews(data, languageCode);
    },
};
