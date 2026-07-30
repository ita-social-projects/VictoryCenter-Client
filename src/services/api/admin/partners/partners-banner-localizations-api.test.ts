import { PartnerBannerLocalizationApi } from './partners-banner-localizations-api';
import { API_ROUTES } from '@/const/common/api-routes/main-api';
import {
    CreatePartnerBannerLocalizationDto,
    PartnerBannerLocalizationDto,
    UpdatePartnerBannerLocalizationDto,
} from '@/types/admin/partners';
import { LocalizationInfo, TranslationStatus } from '@/types/common/language';

describe('PartnerBannerLocalizationApi.create', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should call client.post with correct url and payload and return response data', async () => {
        const mockClient = {
            post: jest.fn(),
        };

        const payload: CreatePartnerBannerLocalizationDto = {
            entityId: 1,
            languageId: 2,
            title: 'Banner title',
            description: 'Translated banner description',
        };

        const mockResponseData: PartnerBannerLocalizationDto = {
            entityId: 1,
            title: 'Banner title',
            description: 'Translated banner description',
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

        const result = await PartnerBannerLocalizationApi.create(mockClient as any, payload);

        expect(mockClient.post).toHaveBeenCalledTimes(1);
        expect(mockClient.post).toHaveBeenCalledWith(API_ROUTES.PARTNERS_PAGE_BANNER_LOCALIZATIONS.BASE, payload);
        expect(result).toEqual(mockResponseData);
    });
});

describe('PartnerBannerLocalizationApi.update', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should call client.put with correct url and payload and return response data', async () => {
        const mockClient = {
            put: jest.fn(),
        };

        const entityId = 1;
        const languageId = 2;

        const payload: UpdatePartnerBannerLocalizationDto = {
            title: 'Updated banner title',
            description: 'Updated banner description',
        };

        const mockResponseData: PartnerBannerLocalizationDto = {
            entityId,
            title: 'Updated banner title',
            description: 'Updated banner description',
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

        const result = await PartnerBannerLocalizationApi.update(mockClient as any, entityId, languageId, payload);

        expect(mockClient.put).toHaveBeenCalledTimes(1);
        expect(mockClient.put).toHaveBeenCalledWith(
            `${API_ROUTES.PARTNERS_PAGE_BANNER_LOCALIZATIONS.BASE}/${entityId}/${languageId}`,
            payload,
        );
        expect(result).toEqual(mockResponseData);
    });
});
