import { API_ROUTES } from '@/const/common/api-routes/main-api';
import { mapToEventsNewsPage } from '@/utils/functions/mappers/public/event-news/events-news-page';
import { axiosInstance } from '@/services/api/axios';
import { EventsNewsPageApi } from './events-new-page-api';

jest.mock('@/services/api/axios', () => ({
    axiosInstance: { get: jest.fn() },
}));

jest.mock('@/utils/functions/mappers/public/event-news/events-news-page', () => ({
    mapToEventsNewsPage: jest.fn(),
}));

const mockedAxiosGet = axiosInstance.get as jest.Mock;
const mockedMapper = mapToEventsNewsPage as jest.Mock;

describe('EventsNewsPageApi', () => {
    const dto = { eventsBlockTitle: 'Title', pageDescription: 'Description', categories: [] };
    const mapped = { description: 'mapped', eventsData: { tags: [] } };

    beforeEach(() => {
        jest.clearAllMocks();
        mockedMapper.mockReturnValue(mapped);
        mockedAxiosGet.mockResolvedValue({ data: dto });
    });

    it('requests the public events page endpoint', async () => {
        await EventsNewsPageApi.get();

        expect(mockedAxiosGet).toHaveBeenCalledTimes(1);
        expect(mockedAxiosGet).toHaveBeenCalledWith(API_ROUTES.EVENTS_PAGE.PUBLIC, { signal: undefined });
    });

    it('maps the response correctly', async () => {
        const result = await EventsNewsPageApi.get();

        expect(mockedMapper).toHaveBeenCalledWith(dto);
        expect(result).toBe(mapped);
    });

    it('passes the cancellation signal to axios', async () => {
        const { signal } = new AbortController();

        await EventsNewsPageApi.get(undefined, { cancellationSignal: signal });

        expect(mockedAxiosGet).toHaveBeenCalledWith(API_ROUTES.EVENTS_PAGE.PUBLIC, { signal });
    });

    it('is a promise-returning function', () => {
        const result = EventsNewsPageApi.get();

        expect(result).toBeInstanceOf(Promise);
    });

    it('resolves with the mapped data directly from the API response', async () => {
        const mockApiResponse = {
            data: {
                pageDescription: 'Test Description',
                eventsBlockTitle: 'Test Title',
                categories: [
                    { id: 1, name: 'Category 1', localizations: [] },
                    { id: 2, name: 'Category 2', localizations: [] },
                ],
            },
        };

        const expectedMappedResult = {
            description: 'Test Description',
            isPageDescriptionHidden: false,
            eventsData: {
                title: 'Test Title',
                tags: [
                    { id: '1', name: 'Category 1', localizations: [] },
                    { id: '2', name: 'Category 2', localizations: [] },
                ],
            },
            isEventsBlockTitleHidden: false,
        };

        mockedAxiosGet.mockResolvedValue(mockApiResponse);
        mockedMapper.mockReturnValue(expectedMappedResult);

        const result = await EventsNewsPageApi.get();

        expect(mockedAxiosGet).toHaveBeenCalledWith(API_ROUTES.EVENTS_PAGE.PUBLIC, { signal: undefined });
        expect(mockedMapper).toHaveBeenCalledWith(mockApiResponse.data);
        expect(result).toEqual(expectedMappedResult);
    });

    it('handles empty or missing data fields correctly', async () => {
        const mockApiResponse = {
            data: {},
        };

        const expectedMappedResult = {
            description: '',
            isPageDescriptionHidden: true,
            eventsData: {
                title: '',
                tags: [],
            },
            isEventsBlockTitleHidden: true,
        };

        mockedAxiosGet.mockResolvedValue(mockApiResponse);
        mockedMapper.mockReturnValue(expectedMappedResult);

        const result = await EventsNewsPageApi.get();

        expect(mockedMapper).toHaveBeenCalledWith(mockApiResponse.data);
        expect(result).toEqual(expectedMappedResult);
    });

    it('propagates rejection when implementation fails with specific message', async () => {
        mockedAxiosGet.mockRejectedValue(new Error('Failed to fetch events news data'));

        await expect(EventsNewsPageApi.get()).rejects.toThrow('Failed to fetch events news data');
        expect(mockedMapper).not.toHaveBeenCalled();
    });
});
