import { PartnerSectionLocalizationApi } from './partner-section-localizations-api';
import { API_ROUTES } from '@/const/common/api-routes/main-api';
import {
    CreatePartnerSectionLocalizationDto,
    PartnerSectionLocalizationDto,
    UpdatePartnerSectionLocalizationDto,
} from '@/types/admin/partners';
import { LocalizationInfo, TranslationStatus } from '@/types/common/language';

describe('PartnerSectionLocalizationApi.get', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should call client.get with correct url and return response data', async () => {
        const mockClient = {
            get: jest.fn(),
        };

        const mockResponseData: PartnerSectionLocalizationDto = {
            entityId: 1,
            title: 'Section title',
            description: 'Translated section description',
            partners: [{ partnerId: 5, description: 'Translated partner description' }],
            localizationInfoDto: {
                id: 2,
                code: 'en',
                name: 'English',
            } as LocalizationInfo,
            translationStatus: TranslationStatus.Relevant,
        };

        mockClient.get.mockResolvedValueOnce({ data: mockResponseData });

        const result = await PartnerSectionLocalizationApi.get(mockClient as any, 1, 2);

        expect(mockClient.get).toHaveBeenCalledTimes(1);
        expect(mockClient.get).toHaveBeenCalledWith(`${API_ROUTES.PARTNER_SECTION_LOCALIZATIONS.BASE}/1/2`);
        expect(result).toEqual(mockResponseData);
    });

    it('should return null when the API responds with 404', async () => {
        const mockClient = {
            get: jest.fn(),
        };

        const notFoundError = {
            isAxiosError: true,
            response: { status: 404 },
        };

        mockClient.get.mockRejectedValueOnce(notFoundError);

        const result = await PartnerSectionLocalizationApi.get(mockClient as any, 1, 2);

        expect(result).toBeNull();
    });

    it('should rethrow when the error is not a 404', async () => {
        const mockClient = {
            get: jest.fn(),
        };

        const serverError = {
            isAxiosError: true,
            response: { status: 500 },
        };

        mockClient.get.mockRejectedValueOnce(serverError);

        await expect(PartnerSectionLocalizationApi.get(mockClient as any, 1, 2)).rejects.toEqual(serverError);
    });
});

describe('PartnerSectionLocalizationApi.create', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should call client.post with correct url and payload and return response data', async () => {
        const mockClient = {
            post: jest.fn(),
        };

        const payload: CreatePartnerSectionLocalizationDto = {
            entityId: 1,
            languageId: 2,
            title: 'Section title',
            description: 'Translated section description',
            partners: [{ partnerId: 5, description: 'Translated partner description' }],
        };

        const mockResponseData: PartnerSectionLocalizationDto = {
            entityId: 1,
            title: 'Section title',
            description: 'Translated section description',
            partners: [{ partnerId: 5, description: 'Translated partner description' }],
            localizationInfoDto: {
                id: 2,
                code: 'en',
                name: 'English',
            } as LocalizationInfo,
            translationStatus: TranslationStatus.Relevant,
        };

        mockClient.post.mockResolvedValueOnce({ data: mockResponseData });

        const result = await PartnerSectionLocalizationApi.create(mockClient as any, payload);

        expect(mockClient.post).toHaveBeenCalledTimes(1);
        expect(mockClient.post).toHaveBeenCalledWith(API_ROUTES.PARTNER_SECTION_LOCALIZATIONS.BASE, payload);
        expect(result).toEqual(mockResponseData);
    });
});

describe('PartnerSectionLocalizationApi.update', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should call client.put with correct url and payload and return response data', async () => {
        const mockClient = {
            put: jest.fn(),
        };

        const entityId = 1;
        const languageId = 2;

        const payload: UpdatePartnerSectionLocalizationDto = {
            title: 'Updated section title',
            description: 'Updated section description',
            partners: [{ partnerId: 5, description: 'Updated partner description' }],
        };

        const mockResponseData: PartnerSectionLocalizationDto = {
            entityId,
            title: 'Updated section title',
            description: 'Updated section description',
            partners: [{ partnerId: 5, description: 'Updated partner description' }],
            localizationInfoDto: {
                id: languageId,
                code: 'en',
                name: 'English',
            } as LocalizationInfo,
            translationStatus: TranslationStatus.Relevant,
        };

        mockClient.put.mockResolvedValueOnce({ data: mockResponseData });

        const result = await PartnerSectionLocalizationApi.update(mockClient as any, entityId, languageId, payload);

        expect(mockClient.put).toHaveBeenCalledTimes(1);
        expect(mockClient.put).toHaveBeenCalledWith(
            `${API_ROUTES.PARTNER_SECTION_LOCALIZATIONS.BASE}/${entityId}/${languageId}`,
            payload,
        );
        expect(result).toEqual(mockResponseData);
    });
});
