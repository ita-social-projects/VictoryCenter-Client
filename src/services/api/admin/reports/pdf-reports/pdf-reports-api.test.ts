import { AxiosInstance } from 'axios';
import { PdfReportsApi } from './pdf-reports-api';
import { API_ROUTES } from '@/const/common/api-routes/main-api';
import { PdfReportDto } from '@/types/admin/pdf-section';
import { PaginationResult } from '@/types/admin/common';

describe('PdfReportsApi', () => {
    let mockClient: jest.Mocked<AxiosInstance>;

    const mockPdfReports: PdfReportDto[] = [
        {
            id: 1,
            name: 'Report 2024-01',
            fileUrl: 'http://example.com/1.pdf',
            createdAt: '2024-01-01T10:00:00Z',
        },
        {
            id: 2,
            name: 'Report 2024-02',
            fileUrl: 'http://example.com/2.pdf',
            createdAt: '2024-02-01T10:00:00Z',
        },
    ] as any;

    const mockPaginationResult: PaginationResult<PdfReportDto> = {
        items: mockPdfReports,
        totalItemsCount: 2,
    };

    beforeEach(() => {
        jest.clearAllMocks();
        mockClient = {
            get: jest.fn(),
            post: jest.fn(),
            delete: jest.fn(),
        } as any;
    });

    describe('getAll', () => {
        it('should fetch pdf reports with correct pagination params', async () => {
            const filter = { offset: 0, limit: 10 };
            mockClient.get.mockResolvedValueOnce({ data: mockPaginationResult });

            const result = await PdfReportsApi.getAll(mockClient, filter);

            expect(mockClient.get).toHaveBeenCalledWith(API_ROUTES.PDF_REPORTS.BASE, {
                params: filter,
            });
            expect(result).toEqual(mockPaginationResult);
        });

        it('should handle empty results from API', async () => {
            const emptyResult: PaginationResult<PdfReportDto> = {
                items: [],
                totalItemsCount: 0,
            };
            mockClient.get.mockResolvedValueOnce({ data: emptyResult });

            const result = await PdfReportsApi.getAll(mockClient, { offset: 0, limit: 10 });

            expect(result.items).toHaveLength(0);
            expect(result.totalItemsCount).toBe(0);
        });

        it('should throw error when api request fails', async () => {
            mockClient.get.mockRejectedValueOnce(new Error('Network Error'));

            await expect(PdfReportsApi.getAll(mockClient, { offset: 0, limit: 10 })).rejects.toThrow('Network Error');
        });

        it('should pass dynamic offset and limit to request params', async () => {
            const filter = { offset: 50, limit: 25 };
            mockClient.get.mockResolvedValueOnce({ data: mockPaginationResult });

            await PdfReportsApi.getAll(mockClient, filter);

            expect(mockClient.get).toHaveBeenCalledWith(
                API_ROUTES.PDF_REPORTS.BASE,
                expect.objectContaining({
                    params: { offset: 50, limit: 25 },
                }),
            );
        });
    });

    describe('fetchById', () => {
        it('should fetch pdf blob by id with correct responseType', async () => {
            const mockBlob = new Blob() as any;
            mockClient.get.mockResolvedValueOnce({ data: mockBlob });

            const result = await PdfReportsApi.fetchById(mockClient, 1);

            expect(mockClient.get).toHaveBeenCalledWith(`${API_ROUTES.PDF_REPORTS.BASE}/1`, {
                responseType: 'blob',
            });
            expect(result).toEqual(mockBlob);
        });

        it('should use correct endpoint with file id', async () => {
            const mockBlob = new Blob() as any;
            mockClient.get.mockResolvedValueOnce({ data: mockBlob });

            await PdfReportsApi.fetchById(mockClient, 42);

            expect(mockClient.get).toHaveBeenCalledWith(`${API_ROUTES.PDF_REPORTS.BASE}/42`, expect.any(Object));
        });

        it('should throw error when api request fails', async () => {
            mockClient.get.mockRejectedValueOnce(new Error('Download failed'));

            await expect(PdfReportsApi.fetchById(mockClient, 1)).rejects.toThrow('Download failed');
        });

        it('should handle 404 error when file not found', async () => {
            const notFoundError = new Error('Not Found');
            mockClient.get.mockRejectedValueOnce(notFoundError);

            await expect(PdfReportsApi.fetchById(mockClient, 99)).rejects.toThrow('Not Found');
        });
    });
});
