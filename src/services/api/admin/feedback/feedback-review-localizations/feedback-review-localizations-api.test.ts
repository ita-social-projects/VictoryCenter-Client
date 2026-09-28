import { FeedbackReviewLocalizationsApi } from './feedback-review-localizations-api';
import { API_ROUTES } from '@/const/common/api-routes/main-api';
import {
    CreateFeedbackReviewLocalizationDto,
    FeedbackReviewLocalizationDto,
    UpdateFeedbackReviewLocalizationDto,
} from '@/types/admin/feedback';
import { LocalizationInfo, TranslationStatus } from '@/types/common/language';

describe('FeedbackReviewLocalizationsApi.create', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should call client.post with correct url and payload and return response data', async () => {
        const mockClient = { post: jest.fn() };

        const payload: CreateFeedbackReviewLocalizationDto = {
            entityId: 1,
            languageId: 2,
            authorName: 'John Doe',
            text: 'Great service',
        };

        const mockResponseData: FeedbackReviewLocalizationDto = {
            entityId: 1,
            authorName: 'John Doe',
            text: 'Great service',
            localizationInfoDto: { id: 2, code: 'en', name: 'English' } as LocalizationInfo,
            translationStatus: TranslationStatus.Relevant,
        };

        mockClient.post.mockResolvedValueOnce({ data: mockResponseData });

        const result = await FeedbackReviewLocalizationsApi.create(mockClient as any, payload);

        expect(mockClient.post).toHaveBeenCalledTimes(1);
        expect(mockClient.post).toHaveBeenCalledWith(API_ROUTES.FEEDBACK_REVIEW_LOCALIZATIONS.BASE, payload);
        expect(result).toEqual(mockResponseData);
    });
});

describe('FeedbackReviewLocalizationsApi.update', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should call client.put with correct url and payload and return response data', async () => {
        const mockClient = { put: jest.fn() };
        const entityId = 1;
        const languageId = 2;

        const payload: UpdateFeedbackReviewLocalizationDto = {
            authorName: 'Updated name',
            text: 'Updated text',
        };

        const mockResponseData: FeedbackReviewLocalizationDto = {
            entityId,
            authorName: 'Updated name',
            text: 'Updated text',
            localizationInfoDto: { id: languageId, code: 'en', name: 'English' } as LocalizationInfo,
            translationStatus: TranslationStatus.Relevant,
        };

        mockClient.put.mockResolvedValueOnce({ data: mockResponseData });

        const result = await FeedbackReviewLocalizationsApi.update(mockClient as any, entityId, languageId, payload);

        expect(mockClient.put).toHaveBeenCalledTimes(1);
        expect(mockClient.put).toHaveBeenCalledWith(
            `${API_ROUTES.FEEDBACK_REVIEW_LOCALIZATIONS.BASE}/${entityId}/${languageId}`,
            payload,
        );
        expect(result).toEqual(mockResponseData);
    });
});
