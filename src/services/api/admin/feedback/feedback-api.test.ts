import { FeedbackApi } from './feedback-api';
import { VisibilityStatus } from '@/types/admin/common';
import { FeedbackCategory } from '@/types/admin/feedback';

describe('FeedbackApi', () => {
    const mockHistoryList = Array.from({ length: 21 }).map((_, i) => ({
        id: i + 1,
        title: `Історія ${i + 1}`,
        story: `Текст історії ${i + 1}`,
        image: null,
        status: VisibilityStatus.Published,
        priority: i,
    }));

    const mockReviewsList = Array.from({ length: 21 }).map((_, i) => ({
        id: i + 1,
        authorName: `Учасник ${i + 1}`,
        text: `Текст відгуку ${i + 1}`,
        status: VisibilityStatus.Published,
        priority: i,
    }));

    const mockVideosList = Array.from({ length: 21 }).map((_, i) => ({
        id: i + 1,
        title: `Відео ${i + 1}`,
        link: `https://www.youtube.com/watch?v=video-${i + 1}`,
        status: VisibilityStatus.Published,
        priority: i,
    }));

    const mockClient = {
        get: jest.fn(),
        delete: jest.fn(),
        put: jest.fn(),
        post: jest.fn(),
    } as any;

    beforeEach(() => {
        jest.useFakeTimers();
        jest.clearAllMocks();
        mockClient.get.mockResolvedValue({ data: mockHistoryList });
        mockClient.delete.mockResolvedValue({ data: undefined });
        mockClient.put.mockResolvedValue({ data: undefined });
        mockClient.post.mockResolvedValue({ data: undefined });
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

    describe('deleteFeedback', () => {
        it('should send delete request for histories', async () => {
            await FeedbackApi.deleteFeedback(mockClient, FeedbackCategory.HISTORY, 42);

            expect(mockClient.delete).toHaveBeenCalledWith('FeedbackHistories/42');
        });

        it('should send delete request for reviews', async () => {
            await FeedbackApi.deleteFeedback(mockClient, FeedbackCategory.REVIEWS, 7);

            expect(mockClient.delete).toHaveBeenCalledWith('FeedbackReviews/7');
        });

        it('should send delete request for videos', async () => {
            await FeedbackApi.deleteFeedback(mockClient, FeedbackCategory.VIDEOS, 9);

            expect(mockClient.delete).toHaveBeenCalledWith('VideoReviews/9');
        });
    });
    describe('createHistory', () => {
        it('should post new history and return response data', async () => {
            const newHistoryPayload = {
                title: 'Нова історія',
                story: 'Текст нової історії',
                imageId: 5,
                status: VisibilityStatus.Published,
            };
            const mockResponse = { id: 99, ...newHistoryPayload, image: null, priority: 0 };
            mockClient.post = jest.fn().mockResolvedValue({ data: mockResponse });

            const result = await FeedbackApi.createHistory(mockClient, newHistoryPayload);

            expect(mockClient.post).toHaveBeenCalledWith('FeedbackHistories', newHistoryPayload);
            expect(result).toEqual(mockResponse);
        });
    });

    describe('updateHistory', () => {
        it('should put updated history and return response data', async () => {
            const updateHistoryPayload = {
                title: 'Оновлена історія',
                story: 'Текст оновленої історії',
                imageId: 10,
                status: VisibilityStatus.Published,
            };
            const mockResponse = { id: 42, ...updateHistoryPayload, image: null, priority: 1 };
            mockClient.put = jest.fn().mockResolvedValue({ data: mockResponse });

            const result = await FeedbackApi.updateHistory(mockClient, 42, updateHistoryPayload);

            expect(mockClient.put).toHaveBeenCalledWith('FeedbackHistories/42', updateHistoryPayload);
            expect(result).toEqual(mockResponse);
        });
    });

    describe('fetchReviews', () => {
        beforeEach(() => {
            mockClient.get.mockResolvedValue({
                data: { items: mockReviewsList, totalItemsCount: mockReviewsList.length },
            });
        });

        it('should fetch reviews with default pagination when no params provided', async () => {
            const result = await FeedbackApi.fetchReviews(mockClient);

            expect(mockClient.get).toHaveBeenCalledWith('FeedbackReviews');
            expect(result.items).toHaveLength(7);
            expect(result.totalItemsCount).toBe(21);
            expect(result.items[0].authorName).toBe('Учасник 1');
        });

        it('should fetch reviews with custom take and skip', async () => {
            const result = await FeedbackApi.fetchReviews(mockClient, {
                take: 3,
                skip: 5,
            });

            expect(result.items).toHaveLength(3);
            expect(result.items[0].id).toBe(6);
        });

        it('should fetch reviews with offset and limit and filter by searchTerm', async () => {
            const result = await FeedbackApi.fetchReviews(mockClient, {
                searchTerm: 'Учасник 1',
                offset: 7,
                limit: 7,
            });

            expect(result.totalItemsCount).toBe(11);
            expect(result.items.length).toBe(4);
        });

        it('should return empty items when skip is greater than total items', async () => {
            const result = await FeedbackApi.fetchReviews(mockClient, {
                skip: 25,
            });

            expect(result.items).toHaveLength(0);
        });
    });

    describe('fetchVideos', () => {
        beforeEach(() => {
            mockClient.get.mockResolvedValue({ data: mockVideosList });
        });

        it('should fetch videos with default pagination when no params provided', async () => {
            const result = await FeedbackApi.fetchVideos(mockClient);

            expect(mockClient.get).toHaveBeenCalledWith('VideoReviews');
            expect(result.items).toHaveLength(7);
            expect(result.totalItemsCount).toBe(21);
            expect(result.items[0].title).toBe('Відео 1');
            expect(result.items[0].link).toBe('https://www.youtube.com/watch?v=video-1');
        });

        it('should fetch videos with custom take and skip', async () => {
            const result = await FeedbackApi.fetchVideos(mockClient, {
                take: 4,
                skip: 2,
            });

            expect(result.items).toHaveLength(4);
            expect(result.items[0].id).toBe(3);
        });

        it('should fetch videos with offset and limit and filter by searchTerm', async () => {
            const result = await FeedbackApi.fetchVideos(mockClient, {
                searchTerm: 'Відео 1',
                offset: 7,
                limit: 7,
            });

            expect(result.totalItemsCount).toBe(11);
            expect(result.items.length).toBe(4);
        });

        it('should return empty items when skip is greater than total items', async () => {
            const result = await FeedbackApi.fetchVideos(mockClient, {
                skip: 25,
            });

            expect(result.items).toHaveLength(0);
        });
    });

    describe('reorderFeedback', () => {
        it('should send reorder request for histories', async () => {
            await FeedbackApi.reorderFeedback(mockClient, FeedbackCategory.HISTORY, [1, 2, 3]);

            expect(mockClient.put).toHaveBeenCalledWith('FeedbackHistories/reorder', { orderedIds: [1, 2, 3] });
        });

        it('should send reorder request for reviews', async () => {
            await FeedbackApi.reorderFeedback(mockClient, FeedbackCategory.REVIEWS, [1, 2, 3]);

            expect(mockClient.put).toHaveBeenCalledWith('FeedbackReviews/reorder', { orderedIds: [1, 2, 3] });
        });

        it('should send reorder request for videos', async () => {
            await FeedbackApi.reorderFeedback(mockClient, FeedbackCategory.VIDEOS, [1, 2, 3]);

            expect(mockClient.put).toHaveBeenCalledWith('VideoReviews/reorder', { orderedIds: [1, 2, 3] });
        });
    });

    describe('updateReview', () => {
        it('should send put request with review id and data', async () => {
            const updatedReview = {
                id: 5,
                authorName: 'Олена',
                text: 'Дуже вдячна центру за підтримку',
                status: VisibilityStatus.Published,
                priority: 1,
            };
            mockClient.put.mockResolvedValue({ data: updatedReview });

            const result = await FeedbackApi.updateReview(mockClient, 5, {
                authorName: 'Олена',
                text: 'Дуже вдячна центру за підтримку',
                status: VisibilityStatus.Published,
            });

            expect(mockClient.put).toHaveBeenCalledWith('FeedbackReviews/5', {
                authorName: 'Олена',
                text: 'Дуже вдячна центру за підтримку',
                status: VisibilityStatus.Published,
            });
            expect(result).toEqual(updatedReview);
        });
    });

    describe('createReview', () => {
        it('should send post request with review data', async () => {
            const newReview = {
                id: 7,
                authorName: 'Олена',
                text: 'Дуже вдячна центру за підтримку',
                status: VisibilityStatus.Published,
                priority: 1,
            };
            mockClient.post.mockResolvedValue({ data: newReview });

            const result = await FeedbackApi.createReview(mockClient, {
                authorName: 'Олена',
                text: 'Дуже вдячна центру за підтримку',
                status: VisibilityStatus.Published,
            });

            expect(mockClient.post).toHaveBeenCalledWith('FeedbackReviews', {
                authorName: 'Олена',
                text: 'Дуже вдячна центру за підтримку',
                status: VisibilityStatus.Published,
            });
            expect(result).toEqual(newReview);
        });
    });

    describe('createVideoReview', () => {
        it('should send post request with video data', async () => {
            const newVideo = {
                id: 9,
                title: 'Test video review',
                link: 'https://www.youtube.com/watch?v=test',
                status: VisibilityStatus.Published,
                priority: 1,
            };
            mockClient.post.mockResolvedValue({ data: newVideo });

            const result = await FeedbackApi.createVideoReview(mockClient, {
                title: 'Test video review',
                link: 'https://www.youtube.com/watch?v=test',
                status: VisibilityStatus.Published,
            });

            expect(mockClient.post).toHaveBeenCalledWith('VideoReviews', {
                title: 'Test video review',
                link: 'https://www.youtube.com/watch?v=test',
                status: VisibilityStatus.Published,
            });
            expect(result).toEqual(newVideo);
        });
    });
});
