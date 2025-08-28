import { AxiosInstance } from 'axios';
import { PaginationResult, VisibilityStatus } from '../../../../types/admin/common';
import { FaqCreateUpdate, FaqQuestion, FaqSearchItemData, VisitorPage } from '../../../../types/admin/faq';
import { API_ROUTES } from '../../../../const/common/api-routes/main-api';
import { RequestOptions } from '../../../../types/common/api';

export const FaqApi = {
    getAll: async (
        client: AxiosInstance,
        pageId?: number,
        status?: VisibilityStatus | null,
        offset?: number,
        limit?: number,
    ): Promise<PaginationResult<FaqQuestion>> => {
        const params: Record<string, any> = {};

        if (pageId !== undefined && pageId !== null) {
            params.pageId = pageId;
        }
        if (status !== undefined) {
            params.status = status;
        }
        if (offset !== undefined && offset !== null) {
            params.offset = offset;
        }
        if (limit !== undefined && limit !== null) {
            params.limit = Math.floor(limit);
        }

        const response = await client.get<PaginationResult<FaqQuestion>>(`${API_ROUTES.FAQ.BASE}`, { params });
        return response.data;
    },

    getById: async (client: AxiosInstance, id: number): Promise<FaqQuestion> => {
        const response = await client.get<FaqQuestion>(`${API_ROUTES.FAQ.BASE}/${id}`);
        return response.data;
    },

    getPages: async (client: AxiosInstance): Promise<VisitorPage[]> => {
        const response = await client.get<VisitorPage[]>(API_ROUTES.FAQ.PAGES);
        return response.data;
    },

    getSearchItems: async (
        searchTerm: string,
        offset: number,
        limit: number,
        options?: RequestOptions,
    ): Promise<PaginationResult<FaqSearchItemData>> => {
        return {
            items: [],
            totalItemsCount: 0,
        };
    },

    delete: async (client: AxiosInstance, id: number) => {
        await client.delete(`${API_ROUTES.FAQ.BASE}/${id}`);
    },

    reorder: async (client: AxiosInstance, pageId: number, orderedIds: number[]) => {
        await client.put(API_ROUTES.FAQ.REORDER, {
            pageId,
            orderedIds,
        });
    },

    update: async (client: AxiosInstance, id: number, faq: FaqCreateUpdate): Promise<FaqQuestion> => {
        const response = await client.put(`${API_ROUTES.FAQ.BASE}/${id}`, {
            questionText: faq.questionText,
            answerText: faq.answerText,
            status: faq.status,
            pageIds: faq.pageIds,
        });

        return response.data as FaqQuestion;
    },

    post: async (client: AxiosInstance, faq: FaqCreateUpdate): Promise<FaqQuestion> => {
        const response = await client.post(`${API_ROUTES.FAQ.BASE}`, {
            questionText: faq.questionText,
            answerText: faq.answerText,
            status: faq.status,
            pageIds: faq.pageIds,
        });

        return response.data as FaqQuestion;
    },
};
