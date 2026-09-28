import { renderHook, act, waitFor } from '@testing-library/react';
import { useTranslateFeedbackReview } from './useTranslateFeedbackReview';
import { FeedbackReviewLocalizationsApi } from '@/services/api/admin/feedback/feedback-review-localizations/feedback-review-localizations-api';
import { mapLocalizationDtoToModel } from '@/utils/functions/mappers/common/localization/localization-mappers';
import { FEEDBACK_TEXT } from '@/const/admin/feedback';
import { LocalizationLanguage } from '@/types/common/language';
import { FeedbackReviewDto, FeedbackReviewLocalization } from '@/types/admin/feedback';
import { ModalMode } from '@/types/admin/common';
import { VisibilityStatus } from '@/types/admin/common';

jest.mock('@/services/api/admin/feedback/feedback-review-localizations/feedback-review-localizations-api');
jest.mock('@/utils/functions/mappers/common/localization/localization-mappers');
jest.mock('../use-admin-client/useAdminClient', () => ({
    useAdminClient: () => ({ post: jest.fn() }),
}));

const mockedCreate = FeedbackReviewLocalizationsApi.create as jest.MockedFunction<
    typeof FeedbackReviewLocalizationsApi.create
>;
const mockedUpdate = FeedbackReviewLocalizationsApi.update as jest.MockedFunction<
    typeof FeedbackReviewLocalizationsApi.update
>;
const mockedMapper = mapLocalizationDtoToModel as jest.MockedFunction<typeof mapLocalizationDtoToModel>;

const reviewMock: FeedbackReviewDto = {
    id: 1,
    authorName: 'Original name',
    text: 'Original text',
    status: VisibilityStatus.Published,
    priority: 0,
    localizations: [],
};

const languageMock: LocalizationLanguage = { id: 2, code: 'en', name: 'English' };

const formValues = { authorName: 'Translated name', text: 'Translated text' };

const localizationDtoMock = {
    entityId: 1,
    localizationInfoDto: { id: 2, code: 'en' },
    authorName: 'Translated name',
    text: 'Translated text',
    translationStatus: 1,
};

const localizationModelMock: FeedbackReviewLocalization = {
    authorName: 'Translated name',
    text: 'Translated text',
    language: { id: 2, code: 'en' },
    translationStatus: 1,
};

describe('useTranslateFeedbackReview', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should initialize with default state', () => {
        const { result } = renderHook(() =>
            useTranslateFeedbackReview({
                review: reviewMock,
                language: languageMock,
                onSuccess: jest.fn(),
                mode: ModalMode.Add,
            }),
        );

        expect(result.current.isSubmitting).toBe(false);
        expect(result.current.error).toBe('');
    });

    it('should create translation successfully in add mode', async () => {
        const onSuccess = jest.fn();
        mockedCreate.mockResolvedValue(localizationDtoMock as any);
        mockedMapper.mockReturnValue(localizationModelMock);

        const { result } = renderHook(() =>
            useTranslateFeedbackReview({ review: reviewMock, language: languageMock, onSuccess, mode: ModalMode.Add }),
        );

        await act(async () => {
            await result.current.translateReview(formValues);
        });

        expect(mockedCreate).toHaveBeenCalledWith(expect.anything(), {
            entityId: 1,
            languageId: 2,
            authorName: formValues.authorName,
            text: formValues.text,
        });
        expect(onSuccess).toHaveBeenCalledWith({ ...reviewMock, localizations: [localizationModelMock] });
    });

    it('should update translation successfully in edit mode', async () => {
        const onSuccess = jest.fn();
        mockedUpdate.mockResolvedValue(localizationDtoMock as any);
        mockedMapper.mockReturnValue(localizationModelMock);

        const reviewWithLocalization: FeedbackReviewDto = {
            ...reviewMock,
            localizations: [{ ...localizationModelMock, language: languageMock }],
        };

        const { result } = renderHook(() =>
            useTranslateFeedbackReview({
                review: reviewWithLocalization,
                language: languageMock,
                onSuccess,
                mode: ModalMode.Edit,
            }),
        );

        await act(async () => {
            await result.current.translateReview(formValues);
        });

        expect(mockedUpdate).toHaveBeenCalledWith(expect.anything(), reviewMock.id, languageMock.id, {
            authorName: formValues.authorName,
            text: formValues.text,
        });
        expect(onSuccess).toHaveBeenCalledWith({ ...reviewWithLocalization, localizations: [localizationModelMock] });
    });

    it('should keep other-language localizations untouched when updating one language', async () => {
        const onSuccess = jest.fn();
        mockedUpdate.mockResolvedValue(localizationDtoMock as any);
        mockedMapper.mockReturnValue(localizationModelMock);

        const otherLocalization: FeedbackReviewLocalization = {
            authorName: 'Nom',
            text: 'Texte',
            language: { id: 3, code: 'fr' },
            translationStatus: 1,
        };

        const reviewWithMultipleLocalizations: FeedbackReviewDto = {
            ...reviewMock,
            localizations: [otherLocalization, { ...localizationModelMock, language: languageMock }],
        };

        const { result } = renderHook(() =>
            useTranslateFeedbackReview({
                review: reviewWithMultipleLocalizations,
                language: languageMock,
                onSuccess,
                mode: ModalMode.Edit,
            }),
        );

        await act(async () => {
            await result.current.translateReview(formValues);
        });

        expect(onSuccess).toHaveBeenCalledWith({
            ...reviewWithMultipleLocalizations,
            localizations: [otherLocalization, localizationModelMock],
        });
    });

    it('should create translation when review has no localizations array', async () => {
        const onSuccess = jest.fn();
        mockedCreate.mockResolvedValue(localizationDtoMock as any);
        mockedMapper.mockReturnValue(localizationModelMock);

        const reviewWithoutLocalizations = { ...reviewMock, localizations: undefined } as unknown as FeedbackReviewDto;

        const { result } = renderHook(() =>
            useTranslateFeedbackReview({
                review: reviewWithoutLocalizations,
                language: languageMock,
                onSuccess,
                mode: ModalMode.Add,
            }),
        );

        await act(async () => {
            await result.current.translateReview(formValues);
        });

        expect(onSuccess).toHaveBeenCalledWith({
            ...reviewWithoutLocalizations,
            localizations: [localizationModelMock],
        });
    });

    it('should update translation when review has no localizations array', async () => {
        const onSuccess = jest.fn();
        mockedUpdate.mockResolvedValue(localizationDtoMock as any);
        mockedMapper.mockReturnValue(localizationModelMock);

        const reviewWithoutLocalizations = { ...reviewMock, localizations: undefined } as unknown as FeedbackReviewDto;

        const { result } = renderHook(() =>
            useTranslateFeedbackReview({
                review: reviewWithoutLocalizations,
                language: languageMock,
                onSuccess,
                mode: ModalMode.Edit,
            }),
        );

        await act(async () => {
            await result.current.translateReview(formValues);
        });

        expect(onSuccess).toHaveBeenCalledWith({ ...reviewWithoutLocalizations, localizations: [] });
    });

    it('should set error when translation fails', async () => {
        const onSuccess = jest.fn();
        mockedCreate.mockRejectedValue(new Error('API error'));

        const { result } = renderHook(() =>
            useTranslateFeedbackReview({ review: reviewMock, language: languageMock, onSuccess, mode: ModalMode.Add }),
        );

        await act(async () => {
            try {
                await result.current.translateReview(formValues);
            } catch {
                // ignored for test
            }
        });

        await waitFor(() => {
            expect(result.current.error).toBe(FEEDBACK_TEXT.MESSAGE.FAIL_TO_TRANSLATE);
        });
        expect(onSuccess).not.toHaveBeenCalled();
    });

    it('should clear error', () => {
        const { result } = renderHook(() =>
            useTranslateFeedbackReview({
                review: reviewMock,
                language: languageMock,
                onSuccess: jest.fn(),
                mode: ModalMode.Add,
            }),
        );

        act(() => {
            result.current.clearError();
        });

        expect(result.current.error).toBe('');
    });

    it('should do nothing if review is null', async () => {
        const onSuccess = jest.fn();

        const { result } = renderHook(() =>
            useTranslateFeedbackReview({ review: null, language: languageMock, onSuccess, mode: ModalMode.Add }),
        );

        await act(async () => {
            await result.current.translateReview(formValues);
        });

        expect(mockedCreate).not.toHaveBeenCalled();
        expect(onSuccess).not.toHaveBeenCalled();
    });
});
