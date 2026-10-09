import { API_ROUTES } from '@/const/common/api-routes/main-api';
import {
    CreateHippotherapyPageLocalizationDto,
    HippotherapyPageLocalizationBlock,
    HippotherapyPageLocalizationDto,
    HippotherapyPageTranslationStatusDto,
    UpdateHippotherapyPageLocalizationDto,
} from '@/types/admin/hippotherapy-page';
import { LocalizationInfo, TranslationStatus } from '@/types/common/language';
import { HippotherapyPageLocalizationsApi } from './hippotherapy-page-localizations-api';

describe('HippotherapyPageLocalizationsApi', () => {
    const entityId = 1;
    const languageId = 2;
    const BASE = API_ROUTES.HIPPOTHERAPY_PAGE_LOCALIZATIONS.BASE;

    const responseData: HippotherapyPageLocalizationDto = {
        entityId,
        translationStatus: TranslationStatus.Relevant,
        localizationInfoDto: { id: languageId, code: 'en', name: 'English' } as LocalizationInfo,
        introSection: { title: 'Intro title', description: 'Intro description' },
        descriptionSection: null,
        quoteSection: { quoteText: 'Quote', authorName: 'Author' },
        hippoventionSection: null,
        hippoventionCenterSection: null,
        advantagesSection: null,
        analysisSection: null,
        scientificReferencesSection: null,
        anotherQuoteSection: null,
        participantsSection: null,
        ethicsSection: null,
    };

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('gets localization by language id', async () => {
        const mockClient = {
            get: jest.fn().mockResolvedValueOnce({ data: responseData }),
        };

        const result = await HippotherapyPageLocalizationsApi.getByLanguageId(
            mockClient as any,
            entityId,
            languageId,
        );

        expect(mockClient.get).toHaveBeenCalledWith(`${BASE}/${entityId}/${languageId}`);
        expect(result).toEqual(responseData);
    });

    it('gets translation statuses', async () => {
        const statuses: HippotherapyPageTranslationStatusDto[] = [
            {
                block: HippotherapyPageLocalizationBlock.Intro,
                entityId,
                languageId,
                translationStatus: TranslationStatus.Outdated,
            },
        ];
        const mockClient = {
            get: jest.fn().mockResolvedValueOnce({ data: statuses }),
        };

        const result = await HippotherapyPageLocalizationsApi.getStatuses(mockClient as any, entityId, languageId);

        expect(mockClient.get).toHaveBeenCalledWith(`${BASE}/${entityId}/${languageId}/statuses`);
        expect(result).toEqual(statuses);
    });

    it('creates localization', async () => {
        const payload: CreateHippotherapyPageLocalizationDto = {
            entityId,
            languageId,
            introSection: { title: 'Intro title', description: 'Intro description' },
            quoteSection: { quoteText: 'Quote', authorName: 'Author' },
        };
        const mockClient = {
            post: jest.fn().mockResolvedValueOnce({ data: responseData }),
        };

        const result = await HippotherapyPageLocalizationsApi.create(mockClient as any, payload);

        expect(mockClient.post).toHaveBeenCalledWith(BASE, payload);
        expect(result).toEqual(responseData);
    });

    it('updates localization', async () => {
        const payload: UpdateHippotherapyPageLocalizationDto = {
            introSection: { title: 'Updated title', description: 'Updated description' },
            ethicsSection: {
                title: 'Ethics',
                description: 'Ethics description',
                principles: ['Principle 1', 'Principle 2'],
            },
        };
        const mockClient = {
            put: jest.fn().mockResolvedValueOnce({ data: responseData }),
        };

        const result = await HippotherapyPageLocalizationsApi.update(
            mockClient as any,
            entityId,
            languageId,
            payload,
        );

        expect(mockClient.put).toHaveBeenCalledWith(`${BASE}/${entityId}/${languageId}`, payload);
        expect(result).toEqual(responseData);
    });
});