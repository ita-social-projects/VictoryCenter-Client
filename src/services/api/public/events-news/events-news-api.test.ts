import { EventsNewsApi, EventNewsApi } from './events-news-api';
import { eventsNewsMock } from '@/utils/mock-data/public/event-news';
import { axiosInstance } from '@/services/api/axios';
import { API_ROUTES } from '@/const/common/api-routes/main-api';

jest.mock('@/services/api/axios', () => ({
    axiosInstance: {
        get: jest.fn(),
    },
}));

describe('events-news-api', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('EventsNewsApi', () => {
        it('calls axiosInstance.get with correct parameters for fetching paginated events', async () => {
            const mockResponse = {
                data: {
                    items: eventsNewsMock.slice(0, 5),
                    totalItemsCount: eventsNewsMock.length,
                },
            };
            (axiosInstance.get as jest.Mock).mockResolvedValue(mockResponse);

            const result = await EventsNewsApi.get('2', 0, 5);

            expect(axiosInstance.get).toHaveBeenCalledWith(API_ROUTES.EVENTS.PUBLISHED, {
                params: { categoryId: '2', offset: 0, limit: 5 },
            });
            expect(result).toEqual(mockResponse.data);
        });

        it('omits categoryId when tagId is empty or not provided', async () => {
            const mockResponse = { data: { items: [], totalItemsCount: 0 } };
            (axiosInstance.get as jest.Mock).mockResolvedValue(mockResponse);

            await EventsNewsApi.get('', 10, 5);

            expect(axiosInstance.get).toHaveBeenCalledWith(API_ROUTES.EVENTS.PUBLISHED, {
                params: { categoryId: undefined, offset: 10, limit: 5 },
            });
        });

        it('propagates rejection when the network request fails', async () => {
            (axiosInstance.get as jest.Mock).mockRejectedValue(new Error('Network Error'));

            await expect(EventsNewsApi.get('', 0, 5)).rejects.toThrow('Network Error');
        });
    });

    describe('EventNewsApi', () => {
        it('resolves with the matching event data when given a valid slug', async () => {
            const targetEvent = eventsNewsMock[0];
            (axiosInstance.get as jest.Mock).mockResolvedValue({ data: targetEvent });

            const result = await EventNewsApi.get(targetEvent.slug);

            expect(axiosInstance.get).toHaveBeenCalledWith(`${API_ROUTES.EVENTS.PUBLISHED}/${targetEvent.slug}`);
            expect(result).toEqual(targetEvent);
        });

        it('rejects with an Error when API returns a 404 (Event not found)', async () => {
            (axiosInstance.get as jest.Mock).mockRejectedValue(new Error('Event not found'));

            await expect(EventNewsApi.get('non-existent-slug')).rejects.toThrow('Event not found');
        });
    });
});
