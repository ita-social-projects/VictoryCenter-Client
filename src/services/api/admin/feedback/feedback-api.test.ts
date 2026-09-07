import { FeedbackApi } from './feedback-api';
import { VisibilityStatus } from '@/types/admin/common';

describe('FeedbackApi', () => {
    const mockClient = {} as any;

    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    describe('fetchHistory', () => {
        it('should fetch history with default pagination when no params provided', async () => {
            const promise = FeedbackApi.fetchHistory(mockClient);
            jest.advanceTimersByTime(500);
            const result = await promise;

            expect(result.items).toHaveLength(7);
            expect(result.totalItemsCount).toBe(21);
            expect(result.items[0].id).toBe(1);
            expect(result.items[0].title).toBe('Історія 1');
        });

        it('should fetch history with custom take and skip', async () => {
            const promise = FeedbackApi.fetchHistory(mockClient, {
                take: 5,
                skip: 10,
                status: VisibilityStatus.Published,
            });
            jest.advanceTimersByTime(500);
            const result = await promise;

            expect(result.items).toHaveLength(5);
            expect(result.items[0].id).toBe(11);
        });

        it('should fetch history with offset and limit', async () => {
            const promise = FeedbackApi.fetchHistory(mockClient, {
                limit: 5,
                offset: 10,
            });
            jest.advanceTimersByTime(500);
            const result = await promise;

            expect(result.items).toHaveLength(5);
            expect(result.items[0].id).toBe(11);
        });

        it('should filter history by searchTerm', async () => {
            const promise = FeedbackApi.fetchHistory(mockClient, {
                searchTerm: 'Історія 1',
                offset: 7,
                limit: 7,
            });
            jest.advanceTimersByTime(500);
            const result = await promise;

            expect(result.totalItemsCount).toBe(11);
            expect(result.items.length).toBe(4);
            expect(result.items[0].title).toBe('Історія 16');
        });

        it('should return empty items when skip is greater than total items', async () => {
            const promise = FeedbackApi.fetchHistory(mockClient, {
                skip: 25,
            });
            jest.advanceTimersByTime(500);
            const result = await promise;

            expect(result.items).toHaveLength(0);
        });
    });

    describe('fetchReviews', () => {
        it('should fetch reviews with default pagination when no params provided', async () => {
            const promise = FeedbackApi.fetchReviews(mockClient);
            jest.advanceTimersByTime(500);
            const result = await promise;

            expect(result.items).toHaveLength(7);
            expect(result.totalItemsCount).toBe(21);
            expect(result.items[0].authorName).toBe('Учасник 1');
        });

        it('should fetch reviews with custom take and skip', async () => {
            const promise = FeedbackApi.fetchReviews(mockClient, {
                take: 3,
                skip: 5,
            });
            jest.advanceTimersByTime(500);
            const result = await promise;

            expect(result.items).toHaveLength(3);
            expect(result.items[0].id).toBe(6);
        });

        it('should fetch reviews with offset and limit and filter by searchTerm', async () => {
            const promise = FeedbackApi.fetchReviews(mockClient, {
                searchTerm: 'Учасник 1',
                offset: 7,
                limit: 7,
            });
            jest.advanceTimersByTime(500);
            const result = await promise;

            expect(result.totalItemsCount).toBe(11);
            expect(result.items.length).toBe(4);
        });

        it('should return empty items when skip is greater than total items', async () => {
            const promise = FeedbackApi.fetchReviews(mockClient, {
                skip: 25,
            });
            jest.advanceTimersByTime(500);
            const result = await promise;

            expect(result.items).toHaveLength(0);
        });
    });

    describe('fetchVideos', () => {
        it('should fetch videos with default pagination when no params provided', async () => {
            const promise = FeedbackApi.fetchVideos(mockClient);
            jest.advanceTimersByTime(500);
            const result = await promise;

            expect(result.items).toHaveLength(7);
            expect(result.totalItemsCount).toBe(21);
            expect(result.items[0].title).toBe('Відео 1');
            expect(result.items[0].videoUrl).toBe('https://example.com/video');
        });

        it('should fetch videos with custom take and skip', async () => {
            const promise = FeedbackApi.fetchVideos(mockClient, {
                take: 4,
                skip: 2,
            });
            jest.advanceTimersByTime(500);
            const result = await promise;

            expect(result.items).toHaveLength(4);
            expect(result.items[0].id).toBe(3);
        });

        it('should fetch videos with offset and limit and filter by searchTerm', async () => {
            const promise = FeedbackApi.fetchVideos(mockClient, {
                searchTerm: 'Відео 1',
                offset: 7,
                limit: 7,
            });
            jest.advanceTimersByTime(500);
            const result = await promise;

            expect(result.totalItemsCount).toBe(11);
            expect(result.items.length).toBe(4);
        });

        it('should return empty items when skip is greater than total items', async () => {
            const promise = FeedbackApi.fetchVideos(mockClient, {
                skip: 25,
            });
            jest.advanceTimersByTime(500);
            const result = await promise;

            expect(result.items).toHaveLength(0);
        });
    });

    describe('reorderFeedback', () => {
        it('should resolve reorderFeedback after delay', async () => {
            const promise = FeedbackApi.reorderFeedback(mockClient, 'history', [1, 2, 3]);
            jest.advanceTimersByTime(500);
            await expect(promise).resolves.toBeUndefined();
        });
    });
});
