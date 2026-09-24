import { AxiosInstance } from 'axios';

import { EventsApi } from './events-api';
import { API_ROUTES } from '@/const/common/api-routes/main-api';
import { VisibilityStatus } from '@/types/admin/common';
import { TranslationStatusFilter } from '@/types/common/language';
import { EventsIntroSectionDto } from '@/types/admin/events';

describe('EventsApi', () => {
    const mockGet = jest.fn();
    const mockPut = jest.fn();
    const client = { get: mockGet, put: mockPut } as unknown as AxiosInstance;

    beforeEach(() => {
        mockGet.mockReset();
        mockPut.mockReset();
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
});
