import { AxiosInstance } from 'axios';
import { PdfSectionApi } from './pdf-section-api';
import { API_ROUTES } from '@/const/common/api-routes/main-api';
import { PdfSection } from '@/types/admin/pdf-section';

describe('PdfSectionApi', () => {
    let mockClient: jest.Mocked<AxiosInstance>;

    const mockPdfSection: PdfSection = {
        id: 1,
        title: 'Test PDF Section',
        description: 'Test Description',
        isActive: true,
    } as any;

    beforeEach(() => {
        jest.clearAllMocks();
        mockClient = {
            get: jest.fn(),
            patch: jest.fn(),
        } as any;
    });

    describe('getPdfSection', () => {
        it('should fetch pdf section data successfully', async () => {
            mockClient.get.mockResolvedValueOnce({ data: mockPdfSection });

            const result = await PdfSectionApi.getPdfSection(mockClient);

            expect(mockClient.get).toHaveBeenCalledWith(API_ROUTES.PDF_SECTION.CONTENT);
            expect(result).toEqual(mockPdfSection);
        });

        it('should call the correct API endpoint', async () => {
            mockClient.get.mockResolvedValueOnce({ data: mockPdfSection });

            await PdfSectionApi.getPdfSection(mockClient);

            expect(mockClient.get).toHaveBeenCalledWith(expect.stringContaining(API_ROUTES.PDF_SECTION.CONTENT));
        });

        it('should throw an error when the API request fails', async () => {
            const errorMessage = 'Internal Server Error';
            mockClient.get.mockRejectedValueOnce(new Error(errorMessage));

            await expect(PdfSectionApi.getPdfSection(mockClient)).rejects.toThrow(errorMessage);
        });

        it('should return null or undefined if API returns no data', async () => {
            mockClient.get.mockResolvedValueOnce({ data: null });

            const result = await PdfSectionApi.getPdfSection(mockClient);

            expect(result).toBeNull();
        });
    });

    describe('updatePdfSection', () => {
        it('should update pdf section successfully', async () => {
            mockClient.patch.mockResolvedValueOnce({ data: mockPdfSection });

            const result = await PdfSectionApi.updatePdfSection(mockClient, mockPdfSection);

            expect(mockClient.patch).toHaveBeenCalledWith(API_ROUTES.PDF_SECTION.BASE, mockPdfSection);
            expect(result).toEqual(mockPdfSection);
        });

        it('should call the correct API endpoint', async () => {
            mockClient.patch.mockResolvedValueOnce({ data: mockPdfSection });

            await PdfSectionApi.updatePdfSection(mockClient, mockPdfSection);

            expect(mockClient.patch).toHaveBeenCalledWith(
                expect.stringContaining(API_ROUTES.PDF_SECTION.BASE),
                mockPdfSection,
            );
        });

        it('should throw an error when the API request fails', async () => {
            const errorMessage = 'Internal Server Error';
            mockClient.patch.mockRejectedValueOnce(new Error(errorMessage));

            await expect(PdfSectionApi.updatePdfSection(mockClient, mockPdfSection)).rejects.toThrow(errorMessage);
        });

        it('should return updated data from response', async () => {
            const updatedSection = { ...mockPdfSection, title: 'Updated Title' };
            mockClient.patch.mockResolvedValueOnce({ data: updatedSection });

            const result = await PdfSectionApi.updatePdfSection(mockClient, updatedSection);

            expect(result).toEqual(updatedSection);
        });
    });
});
