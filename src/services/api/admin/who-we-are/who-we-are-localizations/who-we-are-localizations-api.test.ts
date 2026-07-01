import { WhoWeAreLocalizationsApi } from './who-we-are-localizations-api';
import { API_ROUTES } from '@/const/common/api-routes/main-api';
import { ContentLocalizationDto, CreateContentLocalizationDto } from '@/types/admin/who-we-are';
import { TranslationStatus } from '@/types/common/language';
import { SectionType } from '@/types/common/about-us';

describe('WhoWeAreLocalizationsApi.create', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    const createPayload = (): CreateContentLocalizationDto[] => [
        {
            entityId: 10,
            languageId: 1,
            title: 'Заголовок',
            description: 'Опис',
        },
        {
            entityId: 10,
            languageId: 2,
            title: 'Title',
            description: 'Description',
        },
    ];

    const createResponseData = (): ContentLocalizationDto[] => [
        {
            entityId: 10,
            title: 'Заголовок',
            description: 'Опис',
            localizationInfoDto: {
                id: 1,
                code: 'uk',
            },
            translationStatus: TranslationStatus.Relevant,
        },
        {
            entityId: 10,
            title: 'Title',
            description: 'Description',
            localizationInfoDto: {
                id: 2,
                code: 'en',
            },
            translationStatus: TranslationStatus.Relevant,
        },
    ];

    it('should call client.post with correct url and payload and return response data', async () => {
        const mockClient = {
            post: jest.fn(),
        };

        const sectionType = SectionType.Main;
        const payload = createPayload();
        const mockResponseData = createResponseData();

        mockClient.post.mockResolvedValueOnce({
            data: mockResponseData,
        });

        const result = await WhoWeAreLocalizationsApi.create(mockClient as any, sectionType, payload);

        expect(mockClient.post).toHaveBeenCalledTimes(1);
        expect(mockClient.post).toHaveBeenCalledWith(
            `${API_ROUTES.WHO_WE_ARE_CONTENT_LOCALIZATIONS.BASE}/${sectionType}`,
            payload,
        );
        expect(result).toEqual(mockResponseData);
    });
});

describe('WhoWeAreLocalizationsApi.update', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    const updatePayload = (): any[] => [
        {
            entityId: 10,
            languageId: 1,
            title: 'Заголовок Update',
            description: 'Опис Update',
        },
    ];

    const updateResponseData = (): ContentLocalizationDto[] => [
        {
            entityId: 10,
            title: 'Заголовок Update',
            description: 'Опис Update',
            localizationInfoDto: {
                id: 1,
                code: 'uk',
            },
            translationStatus: TranslationStatus.Relevant,
        },
    ];

    it('should call client.put with correct url and payload and return response data', async () => {
        const mockClient = {
            put: jest.fn(),
        };

        const sectionType = SectionType.WhatWeDo;
        const payload = updatePayload();
        const mockResponseData = updateResponseData();

        mockClient.put.mockResolvedValueOnce({
            data: mockResponseData,
        });

        const result = await WhoWeAreLocalizationsApi.update(mockClient as any, sectionType, payload);

        expect(mockClient.put).toHaveBeenCalledTimes(1);
        expect(mockClient.put).toHaveBeenCalledWith(
            `${API_ROUTES.WHO_WE_ARE_CONTENT_LOCALIZATIONS.BASE}/${sectionType}`,
            payload,
        );
        expect(result).toEqual(mockResponseData);
    });
});
