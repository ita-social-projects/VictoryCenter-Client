import { FaqApi } from './faq-api';
import { API_ROUTES } from '@/const/common/api-routes/main-api';
import { FaqCreateUpdate, FaqQuestionDto, ReorderFaq, VisitorPage } from '@/types/admin/faq';
import { PaginationResult, VisibilityStatus } from '@/types/admin/common';
import { TranslationStatusFilter } from '@/types/common/language';

describe('FaqApi', () => {
    const mockClient = {
        get: jest.fn(),
        post: jest.fn(),
        put: jest.fn(),
        delete: jest.fn(),
    } as any;

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('getAll should call GET with correct params and return data', async () => {
        const mockResult: PaginationResult<FaqQuestionDto> = { items: [], totalItemsCount: 0 };
        mockClient.get.mockResolvedValueOnce({ data: mockResult });
        const result = await FaqApi.getAll(
            mockClient,
            1,
            TranslationStatusFilter.All,
            VisibilityStatus.Published,
            5,
            10,
        );
        expect(mockClient.get).toHaveBeenCalledWith(
            API_ROUTES.FAQ.BASE,
            expect.objectContaining({
                params: expect.objectContaining({
                    pageId: 1,
                    translationStatusFilter: TranslationStatusFilter.All,
                    status: VisibilityStatus.Published,
                    offset: 5,
                    limit: 10,
                }),
            }),
        );
        expect(result).toEqual(mockResult);
    });

    it('getAll should not set params for undefined values', async () => {
        const mockResult: PaginationResult<FaqQuestionDto> = { items: [], totalItemsCount: 0 };
        mockClient.get.mockResolvedValueOnce({ data: mockResult });
        await FaqApi.getAll(mockClient, undefined, undefined, undefined, undefined);
        // Only params object should be empty
        expect(mockClient.get).toHaveBeenCalledWith(API_ROUTES.FAQ.BASE, expect.objectContaining({ params: {} }));
    });

    it('getAll should set only provided params', async () => {
        const mockResult: PaginationResult<FaqQuestionDto> = { items: [], totalItemsCount: 0 };
        mockClient.get.mockResolvedValueOnce({ data: mockResult });
        await FaqApi.getAll(mockClient, 1, undefined, undefined, undefined, 5);
        expect(mockClient.get).toHaveBeenCalledWith(
            API_ROUTES.FAQ.BASE,
            expect.objectContaining({ params: expect.objectContaining({ pageId: 1, limit: 5 }) }),
        );
    });

    it('getById should call GET with correct id and return data', async () => {
        const mockFaq: FaqQuestionDto = {
            id: 1,
            questionText: 'Q',
            answerText: 'A',
            status: VisibilityStatus.Published,
            pageIds: [1],
        } as any;
        mockClient.get.mockResolvedValueOnce({ data: mockFaq });
        const result = FaqApi.getById(mockClient, 1);
        expect(mockClient.get).toHaveBeenCalledWith(`${API_ROUTES.FAQ.BASE}/1`);
        expect(await result).toEqual(mockFaq);
    });

    it('getPages should call GET and return data', async () => {
        const mockPages: VisitorPage[] = [{ id: 1, name: 'Page' } as any];
        mockClient.get.mockResolvedValueOnce({ data: mockPages });
        const result = await FaqApi.getPages(mockClient);
        expect(mockClient.get).toHaveBeenCalledWith(API_ROUTES.FAQ.PAGES);
        expect(result).toEqual(mockPages);
    });

    it('fetchFaqSearchItems should call GET with correct params and return mapped suggestions', async () => {
        const apiResponse = {
            data: {
                items: [
                    { id: 1, questionText: 'First question' },
                    { id: 2, questionText: 'Second question' },
                ],
                totalItemsCount: 2,
            },
        };

        mockClient.get.mockResolvedValueOnce(apiResponse);

        const result = await FaqApi.fetchFaqSearchItems(mockClient, 'term', 0, 5);

        expect(mockClient.get).toHaveBeenCalledWith(
            API_ROUTES.FAQ.SEARCH,
            expect.objectContaining({
                params: {
                    searchQuery: 'term',
                    offset: 0,
                    limit: 5,
                },
            }),
        );

        expect(result).toEqual({
            items: [
                { id: 1, question: 'First question' },
                { id: 2, question: 'Second question' },
            ],
            totalItemsCount: 2,
        });
    });

    it('fetchFaqSearchItems should pass AbortSignal when provided', async () => {
        const controller = new AbortController();

        mockClient.get.mockResolvedValueOnce({
            data: {
                items: [],
                totalItemsCount: 0,
            },
        });

        await FaqApi.fetchFaqSearchItems(mockClient, 'term', 0, 5, controller.signal);

        expect(mockClient.get).toHaveBeenCalledWith(
            API_ROUTES.FAQ.SEARCH,
            expect.objectContaining({
                params: {
                    searchQuery: 'term',
                    offset: 0,
                    limit: 5,
                },
                signal: controller.signal,
            }),
        );
    });

    it('fetchFaqSearchItems should use default offset and limit', async () => {
        mockClient.get.mockResolvedValueOnce({
            data: {
                items: [],
                totalItemsCount: 0,
            },
        });

        const result = await FaqApi.fetchFaqSearchItems(mockClient, 'term');

        expect(mockClient.get).toHaveBeenCalledWith(
            API_ROUTES.FAQ.SEARCH,
            expect.objectContaining({
                params: {
                    searchQuery: 'term',
                    offset: 0,
                    limit: 5,
                },
            }),
        );

        expect(result).toEqual({
            items: [],
            totalItemsCount: 0,
        });
    });

    it('delete should call DELETE with correct id', async () => {
        mockClient.delete.mockResolvedValueOnce({});
        await FaqApi.delete(mockClient, 5);
        expect(mockClient.delete).toHaveBeenCalledWith(`${API_ROUTES.FAQ.BASE}/5`);
    });

    it('reorder should call PUT with correct dto', async () => {
        const dto: ReorderFaq = { pageId: 1, orderedIds: [1, 2, 3] };
        mockClient.put.mockResolvedValueOnce({});
        await FaqApi.reorder(mockClient, dto);
        expect(mockClient.put).toHaveBeenCalledWith(API_ROUTES.FAQ.REORDER, dto);
    });

    it('update should call PUT with correct payload and return data', async () => {
        const faq: FaqCreateUpdate = {
            id: 2,
            questionText: 'Q',
            answerText: 'A',
            status: VisibilityStatus.Published,
            pageIds: [1],
        } as any;
        const mockFaq: FaqQuestionDto = { ...faq } as any;
        mockClient.put.mockResolvedValueOnce({ data: mockFaq });
        const result = await FaqApi.update(mockClient, faq);
        expect(mockClient.put).toHaveBeenCalledWith(
            `${API_ROUTES.FAQ.BASE}/2`,
            expect.objectContaining({
                questionText: 'Q',
                answerText: 'A',
                status: VisibilityStatus.Published,
                pageIds: [1],
            }),
        );
        expect(result).toEqual(mockFaq);
    });

    it('post should call POST with correct payload and return data', async () => {
        const faq: FaqCreateUpdate = {
            id: 3,
            questionText: 'Q',
            answerText: 'A',
            status: VisibilityStatus.Published,
            pageIds: [1],
        } as any;
        const mockFaq: FaqQuestionDto = { ...faq } as any;
        mockClient.post.mockResolvedValueOnce({ data: mockFaq });
        const result = await FaqApi.post(mockClient, faq);
        expect(mockClient.post).toHaveBeenCalledWith(
            `${API_ROUTES.FAQ.BASE}`,
            expect.objectContaining({
                questionText: 'Q',
                answerText: 'A',
                status: VisibilityStatus.Published,
                pageIds: [1],
            }),
        );
        expect(result).toEqual(mockFaq);
    });
});
