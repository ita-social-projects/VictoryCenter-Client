import { AxiosInstance } from 'axios';

import { EventsApi } from './events-api';
import { API_ROUTES } from '@/const/common/api-routes/main-api';
import { VisibilityStatus } from '@/types/admin/common';
import { TranslationStatusFilter } from '@/types/common/language';

describe('EventsApi', () => {
    const mockGet = jest.fn();
    const client = { get: mockGet } as unknown as AxiosInstance;

    beforeEach(() => {
        mockGet.mockReset();
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
