import { EventsNewsApi } from './events-news-api';
import { eventsNewsMock } from '@/utils/mock-data/public/event-news';

describe('EventsNewsApi.get', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
        jest.restoreAllMocks();
    });

    it('returns first page items and totalItemsCount when enough items remain', async () => {
        const promise = EventsNewsApi.get('', 0, 5);

        jest.advanceTimersByTime(500);
        await jest.runAllTimers();

        await expect(promise).resolves.toEqual({
            items: eventsNewsMock.slice(0, 5),
            totalItemsCount: eventsNewsMock.length,
        });
    });

    it('returns remaining items and totalItemsCount set to 0 when offset+limit >= items.length', async () => {
        const offset = 10;
        const limit = 5;

        const promise = EventsNewsApi.get('', offset, limit);

        jest.advanceTimersByTime(500);
        await jest.runAllTimers();

        await expect(promise).resolves.toEqual({
            items: eventsNewsMock.slice(offset, offset + limit),
            totalItemsCount: 0,
        });
    });

    it('filters by tagId and paginates correctly', async () => {
        const tagId = '2';
        const allForTag = eventsNewsMock.filter((e) => e.tags.some((t) => t.id === tagId));
        const offset = 0;
        const limit = 3;

        const promise = EventsNewsApi.get(tagId, offset, limit);

        jest.advanceTimersByTime(500);
        await jest.runAllTimers();

        const expectedTotal = offset + limit >= allForTag.length ? 0 : allForTag.length;

        await expect(promise).resolves.toEqual({
            items: allForTag.slice(offset, offset + limit),
            totalItemsCount: expectedTotal,
        });
    });

    it('propagates rejection when implementation is mocked to fail', async () => {
        jest.spyOn(EventsNewsApi, 'get').mockImplementationOnce(() => Promise.reject(new Error('Network')));
        await expect(EventsNewsApi.get('', 0, 5)).rejects.toThrow('Network');
    });

    it('returns empty items and totalItemsCount 0 when tagId has no matches', async () => {
        const tagId = 'non-existent';
        const promise = EventsNewsApi.get(tagId, 0, 5);

        jest.advanceTimersByTime(500);
        await jest.runAllTimers();

        await expect(promise).resolves.toEqual({
            items: [],
            totalItemsCount: 0,
        });
    });

    it('handles limit = 0 by returning empty items and totalItemsCount equal to items.length', async () => {
        const promise = EventsNewsApi.get('', 0, 0);

        jest.advanceTimersByTime(500);
        await jest.runAllTimers();

        await expect(promise).resolves.toEqual({
            items: eventsNewsMock.slice(0, 0),
            totalItemsCount: eventsNewsMock.length,
        });
    });
});
