import { FeedbackApi } from './feedback-api';
import { VisibilityStatus } from '@/types/admin/common';

describe('FeedbackApi', () => {
    const mockHistoryList = Array.from({ length: 21 }).map((_, i) => ({
        id: i + 1,
        title: `Історія ${i + 1}`,
        story: `Текст історії ${i + 1}`,
        image: null,
        status: VisibilityStatus.Published,
        priority: i,
    }));

    const mockClient = {
        get: jest.fn(),
        delete: jest.fn(),
    } as any;

    beforeEach(() => {
        jest.useFakeTimers();
        jest.clearAllMocks();
        mockClient.get.mockResolvedValue({ data: mockHistoryList });
        mockClient.delete.mockResolvedValue({ data: undefined });
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    describe('fetchHistory', () => {
        it('should fetch history with default pagination when no params provided', async () => {
            const result = await FeedbackApi.fetchHistory(mockClient);

            expect(mockClient.get).toHaveBeenCalledWith('FeedbackHistories');
            expect(result.items).toHaveLength(7);
            expect(result.totalItemsCount).toBe(21);
            expect(result.items[0].id).toBe(1);
            expect(result.items[0].title).toBe('Історія 1');
        });

        it('should fetch history with custom take and skip', async () => {
            const result = await FeedbackApi.fetchHistory(mockClient, {
                take: 5,
                skip: 10,
                status: VisibilityStatus.Published,
            });

            expect(result.items).toHaveLength(5);
            expect(result.items[0].id).toBe(11);
        });

        it('should fetch history with offset and limit', async () => {
            const result = await FeedbackApi.fetchHistory(mockClient, {
                limit: 5,
                offset: 10,
            });

            expect(result.items).toHaveLength(5);
            expect(result.items[0].id).toBe(11);
        });

        it('should filter history by searchTerm', async () => {
            const result = await FeedbackApi.fetchHistory(mockClient, {
                searchTerm: 'Історія 1',
                offset: 7,
                limit: 7,
            });

            expect(result.totalItemsCount).toBe(11);
            expect(result.items.length).toBe(4);
            expect(result.items[0].title).toBe('Історія 16');
        });

        it('should return empty items when skip is greater than total items', async () => {
            const result = await FeedbackApi.fetchHistory(mockClient, {
                skip: 25,
            });

            expect(result.items).toHaveLength(0);
        });
    });

    describe('deleteHistory', () => {
        it('should send delete request with correct id', async () => {
            await FeedbackApi.deleteHistory(mockClient, 42);

            expect(mockClient.delete).toHaveBeenCalledWith('FeedbackHistories/42');
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
