import { AxiosInstance } from 'axios';
import { VisibilityStatus, PaginationResult } from '@/types/admin/common';
import { TranslationStatusFilter } from '@/types/common/language';
import {
    EventCreateUpdateRequest,
    EventDetailsDto,
    EventItemDto,
    EventSearchItemData,
    EventsIntroSectionDto,
    EventsIntroSectionUpdateField,
} from '@/types/admin/events';
import { API_ROUTES } from '@/const/common/api-routes/main-api';
import { ImageApi } from '@/services/api/admin/image/image-api';
import { Image, ImageValues } from '@/types/common/image';

interface EventSaveData {
    request: EventCreateUpdateRequest;
    image: Image | ImageValues | null;
    existingPreviewImageId: number | null;
}

const getPreviewImageSaveData = async (
    client: AxiosInstance,
    image: Image | ImageValues | null,
    existingPreviewImageId: number | null,
): Promise<{ previewImageId: number | null; createdImageId: number | null; imageIdToDelete: number | null }> => {
    if (image && 'base64' in image) {
        const createdImage = await ImageApi.post(client, image);

        return {
            previewImageId: createdImage.id,
            createdImageId: createdImage.id,
            imageIdToDelete: existingPreviewImageId,
        };
    }

    const { finalImageId, imageIdToDelete } = await ImageApi.getUpdateImageId(client, image, existingPreviewImageId);

    return {
        previewImageId: finalImageId,
        createdImageId: null,
        imageIdToDelete,
    };
};

const saveEvent = async (
    client: AxiosInstance,
    method: 'post' | 'put',
    data: EventSaveData,
    eventId?: number,
): Promise<EventItemDto> => {
    let createdImageId: number | null = null;

    try {
        const imageSaveData = await getPreviewImageSaveData(client, data.image, data.existingPreviewImageId);

        const { previewImageId, imageIdToDelete } = imageSaveData;
        createdImageId = imageSaveData.createdImageId;

        const request = { ...data.request, previewImageId };
        const response =
            method === 'post'
                ? await client.post<EventItemDto>(API_ROUTES.EVENTS.BASE, request)
                : await client.put<EventItemDto>(`${API_ROUTES.EVENTS.BASE}/${eventId}`, request);

        if (imageIdToDelete) {
            await Promise.allSettled([ImageApi.delete(client, imageIdToDelete)]);
        }

        return response.data;
    } catch (error) {
        if (createdImageId) {
            await Promise.allSettled([ImageApi.delete(client, createdImageId)]);
        }
        throw error;
    }
};

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
    toggleEventsTitleVisibility: async (client: AxiosInstance): Promise<EventsIntroSectionDto> => {
        const response = await client.post<EventsIntroSectionDto>(
            API_ROUTES.EVENTS_PAGE.TOGGLE_EVENTS_BLOCK_TITLE_VISIBILITY,
        );
        return response.data;
    },
    toggleEventsDescriptionVisibility: async (client: AxiosInstance): Promise<EventsIntroSectionDto> => {
        const response = await client.post<EventsIntroSectionDto>(API_ROUTES.EVENTS_PAGE.TOGGLE_DESCRIPTION_VISIBILITY);
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
    getEventById: async (client: AxiosInstance, id: number): Promise<EventDetailsDto> => {
        const response = await client.get<EventDetailsDto>(`${API_ROUTES.EVENTS.BASE}/${id}`);
        return response.data;
    },
    createEvent: async (client: AxiosInstance, data: EventSaveData): Promise<EventItemDto> => {
        return saveEvent(client, 'post', data);
    },
    updateEvent: async (client: AxiosInstance, id: number, data: EventSaveData): Promise<EventItemDto> => {
        return saveEvent(client, 'put', data, id);
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
