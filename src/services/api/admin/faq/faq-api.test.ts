import { FaqApi } from './faq-api';
import { API_ROUTES } from '@/const/common/api-routes/main-api';
import { FaqCreateUpdate, FaqQuestionDto, ReorderFaq, VisitorPage } from '@/types/admin/faq';
import { PaginationResult, VisibilityStatus } from '@/types/admin/common';

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
        const result = await FaqApi.getAll(mockClient, 1, VisibilityStatus.Published, 5, 10);
        expect(mockClient.get).toHaveBeenCalledWith(
            API_ROUTES.FAQ.BASE,
            expect.objectContaining({
                params: expect.objectContaining({
                    pageId: 1,
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
        await FaqApi.getAll(mockClient, 1, undefined, undefined, 5);
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

    it('getSearchItems should return empty result', async () => {
        const result = await FaqApi.getSearchItems('term', { offset: 0, limit: 10, requestOptions: {} });
        expect(result).toEqual({ items: [], totalItemsCount: 0 });
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
