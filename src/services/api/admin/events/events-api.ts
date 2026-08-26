import { AxiosInstance } from 'axios';
import { VisibilityStatus, PaginationResult } from '@/types/admin/common';
import { TranslationStatusFilter } from '@/types/common/language';
import { EventsDto, EventSearchItemData } from '@/types/admin/events';
import { API_ROUTES } from '@/const/common/api-routes/main-api';

export const EventsApi = {
    fetchEvents: async (
        client: AxiosInstance,
        categoryId: number,
        offset: number,
        limit: number,
        translationStatusFilter?: TranslationStatusFilter | null,
        status?: VisibilityStatus,
    ): Promise<PaginationResult<EventsDto>> => {
        const response = await client.get<PaginationResult<EventsDto>>(API_ROUTES.EVENTS.BASE, {
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
        const response = await client.get<PaginationResult<EventSearchItemData>>(API_ROUTES.EVENTS.SEARCH, {
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
