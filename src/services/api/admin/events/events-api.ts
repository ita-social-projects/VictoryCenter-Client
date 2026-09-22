import { AxiosInstance } from 'axios';
import { VisibilityStatus, PaginationResult } from '@/types/admin/common';
import { TranslationStatusFilter } from '@/types/common/language';
import { EventItemDto, EventSearchItemData } from '@/types/admin/events-news';
import { API_ROUTES } from '@/const/common/api-routes/main-api';

export const EventsApi = {
    fetchEvents: async (
        client: AxiosInstance,
        categoryId: number,
        offset: number,
        limit: number,
        translationStatusFilter?: TranslationStatusFilter | null,
        status?: VisibilityStatus,
    ): Promise<PaginationResult<EventItemDto>> => {
        const response = await client.get<PaginationResult<EventItemDto>>(API_ROUTES.EVENTS.BASE, {
            params: {
                categoryId,
                offset,
                limit,
                status,
                translationStatusFilter,
            },
        });
        return response.data;
    },
    // test method
    fetchEventSearchItems: async (
        client: AxiosInstance,
        searchTerm: string,
        offset: number,
        limit: number,
        signal?: AbortSignal,
    ): Promise<PaginationResult<EventSearchItemData>> => {
        // TODO: add constant for existing search endpoint.
        const response = await client.get<PaginationResult<EventSearchItemData>>(`${API_ROUTES.EVENTS.BASE}/search`, {
            params: {
                searchTerm,
                offset,
                limit,
            },
            signal,
        });
        return response.data;
    },
};
