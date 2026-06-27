import { PdfSectionLocalizationsApi } from './pdf-section-localizations-api';
import { API_ROUTES } from '@/const/common/api-routes/main-api';
import {
    CreatePdfSectionLocalizationDto,
    PdfSectionLocalizationDto,
    UpdatePdfSectionLocalizationDto,
} from '@/types/admin/pdf-section';
import { LocalizationInfo, TranslationStatus } from '@/types/common/language';

describe('PdfSectionLocalizationsApi.create', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should call client.post with correct url and payload and return response data', async () => {
        const mockClient = {
            post: jest.fn(),
        };

        const payload: CreatePdfSectionLocalizationDto = {
            languageId: 2,
            title: 'Translated Title',
            description: 'Translated Description',
        };

        const mockResponseData: PdfSectionLocalizationDto = {
            languageId: 2,
            title: 'Translated Title',
            description: 'Translated Description',
            localizationInfoDto: {
                id: 2,
                code: 'en',
                name: 'English',
            } as LocalizationInfo,
            translationStatus: TranslationStatus.Relevant,
        };

        mockClient.post.mockResolvedValueOnce({
            data: mockResponseData,
        });

        const result = await PdfSectionLocalizationsApi.create(mockClient as any, payload);

        expect(mockClient.post).toHaveBeenCalledTimes(1);
        expect(mockClient.post).toHaveBeenCalledWith(API_ROUTES.PDF_SECTION_LOCALIZATIONS.BASE, payload);
        expect(result).toEqual(mockResponseData);
    });
});

describe('PdfSectionLocalizationsApi.update', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should call client.put with correct url and payload and return response data', async () => {
        const mockClient = {
            put: jest.fn(),
        };

        const languageId = 2;

        const payload: UpdatePdfSectionLocalizationDto = {
            title: 'Updated Title',
            description: 'Updated Description',
        };

        const mockResponseData: PdfSectionLocalizationDto = {
            languageId,
            title: 'Updated Title',
            description: 'Updated Description',
            localizationInfoDto: {
                id: languageId,
                code: 'en',
                name: 'English',
            } as LocalizationInfo,
            translationStatus: TranslationStatus.Relevant,
        };

        mockClient.put.mockResolvedValueOnce({
            data: mockResponseData,
        });

        const result = await PdfSectionLocalizationsApi.update(mockClient as any, languageId, payload);

        expect(mockClient.put).toHaveBeenCalledTimes(1);
        expect(mockClient.put).toHaveBeenCalledWith(
            `${API_ROUTES.PDF_SECTION_LOCALIZATIONS.BASE}/${languageId}`,
            payload,
        );
        expect(result).toEqual(mockResponseData);
    });

    it('should handle error responses gracefully', async () => {
        const mockClient = {
            put: jest.fn(),
        };

        const error = new Error('Network error');
        mockClient.put.mockRejectedValueOnce(error);

        await expect(
            PdfSectionLocalizationsApi.update(mockClient as any, 2, {
                title: 'Test',
                description: 'Test',
            }),
        ).rejects.toThrow('Network error');
    });
});
