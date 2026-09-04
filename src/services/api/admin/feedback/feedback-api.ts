import { AxiosInstance } from 'axios';
import { PaginationResult, VisibilityStatus } from '@/types/admin/common';
import { FeedbackHistoryDto, FeedbackReviewDto } from '@/types/admin/feedback';

const mockDelay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const FeedbackApi = {
    fetchHistory: async (_client: AxiosInstance): Promise<PaginationResult<FeedbackHistoryDto>> => {
        await mockDelay(500);
        const data: FeedbackHistoryDto[] = Array.from({ length: 5 }).map((_, i) => ({
            id: i + 1,
            title: `Історія ${i + 1}`,
            story: `Текст історії ${i + 1}`,
            image: null,
            status: VisibilityStatus.Published,
            priority: i,
        }));
        return { items: data, totalItemsCount: data.length };
    },
    fetchReviews: async (_client: AxiosInstance): Promise<PaginationResult<FeedbackReviewDto>> => {
        await mockDelay(500);
        const data: FeedbackReviewDto[] = Array.from({ length: 5 }).map((_, i) => ({
            id: i + 1,
            authorName: `Учасник ${i + 1}`,
            text: `Текст відгуку ${i + 1}`,
            status: VisibilityStatus.Published,
            priority: i,
        }));
        return { items: data, totalItemsCount: data.length };
    },
    fetchVideos: async (_client: AxiosInstance): Promise<PaginationResult<any>> => {
        await mockDelay(500);
        const data = Array.from({ length: 5 }).map((_, i) => ({
            id: i + 1,
            title: `Відео ${i + 1}`,
            videoUrl: 'https://example.com/video',
            status: VisibilityStatus.Published,
            priority: i,
        }));
        return { items: data, totalItemsCount: data.length };
    },
};
