import { API_ROUTES } from '@/const/common/api-routes/main-api';
import { mapToEventsNews } from '@/utils/functions/mappers/public/event-news/event-news';
import { createPublishedEventNewsDto } from '@/utils/mock-data/public/published-event-news';
import { axiosInstance } from '@/services/api/axios';
import { EventNewsApi, EventsNewsApi } from './events-news-api';

jest.mock('@/services/api/axios', () => ({
    axiosInstance: { get: jest.fn() },
}));

jest.mock('@/utils/functions/mappers/public/event-news/event-news', () => ({
    mapToEventsNews: jest.fn(),
}));

const mockedAxiosGet = axiosInstance.get as jest.Mock;
const mockedMapper = mapToEventsNews as jest.Mock;

const mockResponse = (data: unknown) => mockedAxiosGet.mockResolvedValue({ data });

describe('events-news-api', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockedMapper.mockImplementation((dto: { id: number }) => ({ id: String(dto.id) }));
    });

    describe('EventsNewsApi.get', () => {
        it.each([
            ['default arguments', [], { categoryId: undefined, offset: 0, limit: 5 }],
            ['a tag id, offset and limit', ['3', 8, 4], { categoryId: '3', offset: 8, limit: 4 }],
            ['an empty tag id (all materials)', ['', 0, 4], { categoryId: undefined, offset: 0, limit: 4 }],
            ['an undefined tag id', [undefined, 5, 5], { categoryId: undefined, offset: 5, limit: 5 }],
        ] as [string, Parameters<typeof EventsNewsApi.get>, object][])(
            'sends the published endpoint request with %s',
            async (_description, args, expectedParams) => {
                mockResponse({ items: [], totalItemsCount: 0 });

                await EventsNewsApi.get(...args);

                expect(mockedAxiosGet).toHaveBeenCalledTimes(1);
                expect(mockedAxiosGet).toHaveBeenCalledWith(API_ROUTES.EVENTS.PUBLISHED, {
                    params: expectedParams,
                    signal: undefined,
                });
            },
        );

        it('maps every item through mapToEventsNews and keeps the total count', async () => {
            const dtos = [createPublishedEventNewsDto({ id: 1 }), createPublishedEventNewsDto({ id: 2 })];
            mockResponse({ items: dtos, totalItemsCount: 7 });

            const result = await EventsNewsApi.get();

            expect(mockedMapper).toHaveBeenCalledTimes(dtos.length);
            expect(result).toEqual({ items: [{ id: '1' }, { id: '2' }], totalItemsCount: 7 });
        });

        it('returns an empty page when the backend has no items', async () => {
            mockResponse({ items: [], totalItemsCount: 0 });

            await expect(EventsNewsApi.get('999')).resolves.toEqual({ items: [], totalItemsCount: 0 });
            expect(mockedMapper).not.toHaveBeenCalled();
        });

        it('rejects when the request fails', async () => {
            mockedAxiosGet.mockRejectedValue(new Error('Network'));

            await expect(EventsNewsApi.get()).rejects.toThrow('Network');
        });
    });

    describe('EventNewsApi.get', () => {
        it('requests the published news by slug and maps the response', async () => {
            mockResponse(createPublishedEventNewsDto({ id: 5, slug: 'my-slug' }));

            mockedMapper.mockReturnValueOnce({ id: '5', sections: [] });

            const result = await EventNewsApi.get('my-slug');

            expect(mockedAxiosGet).toHaveBeenCalledWith