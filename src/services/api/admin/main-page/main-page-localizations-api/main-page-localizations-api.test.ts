import { API_ROUTES } from '@/const/common/api-routes/main-api';
import {
    CreateMainPageLocalizationDto,
    MainPageLocalizationDto,
    UpdateMainPageLocalizationDto,
} from '@/types/admin/main-page';
import { LocalizationInfo, TranslationStatus } from '@/types/common/language';
import { MainPageLocalizationsApi } from './main-page-localizations-api';

describe('MainPageLocalizationsApi', () => {
    const entityId = 1;
    const languageId = 2;

    const responseData: MainPageLocalizationDto = {
        entityId,
        title: 'Title',
        description: 'Description',
        translationStatus: TranslationStatus.Relevant,
        localizationInfoDto: { id: languageId, code: 'en', name: 'English' } as LocalizationInfo,
        mainAboutUs: null,
        mainPartners: null,
    };

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('gets localization by language id', async () => {
        const mockClient = {
            get: jest.fn().mockResolvedValueOnce({ data: responseData }),
        };

        const result = await MainPageLocalizationsApi.getByLanguageId(mockClient as any, entityId, languageId);

        expect(mockClient.get).toHaveBeenCalledWith(
            `${API_ROUTES.MAIN_PAGE_LOCALIZATIONS.BASE}/${entityId}/${languageId}`,
        );
        expect(result).toEqual(responseData);
    });

    it('gets translation statuses', async () => {
        const statuses = [
            {
                block: 0,
                entityId,
                languageId,
                translationStatus: TranslationStatus.Outdated,
            },
        ];
        const mockClient = {
            get: jest.fn().mockResolvedValueOnce({ data: statuses }),
        };

        const result = await MainPageLocalizationsApi.getStatuses(mockClient as any, entityId, languageId);

        expect(mockClient.get).toHaveBeenCalledWith(
            `${API_ROUTES.MAIN_PAGE_LOCALIZATIONS.BASE}/${entityId}/${languageId}/statuses`,
        );
        expect(result).toEqual(statuses);
    });

    it('creates localization', async () => {
        const payload: CreateMainPageLocalizationDto = {
            entityId,
            languageId,
            title: 'Title',
            description: 'Description',
            mainAboutUs: null,
            mainPartners: null,
        };
        const mockClient = {
            post: jest.fn().mockResolvedValueOnce({ data: responseData }),
        };

        const result = await MainPageLocalizationsApi.create(mockClient as any, payload);

        expect(mockClient.post).toHaveBeenCalledWith(API_ROUTES.MAIN_PAGE_LOCALIZATIONS.BASE, payload);
        expect(result).toEqual(responseData);
    });

    it('updates localization', async () => {
        const payload: UpdateMainPageLocalizationDto = {
            title: 'Updated title',
            description: 'Updated description',
            mainAboutUs: null,
            mainPartners: null,
        };
        const mockClient = {
            put: jest.fn().mockResolvedValueOnce({ data: responseData }),
        };

        const result = await MainPageLocalizationsApi.update(mockClient as any, entityId, languageId, payload);

        expect(mockClient.put).toHaveBeenCalledWith(
            `${API_ROUTES.MAIN_PAGE_LOCALIZATIONS.BASE}/${entityId}/${languageId}`,
            payload,
        );
        expect(result).toEqual(responseData);
    });
});
