import { EventsApi } from './events-api';
import { API_ROUTES } from '@/const/common/api-routes/main-api';
import { VisibilityStatus } from '@/types/admin/common';
import { TranslationStatusFilter } from '@/types/common/language';
import { AxiosInstance } from 'axios';

describe('EventsApi', () => {
    const mockGet = jest.fn();
    const client = { get: mockGet } as unknown as AxiosInstance;

    beforeEach(() => {
        mockGet.mockReset();
    });

    describe('fetchEvents', () => {
        it('calls the Events endpoint with the pagination, status, and translation params and returns the data', async () => {
            const mockResponse = { data: { items: [], total: 0 } };
            mockGet.mockResolvedValueOnce(mockResponse);

            const result = await EventsApi.fetchEvents(
                client,
                1,
                0,
                5,
                TranslationStatusFilter.Outdated,
                VisibilityStatus.Published,
            );

            expect(mockGet).toHaveBeenCalledWith(API_ROUTES.EVENTS.BASE, {
                params: {
                    categoryId: 1,
                    offset: 0,
                    limit: 5,
                    status: VisibilityStatus.Published,
                    translationStatusFilter: TranslationStatusFilter.Outdated,
                },
            });
            expect(result).toEqual(mockResponse.data);
        });
    });

    describe('fetchEventSearchItems', () => {
        it('calls the Events search endpoint with the search term, pagination, and abort signal', async () => {
            const mockResponse = { data: { items: [], total: 0 } };
            mockGet.mockResolvedValueOnce(mockResponse);
            const signal = new AbortController().signal;

            const result = await EventsApi.fetchEventSearchItems(client, 'test', 0, 5, signal);

            expect(mockGet).toHaveBeenCalledWith(API_ROUTES.EVENTS.SEARCH, {
                params: {
                    searchTerm: 'test',
                    offset: 0,
                    limit: 5,
                },
                signal,
            });
            expect(result).toEqual(mockResponse.data);
        });
    });
});
