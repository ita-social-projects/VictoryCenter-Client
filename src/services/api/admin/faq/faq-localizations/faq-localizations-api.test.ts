import { FaqLocalizationsApi } from './faq-localizations-api';
import { API_ROUTES } from '@/const/common/api-routes/main-api';
import { CreateFaqLocalizationDto, FaqLocalizationDto, UpdateFaqLocalizationDto } from '@/types/admin/faq';
import { LocalizationInfo, TranslationStatus } from '@/types/common/language';

describe('FaqLocalizationsApi.create', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should call client.post with correct url and payload and return response data', async () => {
        const mockClient = {
            post: jest.fn(),
        };

        const payload: CreateFaqLocalizationDto = {
            entityId: 1,
            languageId: 2,
            questionText: 'What is FAQ?',
            answerText: 'Frequently Asked Questions',
        };

        const mockResponseData: FaqLocalizationDto = {
            entityId: 1,
            questionText: 'What is FAQ?',
            answerText: 'Frequently Asked Questions',
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

        const result = await FaqLocalizationsApi.create(mockClient as any, payload);

        expect(mockClient.post).toHaveBeenCalledTimes(1);
        expect(mockClient.post).toHaveBeenCalledWith(API_ROUTES.FAQ_LOCALIZATIONS.BASE, payload);
        expect(result).toEqual(mockResponseData);
    });
});

describe('FaqLocalizationsApi.update', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should call client.put with correct url and payload and return response data', async () => {
        const mockClient = {
            put: jest.fn(),
        };

        const entityId = 1;
        const languageId = 2;

        const payload: UpdateFaqLocalizationDto = {
            questionText: 'Updated question?',
            answerText: 'Updated answer',
        };

        const mockResponseData: FaqLocalizationDto = {
            entityId,
            questionText: 'Updated question?',
            answerText: 'Updated answer',
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

        const result = await FaqLocalizationsApi.update(mockClient as any, entityId, languageId, payload);

        expect(mockClient.put).toHaveBeenCalledTimes(1);
        expect(mockClient.put).toHaveBeenCalledWith(
            `${API_ROUTES.FAQ_LOCALIZATIONS.BASE}/${entityId}/${languageId}`,
            payload,
        );
        expect(result).toEqual(mockResponseData);
    });
});
