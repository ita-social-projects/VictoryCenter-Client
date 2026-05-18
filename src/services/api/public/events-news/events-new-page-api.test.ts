import { EventsNewsPageApi } from './events-new-page-api';
import { eventsNewsPageMock } from '@/utils/mock-data/public/event-news';

describe('EventsNewsPageApi', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
        jest.restoreAllMocks();
    });

    it('resolves with the mock data after timeout', async () => {
        const promise = EventsNewsPageApi.get();

        // Fast-forward the setTimeout inside the implementation
        jest.advanceTimersByTime(1000);
        // Ensure pending timers/microtasks are processed
        await jest.runAllTimers();

        await expect(promise).resolves.toEqual(eventsNewsPageMock);
    });

    it('is a promise-returning function', () => {
        const result = EventsNewsPageApi.get();
        expect(result).toBeInstanceOf(Promise);
        // cleanup timers so test environment is stable
        jest.runAllTimers();
    });

    it('propagates rejection when implementation fails (mocked) with specific message', async () => {
        jest
            .spyOn(EventsNewsPageApi, 'get')
            .mockImplementationOnce(() => Promise.reject(new Error('Failed to fetch events news data')));

        await expect(EventsNewsPageApi.get()).rejects.toThrow('Failed to fetch events news data');
    });

    it('rejects when forceFail is true (real implementation)', async () => {
        const promise = EventsNewsPageApi.get(true);

        // advance timers to trigger setTimeout
        jest.advanceTimersByTime(1000);
        await jest.runAllTimers();

        await expect(promise).rejects.toThrow('Failed to fetch events news data');
    });
});
