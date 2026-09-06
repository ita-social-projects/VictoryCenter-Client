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
            offset?: number;
            limit?: number;
            searchTerm?: string;
        },
    ): Promise<PaginationResult<FeedbackHistoryDto>> => {
        await mockDelay(500);
        const take = _params?.take ?? _params?.limit ?? 7;
        const skip = _params?.skip ?? _params?.offset ?? 0;

        let allItems: FeedbackHistoryDto[] = Array.from({ length: 21 }).map((_, i) => ({
            id: i + 1,
            title: `Історія ${i + 1}`,
            story: `Текст історії ${i + 1}`,
            image: null,
            status: VisibilityStatus.Published,
            priority: i,
        }));

        if (_params?.status !== undefined) {
            allItems = allItems.filter((item) => item.status === _params.status);
        }

        if (_params?.searchTerm) {
            const term = _params.searchTerm.toLowerCase();
            allItems = allItems.filter((item) => item.title.toLowerCase().includes(term));
        }

        const totalItemsCount = allItems.length;
        const data = allItems.slice(skip, skip + take);

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
            offset?: number;
            limit?: number;
            searchTerm?: string;
        },
    ): Promise<PaginationResult<FeedbackReviewDto>> => {
        await mockDelay(500);
        const take = _params?.take ?? _params?.limit ?? 7;
        const skip = _params?.skip ?? _params?.offset ?? 0;

        let allItems: FeedbackReviewDto[] = Array.from({ length: 21 }).map((_, i) => ({
            id: i + 1,
            authorName: `Учасник ${i + 1}`,
            text: `Текст відгуку ${i + 1}`,
            status: VisibilityStatus.Published,
            priority: i,
        }));

        if (_params?.status !== undefined) {
            allItems = allItems.filter((item) => item.status === _params.status);
        }

        if (_params?.searchTerm) {
            const term = _params.searchTerm.toLowerCase();
            allItems = allItems.filter((item) => item.authorName.toLowerCase().includes(term));
        }

        const totalItemsCount = allItems.length;
        const data = allItems.slice(skip, skip + take);

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
            offset?: number;
            limit?: number;
            searchTerm?: string;
        },
    ): Promise<PaginationResult<FeedbackVideoDto>> => {
        await mockDelay(500);
        const take = _params?.take ?? _params?.limit ?? 7;
        const skip = _params?.skip ?? _params?.offset ?? 0;

        let allItems: FeedbackVideoDto[] = Array.from({ length: 21 }).map((_, i) => ({
            id: i + 1,
            title: `Відео ${i + 1}`,
            videoUrl: 'https://example.com/video',
            status: VisibilityStatus.Published,
            priority: i,
        }));

        if (_params?.status !== undefined) {
            allItems = allItems.filter((item) => item.status === _params.status);
        }

        if (_params?.searchTerm) {
            const term = _params.searchTerm.toLowerCase();
            allItems = allItems.filter((item) => item.title.toLowerCase().includes(term));
        }

        const totalItemsCount = allItems.length;
        const data = allItems.slice(skip, skip + take);

        return { items: data, totalItemsCount };
    },
    reorderFeedback: async (_client: AxiosInstance, _category: string, _orderedIds: number[]): Promise<void> => {
        await mockDelay(500);
        // Mock successful reorder
    },
};
