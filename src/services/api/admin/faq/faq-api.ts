import { AxiosInstance } from 'axios';
import { PaginationResult, VisibilityStatus } from '@/types/admin/common';
import { FaqCreateUpdate, FaqQuestionDto, FaqSearchItemData, ReorderFaq, VisitorPage } from '@/types/admin/faq';
import { API_ROUTES } from '@/const/common/api-routes/main-api';
import { TranslationStatusFilter } from '@/types/common/language';

type FaqPayload = Omit<FaqCreateUpdate, 'id'>;
const toPayload = (faq: FaqCreateUpdate): FaqPayload => {
    const { questionText, answerText, status, pageIds } = faq;
    return { questionText, answerText, status, pageIds };
};

export const FaqApi = {
    getAll: async (
        client: AxiosInstance,
        pageId?: number,
        translationStatusFilter?: TranslationStatusFilter | null,
        status?: VisibilityStatus | null,
        offset?: number,
        limit?: number,
    ): Promise<PaginationResult<FaqQuestionDto>> => {
        const params: Record<string, any> = {};

        if (pageId !== undefined) {
            params.pageId = pageId;
        }
        if (translationStatusFilter !== undefined && translationStatusFilter !== null) {
            params.translationStatusFilter = translationStatusFilter;
        }
        if (status !== undefined) {
            params.status = status;
        }
        if (offset !== undefined) {
            params.offset = offset;
        }
        if (limit !== undefined) {
            params.limit = Math.floor(limit);
        }

        const response = await client.get<PaginationResult<FaqQuestionDto>>(`${API_ROUTES.FAQ.BASE}`, { params });
        return response.data;
    },

    getById: async (client: AxiosInstance, id: number): Promise<FaqQuestionDto> => {
        const response = await client.get<FaqQuestionDto>(`${API_ROUTES.FAQ.BASE}/${id}`);
        return response.data;
    },

    getPages: async (client: AxiosInstance): Promise<VisitorPage[]> => {
        const response = await client.get<VisitorPage[]>(API_ROUTES.FAQ.PAGES);
        return response.data;
    },

    fetchFaqSearchItems: async (
        client: AxiosInstance,
        searchTerm: string,
        offset: number = 0,
        limit: number = 5,
        signal?: AbortSignal,
    ): Promise<PaginationResult<FaqSearchItemData>> => {
        const response = await client.get<PaginationResult<FaqQuestionDto>>(`${API_ROUTES.FAQ.SEARCH}`, {
            params: {
                searchQuery: searchTerm,
                offset,
                limit,
            },
            signal,
        });

        const suggestions: FaqSearchItemData[] = response.data.items.map((faq) => ({
            id: faq.id,
            question: faq.questionText,
        }));

        return {
            items: suggestions,
            totalItemsCount: response.data.totalItemsCount,
        };
    },

    delete: async (client: AxiosInstance, id: number) => {
        await client.delete(`${API_ROUTES.FAQ.BASE}/${id}`);
    },

    reorder: async (client: AxiosInstance, dto: ReorderFaq) => {
        await client.put(API_ROUTES.FAQ.REORDER, dto);
    },

    update: async (client: AxiosInstance, faq: FaqCreateUpdate): Promise<FaqQuestionDto> => {
        if (faq.id == null) {
            throw new Error('FaqApi.update: faq.id is required');
        }
        const response = await client.put<FaqQuestionDto>(`${API_ROUTES.FAQ.BASE}/${faq.id}`, toPayload(faq));
        return response.data;
    },

    post: async (client: AxiosInstance, faq: FaqCreateUpdate): Promise<FaqQuestionDto> => {
        const response = await client.post<FaqQuestionDto>(`${API_ROUTES.FAQ.BASE}`, toPayload(faq));

        return response.data;
    },
};
