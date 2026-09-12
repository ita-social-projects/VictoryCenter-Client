import { AxiosInstance } from 'axios';
import { PaginationResult, VisibilityStatus } from '@/types/admin/common';
import {
    CreateFeedbackHistoryDto,
    FeedbackHistoryDto,
    FeedbackReviewDto,
    FeedbackVideoDto,
} from '@/types/admin/feedback';
import { TranslationStatusFilter } from '@/types/common/language';
import { API_ROUTES } from '@/const/common/api-routes/main-api';

const mockDelay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export interface FeedbackFetchParams {
    status?: VisibilityStatus;
    language?: string;
    translationStatus?: TranslationStatusFilter;
    skip?: number;
    take?: number;
    offset?: number;
    limit?: number;
    searchTerm?: string;
}

const filterAndPaginate = <T extends { status: VisibilityStatus }>(
    items: T[],
    params: FeedbackFetchParams | undefined,
    getSearchField: (item: T) => string,
): PaginationResult<T> => {
    const take = params?.take ?? params?.limit ?? 7;
    const skip = params?.skip ?? params?.offset ?? 0;

    let filteredItems = items;

    if (params?.status !== undefined) {
        filteredItems = filteredItems.filter((item) => item.status === params.status);
    }

    if (params?.searchTerm) {
        const term = params.searchTerm.toLowerCase();
        filteredItems = filteredItems.filter((item) => getSearchField(item).toLowerCase().includes(term));
    }

    const totalItemsCount = filteredItems.length;
    const data = filteredItems.slice(skip, skip + take);

    return { items: data, totalItemsCount };
};

export const FeedbackApi = {
    fetchHistory: async (
        client: AxiosInstance,
        params?: FeedbackFetchParams,
    ): Promise<PaginationResult<FeedbackHistoryDto>> => {
        const response = await client.get<FeedbackHistoryDto[]>(API_ROUTES.FEEDBACK_HISTORIES.BASE);
        return filterAndPaginate(response.data, params, (item) => item.title);
    },
    deleteHistory: async (client: AxiosInstance, id: number): Promise<void> => {
        await client.delete(`${API_ROUTES.FEEDBACK_HISTORIES.BASE}/${id}`);
    },
    createHistory: async (client: AxiosInstance, data: CreateFeedbackHistoryDto): Promise<FeedbackHistoryDto> => {
        const response = await client.post<FeedbackHistoryDto>(API_ROUTES.FEEDBACK_HISTORIES.BASE, data);
        return response.data;
    },
    fetchReviews: async (
        _client: AxiosInstance,
        _params?: FeedbackFetchParams,
    ): Promise<PaginationResult<FeedbackReviewDto>> => {
        await mockDelay(500);

        const allItems: FeedbackReviewDto[] = Array.from({ length: 21 }).map((_, i) => ({
            id: i + 1,
            authorName: `Учасник ${i + 1}`,
            text: `Текст відгуку ${i + 1}`,
            status: VisibilityStatus.Published,
            priority: i,
        }));

        return filterAndPaginate(allItems, _params, (item) => item.authorName);
    },
    fetchVideos: async (
        _client: AxiosInstance,
        _params?: FeedbackFetchParams,
    ): Promise<PaginationResult<FeedbackVideoDto>> => {
        await mockDelay(500);

        const allItems: FeedbackVideoDto[] = Array.from({ length: 21 }).map((_, i) => ({
            id: i + 1,
            title: `Відео ${i + 1}`,
            videoUrl: 'https://example.com/video',
            status: VisibilityStatus.Published,
            priority: i,
        }));

        return filterAndPaginate(allItems, _params, (item) => item.title);
    },
    reorderFeedback: async (_client: AxiosInstance, _category: string, _orderedIds: number[]): Promise<void> => {
        await mockDelay(500);
        // Mock successful reorder
    },
};
