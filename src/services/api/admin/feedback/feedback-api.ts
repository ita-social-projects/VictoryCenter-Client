import { AxiosInstance } from 'axios';
import { PaginationResult, VisibilityStatus } from '@/types/admin/common';
import { FeedbackHistoryDto, FeedbackReviewDto, FeedbackVideoDto } from '@/types/admin/feedback';
import { TranslationStatusFilter } from '@/types/common/language';

const mockDelay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const FeedbackApi = {
    fetchHistory: async (
        _client: AxiosInstance,
        _params?: {
            status?: VisibilityStatus;
            language?: string;
            translationStatus?: TranslationStatusFilter;
            skip?: number;
            take?: number;
            searchTerm?: string;
        },
    ): Promise<PaginationResult<FeedbackHistoryDto>> => {
        await mockDelay(500);
        const take = _params?.take ?? 7;
        const skip = _params?.skip || 0;
        const totalItemsCount = 21;
        const count = Math.min(take, Math.max(0, totalItemsCount - skip));
        const data: FeedbackHistoryDto[] = Array.from({ length: count }).map((_, i) => ({
            id: i + 1 + skip,
            title: `Історія ${i + 1 + skip}`,
            story: `Текст історії ${i + 1 + skip}`,
            image: null,
            status: VisibilityStatus.Published,
            priority: i,
        }));
        return { items: data, totalItemsCount };
    },
    fetchReviews: async (
        _client: AxiosInstance,
        _params?: {
            status?: VisibilityStatus;
            language?: string;
            translationStatus?: TranslationStatusFilter;
            skip?: number;
            take?: number;
            searchTerm?: string;
        },
    ): Promise<PaginationResult<FeedbackReviewDto>> => {
        await mockDelay(500);
        const take = _params?.take ?? 7;
        const skip = _params?.skip || 0;
        const totalItemsCount = 21;
        const count = Math.min(take, Math.max(0, totalItemsCount - skip));
        const data: FeedbackReviewDto[] = Array.from({ length: count }).map((_, i) => ({
            id: i + 1 + skip,
            authorName: `Учасник ${i + 1 + skip}`,
            text: `Текст відгуку ${i + 1 + skip}`,
            status: VisibilityStatus.Published,
            priority: i,
        }));
        return { items: data, totalItemsCount };
    },
    fetchVideos: async (
        _client: AxiosInstance,
        _params?: {
            status?: VisibilityStatus;
            language?: string;
            translationStatus?: TranslationStatusFilter;
            skip?: number;
            take?: number;
            searchTerm?: string;
        },
    ): Promise<PaginationResult<FeedbackVideoDto>> => {
        await mockDelay(500);
        const take = _params?.take ?? 7;
        const skip = _params?.skip || 0;
        const totalItemsCount = 21;
        const count = Math.min(take, Math.max(0, totalItemsCount - skip));
        const data = Array.from({ length: count }).map((_, i) => ({
            id: i + 1 + skip,
            title: `Відео ${i + 1 + skip}`,
            videoUrl: 'https://example.com/video',
            status: VisibilityStatus.Published,
            priority: i,
        }));
        return { items: data, totalItemsCount };
    },
    reorderFeedback: async (_client: AxiosInstance, _category: string, _orderedIds: number[]): Promise<void> => {
        await mockDelay(500);
        // Mock successful reorder
    },
};
