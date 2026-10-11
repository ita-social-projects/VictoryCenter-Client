import { AxiosInstance } from 'axios';
import { VisibilityStatus, PaginationResult } from '@/types/admin/common';
import { TranslationStatusFilter } from '@/types/common/language';
import {
    EventItemDto,
    EventItemResponseDto,
    EventLocalization,
    EventLocalizationDto,
    EventSearchItemData,
    EventsIntroSectionDto,
    EventsIntroSectionUpdateField,
} from '@/types/admin/events';
import { API_ROUTES } from '@/const/common/api-routes/main-api';
import { mapEntityWithLocalizations } from '@/utils/functions/mappers/common/localization/localization-mappers';

const mapEvent = (item: EventItemResponseDto): EventItemDto =>
    mapEntityWithLocalizations<EventItemResponseDto, EventLocalizationDto, EventLocalization>(item);


export const EventsApi = {
    getEventsIntroSection: async (client: AxiosInstance): Promise<EventsIntroSectionDto> => {
        const response = await client.get<EventsIntroSectionDto>(API_ROUTES.EVENTS_PAGE.BASE);
        return response.data;
    },
    updateEventsIntroSection: async (
        client: AxiosInstance,
        field: EventsIntroSectionUpdateField,
        section: EventsIntroSectionDto,
    ): Promise<EventsIntroSectionDto> => {
        const isDescription = field === 'pageDescription';
        const response = await client.put<EventsIntroSectionDto>(
            isDescription ? API_ROUTES.EVENTS_PAGE.DESCRIPTION : API_ROUTES.EVENTS_PAGE.EVENTS_BLOCK_TITLE,
            isDescription
                ? { pageDescription: section.pageDescription }
                : { eventsBlockTitle: section.eventsBlockTitle },
        );

        return response.data;
    },
    fetchEvents: async (
        client: AxiosInstance,
        categoryId: number,
        offset: number,
        limit: number,
        translationStatusFilter?: TranslationStatusFilter | null,
        status?: VisibilityStatus,
    ): Promise<PaginationResult<EventItemDto>> => {
        const response = await client.get<PaginationResult<EventItemResponseDto>>(API_ROUTES.EVENTS.BASE, {
            params: {
                categoryId,
                offset,
                limit,
                status,
                translationStatusFilter,
            },
        });
        return { ...response.data, items: response.data.items.map(mapEvent) };
    },
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
    reorder: async (client: AxiosInstance, categoryId: number, ids: number[]) => {
        await client.put(API_ROUTES.EVENTS.REORDER, { categoryId, ids });
    },
};
