import { AxiosInstance } from 'axios';

import { EventsApi } from './events-api';
import { API_ROUTES } from '@/const/common/api-routes/main-api';
import { ImageApi } from '@/services/api/admin/image/image-api';
import { VisibilityStatus } from '@/types/admin/common';
import { TranslationStatusFilter } from '@/types/common/language';
import { EventsIntroSectionDto } from '@/types/admin/events';
import { DEFAULT_UKRAINIAN_LANGUAGE_ID } from '@/const/common/locales';

jest.mock('@/services/api/admin/image/image-api', () => ({
    ImageApi: {
        delete: jest.fn(),
        getUpdateImageId: jest.fn(),
        post: jest.fn(),
    },
}));

const mockedImageApi = ImageApi as jest.Mocked<typeof ImageApi>;

describe('EventsApi', () => {
    const mockGet = jest.fn();
    const mockPut = jest.fn();
    const mockPost = jest.fn();
    const client = { get: mockGet, put: mockPut, post: mockPost } as unknown as AxiosInstance;

    beforeEach(() => {
        mockGet.mockReset();
        mockPut.mockReset();
        mockPost.mockReset();
        mockedImageApi.delete.mockReset();
        mockedImageApi.getUpdateImageId.mockReset();
        mockedImageApi.post.mockReset();
    });

    describe('updateEventsIntroSection', () => {
        const introSection = {
            eventsBlockTitle: '<p>Title</p>',
            pageDescription: '<p>Description</p>',
        } satisfies EventsIntroSectionDto;

        it('updates only the page description through its dedicated endpoint', async () => {
            mockPut.mockResolvedValueOnce({ data: introSection });

            const result = await EventsApi.updateEventsIntroSection(client, 'pageDescription', introSection);

            expect(mockPut).toHaveBeenCalledWith(API_ROUTES.EVENTS_PAGE.DESCRIPTION, {
                pageDescription: introSection.pageDescription,
            });
            expect(result).toEqual(introSection);
        });

        it('updates only the events block title through its dedicated endpoint', async () => {
            mockPut.mockResolvedValueOnce({ data: introSection });

            const result = await EventsApi.updateEventsIntroSection(client, 'eventsBlockTitle', introSection);

            expect(mockPut).toHaveBeenCalledWith(API_ROUTES.EVENTS_PAGE.EVENTS_BLOCK_TITLE, {
                eventsBlockTitle: introSection.eventsBlockTitle,
            });
            expect(result).toEqual(introSection);
        });
    });

    describe('getEventsIntroSection', () => {
        it('calls the EventsPage endpoint and returns both intro fields', async () => {
            const mockResponse = {
                data: {
                    eventsBlockTitle: '<p>Title</p>',
                    pageDescription: '<p>Description</p>',
                } satisfies EventsIntroSectionDto,
            };
            mockGet.mockResolvedValueOnce(mockResponse);

            const result = await EventsApi.getEventsIntroSection(client);

            expect(mockGet).toHaveBeenCalledWith(API_ROUTES.EVENTS_PAGE.BASE);
            expect(result).toEqual(mockResponse.data);
        });
    });

    describe('fetchEvents', () => {
        it('calls the Events endpoint with all provided parameters and returns the data', async () => {
            const responseData = {
                items: [],
                totalItemsCount: 0,
            };

            mockGet.mockResolvedValueOnce({
                data: responseData,
            });

            const result = await EventsApi.fetchEvents(
                client,
                1,
                0,
                5,
                TranslationStatusFilter.Outdated,
                VisibilityStatus.Published,
            );

            expect(mockGet).toHaveBeenCalledTimes(1);
            expect(mockGet).toHaveBeenCalledWith(API_ROUTES.EVENTS.BASE, {
                params: {
                    categoryId: 1,
                    offset: 0,
                    limit: 5,
                    status: VisibilityStatus.Published,
                    translationStatusFilter: TranslationStatusFilter.Outdated,
                },
            });

            expect(result).toBe(responseData);
        });

        it('calls the Events endpoint without optional parameters', async () => {
            const responseData = {
                items: [],
                totalItemsCount: 0,
            };

            mockGet.mockResolvedValueOnce({
                data: responseData,
            });

            const result = await EventsApi.fetchEvents(client, 2, 10, 20);

            expect(mockGet).toHaveBeenCalledWith(API_ROUTES.EVENTS.BASE, {
                params: {
                    categoryId: 2,
                    offset: 10,
                    limit: 20,
                    status: undefined,
                    translationStatusFilter: undefined,
                },
            });

            expect(result).toBe(responseData);
        });

        it('passes null translationStatusFilter to the API', async () => {
            mockGet.mockResolvedValueOnce({
                data: {
                    items: [],
                    totalItemsCount: 0,
                },
            });

            await EventsApi.fetchEvents(client, 1, 0, 5, null);

            expect(mockGet).toHaveBeenCalledWith(API_ROUTES.EVENTS.BASE, {
                params: {
                    categoryId: 1,
                    offset: 0,
                    limit: 5,
                    status: undefined,
                    translationStatusFilter: null,
                },
            });
        });

        it('propagates an API error', async () => {
            const error = new Error('Failed to fetch events');

            mockGet.mockRejectedValueOnce(error);

            await expect(EventsApi.fetchEvents(client, 1, 0, 5)).rejects.toBe(error);
        });
    });

    describe('event image flow', () => {
        const request = {
            title: 'Event title',
            description: 'Event description',
            additionalDescription: '',
            resource: 'https://example.com',
            resourceEn: '',
            publishedAt: '2026-10-06T00:00:00.000Z',
            status: VisibilityStatus.Published,
            previewImageId: null,
            backgroundImageId: null,
            categoryId: 1,
            localizations: [
                {
                    languageId: DEFAULT_UKRAINIAN_LANGUAGE_ID,
                    title: 'Event title',
                    description: 'Event description',
                    additionalDescription: '',
                },
            ],
        };

        it('preserves an unchanged existing preview image on update', async () => {
            mockPut.mockResolvedValueOnce({ data: { id: 1 } });
            mockedImageApi.getUpdateImageId.mockResolvedValueOnce({ finalImageId: 14, imageIdToDelete: null });

            await EventsApi.updateEvent(client, 1, {
                request,
                image: { id: 14, url: 'https://example.com/image.png', mimeType: 'image/png' },
                existingPreviewImageId: 14,
            });

            expect(mockedImageApi.getUpdateImageId).toHaveBeenCalledWith(
                client,
                { id: 14, url: 'https://example.com/image.png', mimeType: 'image/png' },
                14,
            );
            expect(mockedImageApi.delete).not.toHaveBeenCalled();
            expect(mockPut).toHaveBeenCalledWith(`${API_ROUTES.EVENTS.BASE}/1`, {
                ...request,
                previewImageId: 14,
            });
        });

        it('uploads a new preview image before creating an event', async () => {
            mockPost.mockResolvedValueOnce({ data: { id: 1 } });
            mockedImageApi.post.mockResolvedValueOnce({
                id: 15,
                url: 'https://example.com/image.png',
                mimeType: 'image/png',
            });

            await EventsApi.createEvent(client, {
                request,
                image: { base64: 'image-base64', mimeType: 'image/png' },
                existingPreviewImageId: null,
            });

            expect(mockedImageApi.post).toHaveBeenCalledWith(client, { base64: 'image-base64', mimeType: 'image/png' });
            expect(mockPost).toHaveBeenCalledWith(API_ROUTES.EVENTS.BASE, {
                ...request,
                previewImageId: 15,
            });
        });

        it('creates a replacement preview image and deletes the previous image after updating an event', async () => {
            mockPut.mockResolvedValueOnce({ data: { id: 1 } });
            mockedImageApi.post.mockResolvedValueOnce({
                id: 15,
                url: 'https://example.com/image.png',
                mimeType: 'image/png',
            });

            await EventsApi.updateEvent(client, 1, {
                request,
                image: { base64: 'replacement-image', mimeType: 'image/png' },
                existingPreviewImageId: 14,
            });

            expect(mockedImageApi.post).toHaveBeenCalledWith(client, {
                base64: 'replacement-image',
                mimeType: 'image/png',
            });
            expect(mockedImageApi.getUpdateImageId).not.toHaveBeenCalled();
            expect(mockPut).toHaveBeenCalledWith(`${API_ROUTES.EVENTS.BASE}/1`, {
                ...request,
                previewImageId: 15,
            });
            expect(mockedImageApi.delete).toHaveBeenCalledWith(client, 14);
        });

        it('removes a newly created image when the event request fails', async () => {
            const requestError = new Error('Failed to create event');
            mockedImageApi.post.mockResolvedValueOnce({
                id: 15,
                url: 'https://example.com/image.png',
                mimeType: 'image/png',
            });
            mockPost.mockRejectedValueOnce(requestError);
            mockedImageApi.delete.mockResolvedValueOnce(undefined);

            await expect(
                EventsApi.createEvent(client, {
                    request,
                    image: { base64: 'image-base64', mimeType: 'image/png' },
                    existingPreviewImageId: null,
                }),
            ).rejects.toBe(requestError);

            expect(mockedImageApi.delete).toHaveBeenCalledWith(client, 15);
        });

        it('keeps the existing preview image when event update with a replacement image fails', async () => {
            const requestError = new Error('Failed to update event');
            mockedImageApi.post.mockResolvedValueOnce({
                id: 15,
                url: 'https://example.com/image.png',
                mimeType: 'image/png',
            });
            mockPut.mockRejectedValueOnce(requestError);

            await expect(
                EventsApi.updateEvent(client, 1, {
                    request,
                    image: { base64: 'replacement-image', mimeType: 'image/png' },
                    existingPreviewImageId: 14,
                }),
            ).rejects.toBe(requestError);

            expect(mockedImageApi.delete).toHaveBeenCalledWith(client, 15);
            expect(mockedImageApi.delete).not.toHaveBeenCalledWith(client, 14);
        });

        it('returns the saved event when cleanup of a removed image fails', async () => {
            const response = { id: 1 };
            mockPut.mockResolvedValueOnce({ data: response });
            mockedImageApi.getUpdateImageId.mockResolvedValueOnce({ finalImageId: null, imageIdToDelete: 14 });
            mockedImageApi.delete.mockRejectedValueOnce(new Error('Image cleanup failed'));

            await expect(
                EventsApi.updateEvent(client, 1, {
                    request,
                    image: null,
                    existingPreviewImageId: 14,
                }),
            ).resolves.toEqual(response);

            expect(mockedImageApi.delete).toHaveBeenCalledWith(client, 14);
        });
    });
});
