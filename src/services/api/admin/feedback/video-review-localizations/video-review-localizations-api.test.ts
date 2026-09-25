import { VideoReviewLocalizationsApi } from './video-review-localizations-api';
import { API_ROUTES } from '@/const/common/api-routes/main-api';
import {
    CreateFeedbackVideoLocalizationDto,
    FeedbackVideoLocalizationDto,
    UpdateFeedbackVideoLocalizationDto,
} from '@/types/admin/feedback';
import { LocalizationInfo, TranslationStatus } from '@/types/common/language';

describe('VideoReviewLocalizationsApi.create', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should call client.post with correct url and payload and return response data', async () => {
        const mockClient = { post: jest.fn() };

        const payload: CreateFeedbackVideoLocalizationDto = {
            entityId: 1,
            languageId: 2,
            title: 'Title',
        };

        const mockResponseData: FeedbackVideoLocalizationDto = {
            entityId: 1,
            title: 'Title',
            localizationInfoDto: { id: 2, code: 'en', name: 'English' } as LocalizationInfo,
            translationStatus: TranslationStatus.Relevant,
        };

        mockClient.post.mockResolvedValueOnce({ data: mockResponseData });

        const result = await VideoReviewLocalizationsApi.create(mockClient as any, payload);

        expect(mockClient.post).toHaveBeenCalledTimes(1);
        expect(mockClient.post).toHaveBeenCalledWith(API_ROUTES.VIDEO_REVIEW_LOCALIZATIONS.BASE, payload);
        expect(result).toEqual(mockResponseData);
    });
});

describe('VideoReviewLocalizationsApi.update', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should call client.put with correct url and payload and return response data', async () => {
        const mockClient = { put: jest.fn() };
        const entityId = 1;
        const languageId = 2;

        const payload: UpdateFeedbackVideoLocalizationDto = {
            title: 'Updated title',
        };

        const mockResponseData: FeedbackVideoLocalizationDto = {
            entityId,
            title: 'Updated title',
            localizationInfoDto: { id: languageId, code: 'en', name: 'English' } as LocalizationInfo,
            translationStatus: TranslationStatus.Relevant,
        };

        mockClient.put.mockResolvedValueOnce({ data: mockResponseData });

        const result = await VideoReviewLocalizationsApi.update(mockClient as any, entityId, languageId, payload);

        expect(mockClient.put).toHaveBeenCalledTimes(1);
        expect(mockClient.put).toHaveBeenCalledWith(
            `${API_ROUTES.VIDEO_REVIEW_LOCALIZATIONS.BASE}/${entityId}/${languageId}`,
            payload,
        );
        expect(result).toEqual(mockResponseData);
    });
});
