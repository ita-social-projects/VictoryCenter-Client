import { TeamCategoryLocalizationApi } from './team-category-localizations-api';
import { API_ROUTES } from '@/const/common/api-routes/main-api';
import {
    CreateTeamCategoryLocalizationDto,
    TeamCategoryLocalizationDto,
    UpdateTeamCategoryLocalizationDto,
} from '@/types/admin/team-category';
import { LocalizationInfo, TranslationStatus } from '@/types/common/language';

describe('TeamCategoryLocalizationApi.create', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should call client.post with correct url and payload and return response data', async () => {
        const mockClient = {
            post: jest.fn(),
        };

        const payload: CreateTeamCategoryLocalizationDto = {
            entityId: 1,
            languageId: 2,
            name: 'Category name',
            description: 'Translated category description',
        };

        const mockResponseData: TeamCategoryLocalizationDto = {
            entityId: 1,
            name: 'Category name',
            description: 'Translated category description',
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

        const result = await TeamCategoryLocalizationApi.create(mockClient as any, payload);

        expect(mockClient.post).toHaveBeenCalledTimes(1);
        expect(mockClient.post).toHaveBeenCalledWith(API_ROUTES.TEAM_CATEGORY_LOCALIZATIONS.BASE, payload);
        expect(result).toEqual(mockResponseData);
    });
});

describe('TeamCategoryLocalizationApi.update', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should call client.put with correct url and payload and return response data', async () => {
        const mockClient = {
            put: jest.fn(),
        };

        const entityId = 1;
        const languageId = 2;

        const payload: UpdateTeamCategoryLocalizationDto = {
            name: 'Updated category name',
            description: 'Updated category description',
        };

        const mockResponseData: TeamCategoryLocalizationDto = {
            entityId,
            name: 'Updated category name',
            description: 'Updated category description',
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

        const result = await TeamCategoryLocalizationApi.update(mockClient as any, entityId, languageId, payload);

        expect(mockClient.put).toHaveBeenCalledTimes(1);
        expect(mockClient.put).toHaveBeenCalledWith(
            `${API_ROUTES.TEAM_CATEGORY_LOCALIZATIONS.BASE}/${entityId}/${languageId}`,
            payload,
        );
        expect(result).toEqual(mockResponseData);
    });
});
