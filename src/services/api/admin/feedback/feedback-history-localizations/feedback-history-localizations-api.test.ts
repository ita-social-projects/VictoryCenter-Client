import { FeedbackHistoryLocalizationsApi } from './feedback-history-localizations-api';
import { API_ROUTES } from '@/const/common/api-routes/main-api';
import {
    CreateFeedbackHistoryLocalizationDto,
    FeedbackHistoryLocalizationDto,
    UpdateFeedbackHistoryLocalizationDto,
} from '@/types/admin/feedback';
import { LocalizationInfo, TranslationStatus } from '@/types/common/language';

describe('FeedbackHistoryLocalizationsApi.create', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should call client.post with correct url and payload and return response data', async () => {
        const mockClient = { post: jest.fn() };

        const payload: CreateFeedbackHistoryLocalizationDto = {
            entityId: 1,
            languageId: 2,
            title: 'Title',
            story: 'Story',
        };

        const mockResponseData: FeedbackHistoryLocalizationDto = {
            entityId: 1,
            title: 'Title',
            story: 'Story',
            localizationInfoDto: { id: 2, code: 'en', name: 'English' } as LocalizationInfo,
            translationStatus: TranslationStatus.Relevant,
        };

        mockClient.post.mockResolvedValueOnce({ data: mockResponseData });

        const result = await FeedbackHistoryLocalizationsApi.create(mockClient as any, payload);

        expect(mockClient.post).toHaveBeenCalledTimes(1);
        expect(mockClient.post).toHaveBeenCalledWith(API_ROUTES.FEEDBACK_HISTORY_LOCALIZATIONS.BASE, payload);
        expect(result).toEqual(mockResponseData);
    });
});

describe('FeedbackHistoryLocalizationsApi.update', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should call client.put with correct url and payload and return response data', async () => {
        const mockClient = { put: jest.fn() };
        const entityId = 1;
        const languageId = 2;

        const payload: UpdateFeedbackHistoryLocalizationDto = {
            title: 'Updated title',
            story: 'Updated story',
        };

        const mockResponseData: FeedbackHistoryLocalizationDto = {
            entityId,
            title: 'Updated title',
            story: 'Updated story',
            localizationInfoDto: { id: languageId, code: 'en', name: 'English' } as LocalizationInfo,
            translationStatus: TranslationStatus.Relevant,
        };

        mockClient.put.mockResolvedValueOnce({ data: mockResponseData });

        const result = await FeedbackHistoryLocalizationsApi.update(mockClient as any, entityId, languageId, payload);

        expect(mockClient.put).toHaveBeenCalledTimes(1);
        expect(mockClient.put).toHaveBeenCalledWith(
            `${API_ROUTES.FEEDBACK_HISTORY_LOCALIZATIONS.BASE}/${entityId}/${languageId}`,
            payload,
        );
        expect(result).toEqual(mockResponseData);
    });
});
