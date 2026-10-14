import { EventsNewsPageApi } from './events-new-page-api';
import { eventsNewsPageMock } from '@/utils/mock-data/public/event-news';
import { axiosInstance } from '@/services/api/axios';
import { API_ROUTES } from '@/const/common/api-routes/main-api';

jest.mock('@/services/api/axios', () => ({
    axiosInstance: {
        get: jest.fn(),
    },
}));

describe('EventsNewsPageApi', () => {
    beforeEach(() => {
        jest.clearAllMocks();
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

        (axiosInstance.get as jest.Mock).mockResolvedValue(mockApiResponse);

        const result = await EventsNewsPageApi.get();

        expect(axiosInstance.get).toHaveBeenCalledWith(API_ROUTES.EVENTS_PAGE.PUBLIC);
        expect(result).toEqual({
            description: 'Test Description',
            isPageDescriptionHidden: false,
            chooseProgram: eventsNewsPageMock.chooseProgram,
            eventsData: {
                title: 'Test Title',
                tags: [
                    { id: '1', name: 'Category 1', localizations: [] },
                    { id: '2', name: 'Category 2', localizations: [] },
                ],
            },
            isEventsBlockTitleHidden: false,
        });
    });

    it('handles empty or missing data fields correctly', async () => {
        const mockApiResponse = {
            data: {},
        };

        (axiosInstance.get as jest.Mock).mockResolvedValue(mockApiResponse);

        const result = await EventsNewsPageApi.get();

        expect(result).toEqual({
            description: '',
            isPageDescriptionHidden: true,
            chooseProgram: eventsNewsPageMock.chooseProgram,
            eventsData: {
                title: '',
                tags: [],
            },
            isEventsBlockTitleHidden: true,
        });
    });

    it('is a promise-returning function', () => {
        (axiosInstance.get as jest.Mock).mockResolvedValue({ data: {} });

        const result = EventsNewsPageApi.get();

        expect(result).toBeInstanceOf(Promise);
    });

    it('propagates rejection when implementation fails with specific message', async () => {
        (axiosInstance.get as jest.Mock).mockRejectedValue(new Error('Failed to fetch events news data'));

        await expect(EventsNewsPageApi.get()).rejects.toThrow('Failed to fetch events news data');
    });
});
