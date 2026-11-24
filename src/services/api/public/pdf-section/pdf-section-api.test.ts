import { API_ROUTES } from '@/const/common/api-routes/main-api';
import { axiosInstance } from '@/services/api/axios';
import { PublicPdfSectionDto } from '@/types/public/reports';
import { PdfSectionPublicApi } from './pdf-section-api';

jest.mock('@/services/api/axios', () => ({
    axiosInstance: {
        get: jest.fn(),
    },
}));

const mockedAxiosGet = axiosInstance.get as jest.Mock;

describe('PdfSectionPublicApi', () => {
    const mockSection: PublicPdfSectionDto = {
        title: 'Оновлений заголовок',
        description: 'Оновлений короткий опис',
        localizations: [
            {
                language: { id: 2, code: 'en' },
                title: 'Updated Title',
                description: 'Updated Description',
            },
        ],
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('fetches the public PDF section endpoint without signal by default', async () => {
        mockedAxiosGet.mockResolvedValueOnce({ data: mockSection });

        const result = await PdfSectionPublicApi.get();

        expect(mockedAxiosGet).toHaveBeenCalledTimes(1);
        expect(mockedAxiosGet).toHaveBeenCalledWith(API_ROUTES.PDF_SECTION.PUBLIC, { signal: undefined });
        expect(result).toEqual(mockSection);
    });

    it('passes the cancellation signal when provided', async () => {
        const controller = new AbortController();
        mockedAxiosGet.mockResolvedValueOnce({ data: mockSection });

        const result = await PdfSectionPublicApi.get({ cancellationSignal: controller.signal });

        expect(mockedAxiosGet).toHaveBeenCalledWith(API_ROUTES.PDF_SECTION.PUBLIC, { signal: controller.signal });
        expect(result).toEqual(mockSection);
    });

    it('propagates errors from axiosInstance', async () => {
        const error = new Error('Network failure');
        mockedAxiosGet.mockRejectedValueOnce(error);

        await expect(PdfSectionPublicApi.get()).rejects.toThrow('Network failure');
    });
});
