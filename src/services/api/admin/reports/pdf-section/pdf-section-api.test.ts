import { AxiosInstance } from 'axios';
import { PdfSectionApi } from './pdf-section-api';
import { API_ROUTES } from '@/const/common/api-routes/main-api';
import { PdfSection, PdfSectionLocalizableFields } from '@/types/admin/pdf-section';

describe('PdfSectionApi', () => {
    let mockClient: jest.Mocked<AxiosInstance>;

    const mockPdfSection: PdfSection = {
        title: 'Test PDF Section',
        description: 'Test Description',
        localizations: [],
    };

    const mockUpdateData: PdfSectionLocalizableFields = {
        title: 'Test PDF Section',
        description: 'Test Description',
    };

    beforeEach(() => {
        jest.clearAllMocks();
        mockClient = {
            get: jest.fn(),
            put: jest.fn(),
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
            mockClient.put.mockResolvedValueOnce({ data: mockPdfSection });
            const result = await PdfSectionApi.updatePdfSection(mockClient, mockUpdateData);
            expect(mockClient.put).toHaveBeenCalledWith(API_ROUTES.PDF_SECTION.BASE, mockUpdateData);
            expect(result).toEqual(mockPdfSection);
        });

        it('should call the correct API endpoint', async () => {
            mockClient.put.mockResolvedValueOnce({ data: mockPdfSection });
            await PdfSectionApi.updatePdfSection(mockClient, mockUpdateData);
            expect(mockClient.put).toHaveBeenCalledWith(
                expect.stringContaining(API_ROUTES.PDF_SECTION.BASE),
                mockUpdateData,
            );
        });

        it('should throw an error when the API request fails', async () => {
            const errorMessage = 'Internal Server Error';
            mockClient.put.mockRejectedValueOnce(new Error(errorMessage));
            await expect(PdfSectionApi.updatePdfSection(mockClient, mockUpdateData)).rejects.toThrow(errorMessage);
        });

        it('should return updated data from response', async () => {
            const updatedSection: PdfSection = { ...mockPdfSection, title: 'Updated Title' };
            mockClient.put.mockResolvedValueOnce({ data: updatedSection });
            const result = await PdfSectionApi.updatePdfSection(mockClient, { ...mockUpdateData, title: 'Updated Title' });
            expect(result).toEqual(updatedSection);
        });
    });
});
