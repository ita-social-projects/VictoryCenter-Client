import { AxiosInstance } from 'axios';
import { PaginationResult, VisibilityStatus } from '@/types/admin/common';
import {
    CreateFeedbackHistoryDto,
    UpdateFeedbackHistoryDto,
    FeedbackCategory,
    FeedbackHistoryDto,
    FeedbackHistoryLocalization,
    FeedbackHistoryLocalizationDto,
    FeedbackHistoryResponseDto,
    FeedbackReviewDto,
    FeedbackReviewLocalization,
    FeedbackReviewLocalizationDto,
    FeedbackReviewResponseDto,
    FeedbackVideoDto,
    FeedbackVideoLocalization,
    FeedbackVideoLocalizationDto,
    FeedbackVideoResponseDto,
} from '@/types/admin/feedback';
import { TranslationStatusFilter } from '@/types/common/language';
import { API_ROUTES } from '@/const/common/api-routes/main-api';
import { mapEntityWithLocalizations } from '@/utils/functions/mappers/common/localization/localization-mappers';

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
        const response = await client.get<FeedbackHistoryResponseDto[]>(API_ROUTES.FEEDBACK_HISTORIES.BASE);
        const items = response.data.map((item) =>
            mapEntityWithLocalizations<
                FeedbackHistoryResponseDto,
                FeedbackHistoryLocalizationDto,
                FeedbackHistoryLocalization
            >(item),
        );
        return filterAndPaginate(items, params, (item) => item.title);
    },
    deleteHistory: async (client: AxiosInstance, id: number): Promise<void> => {
        await client.delete(`${API_ROUTES.FEEDBACK_HISTORIES.BASE}/${id}`);
    },
    createHistory: async (client: AxiosInstance, data: CreateFeedbackHistoryDto): Promise<FeedbackHistoryDto> => {
        const response = await client.post<FeedbackHistoryDto>(API_ROUTES.FEEDBACK_HISTORIES.BASE, data);
        return response.data;
    },
    updateHistory: async (
        client: AxiosInstance,
        id: number,
        data: UpdateFeedbackHistoryDto,
    ): Promise<FeedbackHistoryDto> => {
        const response = await client.put<FeedbackHistoryDto>(`${API_ROUTES.FEEDBACK_HISTORIES.BASE}/${id}`, data);
        return response.data;
    },
    fetchReviews: async (
        client: AxiosInstance,
        params?: FeedbackFetchParams,
    ): Promise<PaginationResult<FeedbackReviewDto>> => {
        const response = await client.get<PaginationResult<FeedbackReviewResponseDto>>(
            API_ROUTES.FEEDBACK_REVIEWS.BASE,
        );
        const items = response.data.items.map((item) =>
            mapEntityWithLocalizations<
                FeedbackReviewResponseDto,
                FeedbackReviewLocalizationDto,
                FeedbackReviewLocalization
            >(item),
        );
        return filterAndPaginate(items, params, (item) => item.authorName);
    },
    fetchVideos: async (
        client: AxiosInstance,
        params?: FeedbackFetchParams,
    ): Promise<PaginationResult<FeedbackVideoDto>> => {
        const response = await client.get<FeedbackVideoResponseDto[]>(API_ROUTES.VIDEO_REVIEWS.BASE);
        const items = response.data.map((item) =>
            mapEntityWithLocalizations<
                FeedbackVideoResponseDto,
                FeedbackVideoLocalizationDto,
                FeedbackVideoLocalization
            >(item),
        );
        return filterAndPaginate(items, params, (item) => item.title);
    },
    reorderFeedback: async (client: AxiosInstance, category: FeedbackCategory, orderedIds: number[]): Promise<void> => {
        const routes: Record<FeedbackCategory, string> = {
            [FeedbackCategory.HISTORY]: API_ROUTES.FEEDBACK_HISTORIES.BASE,
            [FeedbackCategory.REVIEWS]: API_ROUTES.FEEDBACK_REVIEWS.BASE,
            [FeedbackCategory.VIDEOS]: API_ROUTES.VIDEO_REVIEWS.BASE,
        };

        await client.put(`${routes[category]}/reorder`, { orderedIds });
    },
};
