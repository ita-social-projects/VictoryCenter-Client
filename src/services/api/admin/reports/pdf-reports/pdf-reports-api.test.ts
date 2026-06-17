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

    describe('rename', () => {
        it('should call put with correct url and body', async () => {
            const updatedReport = { ...mockPdfReports[0], name: 'New Name' };
            mockClient.put = jest.fn().mockResolvedValueOnce({ data: updatedReport });

            const result = await PdfReportsApi.rename(mockClient, 1, 'New Name');

            expect(mockClient.put).toHaveBeenCalledWith(`${API_ROUTES.PDF_REPORTS.BASE}/1`, { name: 'New Name' });
            expect(result).toEqual(updatedReport);
        });

        it('should return updated dto with new name', async () => {
            const updatedReport = { ...mockPdfReports[0], name: 'Updated' };
            mockClient.put = jest.fn().mockResolvedValueOnce({ data: updatedReport });

            const result = await PdfReportsApi.rename(mockClient, 1, 'Updated');

            expect(result.name).toBe('Updated');
        });

        it('should throw error when api request fails', async () => {
            mockClient.put = jest.fn().mockRejectedValueOnce(new Error('Server Error'));

            await expect(PdfReportsApi.rename(mockClient, 1, 'New Name')).rejects.toThrow('Server Error');
        });

        it('should use correct id in url', async () => {
            const updatedReport = { ...mockPdfReports[1], name: 'New Name' };
            mockClient.put = jest.fn().mockResolvedValueOnce({ data: updatedReport });

            await PdfReportsApi.rename(mockClient, 42, 'New Name');

            expect(mockClient.put).toHaveBeenCalledWith(`${API_ROUTES.PDF_REPORTS.BASE}/42`, expect.any(Object));
        });
    });

    describe('create', () => {
        it('should call post with correct url and formData', async () => {
            const mockFile = new File(['content'], 'test.pdf', { type: 'application/pdf' });
            const createdReport = mockPdfReports[0];
            mockClient.post = jest.fn().mockResolvedValueOnce({ data: createdReport });

            const result = await PdfReportsApi.create(mockClient, mockFile, 1);

            expect(mockClient.post).toHaveBeenCalledWith(API_ROUTES.PDF_REPORTS.BASE, expect.any(FormData), {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            expect(result).toEqual(createdReport);
        });

        it('should append file to formData with correct key', async () => {
            const mockFile = new File(['content'], 'test.pdf', { type: 'application/pdf' });
            mockClient.post = jest.fn().mockResolvedValueOnce({ data: mockPdfReports[0] });

            await PdfReportsApi.create(mockClient, mockFile, 1);

            const formData = (mockClient.post as jest.Mock).mock.calls[0][1] as FormData;
            expect(formData.get('File')).toEqual(mockFile);
        });

        it('should return created dto', async () => {
            const mockFile = new File(['content'], 'test.pdf', { type: 'application/pdf' });
            mockClient.post = jest.fn().mockResolvedValueOnce({ data: mockPdfReports[0] });

            const result = await PdfReportsApi.create(mockClient, mockFile, 1);

            expect(result.id).toBe(mockPdfReports[0].id);
            expect(result.name).toBe(mockPdfReports[0].name);
        });

        it('should throw error when api request fails', async () => {
            const mockFile = new File(['content'], 'test.pdf', { type: 'application/pdf' });
            mockClient.post = jest.fn().mockRejectedValueOnce(new Error('Upload failed'));

            await expect(PdfReportsApi.create(mockClient, mockFile, 1)).rejects.toThrow('Upload failed');
        });
    });

    describe('delete', () => {
        it('should call delete with correct url', async () => {
            mockClient.delete = jest.fn().mockResolvedValueOnce({});

            await PdfReportsApi.delete(mockClient, 1);

            expect(mockClient.delete).toHaveBeenCalledWith(`${API_ROUTES.PDF_REPORTS.BASE}/1`);
        });

        it('should use correct id in url', async () => {
            mockClient.delete = jest.fn().mockResolvedValueOnce({});

            await PdfReportsApi.delete(mockClient, 42);

            expect(mockClient.delete).toHaveBeenCalledWith(`${API_ROUTES.PDF_REPORTS.BASE}/42`);
        });

        it('should return void on success', async () => {
            mockClient.delete = jest.fn().mockResolvedValueOnce({});

            const result = await PdfReportsApi.delete(mockClient, 1);

            expect(result).toBeUndefined();
        });

        it('should throw error when api request fails', async () => {
            mockClient.delete = jest.fn().mockRejectedValueOnce(new Error('Delete failed'));

            await expect(PdfReportsApi.delete(mockClient, 1)).rejects.toThrow('Delete failed');
        });

        it('should throw error on 404 when file not found', async () => {
            mockClient.delete = jest.fn().mockRejectedValueOnce(new Error('Not Found'));

            await expect(PdfReportsApi.delete(mockClient, 99)).rejects.toThrow('Not Found');
        });
    });
});
