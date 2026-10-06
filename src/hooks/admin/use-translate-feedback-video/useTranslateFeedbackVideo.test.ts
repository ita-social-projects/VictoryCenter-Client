import { renderHook, act, waitFor } from '@testing-library/react';
import { useTranslateFeedbackVideo } from './useTranslateFeedbackVideo';
import { VideoReviewLocalizationsApi } from '@/services/api/admin/feedback/video-review-localizations/video-review-localizations-api';
import { mapLocalizationDtoToModel } from '@/utils/functions/mappers/common/localization/localization-mappers';
import { FEEDBACK_TEXT } from '@/const/admin/feedback';
import { LocalizationLanguage } from '@/types/common/language';
import { FeedbackVideoDto, FeedbackVideoLocalization } from '@/types/admin/feedback';
import { ModalMode } from '@/types/admin/common';
import { VisibilityStatus } from '@/types/admin/common';

jest.mock('@/services/api/admin/feedback/video-review-localizations/video-review-localizations-api');
jest.mock('@/utils/functions/mappers/common/localization/localization-mappers');
jest.mock('../use-admin-client/useAdminClient', () => ({
    useAdminClient: () => ({ post: jest.fn() }),
}));

const mockedCreate = VideoReviewLocalizationsApi.create as jest.MockedFunction<
    typeof VideoReviewLocalizationsApi.create
>;
const mockedUpdate = VideoReviewLocalizationsApi.update as jest.MockedFunction<
    typeof VideoReviewLocalizationsApi.update
>;
const mockedMapper = mapLocalizationDtoToModel as jest.MockedFunction<typeof mapLocalizationDtoToModel>;

const videoMock: FeedbackVideoDto = {
    id: 1,
    title: 'Original title',
    link: 'https://youtube.com/watch?v=1',
    status: VisibilityStatus.Published,
    priority: 0,
    localizations: [],
};

const languageMock: LocalizationLanguage = { id: 2, code: 'en', name: 'English' };

const formValues = { title: 'Translated title' };

const localizationDtoMock = {
    entityId: 1,
    localizationInfoDto: { id: 2, code: 'en' },
    title: 'Translated title',
    translationStatus: 1,
};

const localizationModelMock: FeedbackVideoLocalization = {
    title: 'Translated title',
    language: { id: 2, code: 'en' },
    translationStatus: 1,
};

describe('useTranslateFeedbackVideo', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should initialize with default state', () => {
        const { result } = renderHook(() =>
            useTranslateFeedbackVideo({
                video: videoMock,
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
            useTranslateFeedbackVideo({ video: videoMock, language: languageMock, onSuccess, mode: ModalMode.Add }),
        );

        await act(async () => {
            await result.current.translateVideo(formValues);
        });

        expect(mockedCreate).toHaveBeenCalledWith(expect.anything(), {
            entityId: 1,
            languageId: 2,
            title: formValues.title,
        });
        expect(onSuccess).toHaveBeenCalledWith({ ...videoMock, localizations: [localizationModelMock] });
    });

    it('should update translation successfully in edit mode', async () => {
        const onSuccess = jest.fn();
        mockedUpdate.mockResolvedValue(localizationDtoMock as any);
        mockedMapper.mockReturnValue(localizationModelMock);

        const videoWithLocalization: FeedbackVideoDto = {
            ...videoMock,
            localizations: [{ ...localizationModelMock, language: languageMock }],
        };

        const { result } = renderHook(() =>
            useTranslateFeedbackVideo({
                video: videoWithLocalization,
                language: languageMock,
                onSuccess,
                mode: ModalMode.Edit,
            }),
        );

        await act(async () => {
            await result.current.translateVideo(formValues);
        });

        expect(mockedUpdate).toHaveBeenCalledWith(expect.anything(), videoMock.id, languageMock.id, {
            title: formValues.title,
        });
        expect(onSuccess).toHaveBeenCalledWith({ ...videoWithLocalization, localizations: [localizationModelMock] });
    });

    it('should keep other-language localizations untouched when updating one language', async () => {
        const onSuccess = jest.fn();
        mockedUpdate.mockResolvedValue(localizationDtoMock as any);
        mockedMapper.mockReturnValue(localizationModelMock);

        const otherLocalization: FeedbackVideoLocalization = {
            title: 'Titre',
            language: { id: 3, code: 'fr' },
            translationStatus: 1,
        };

        const videoWithMultipleLocalizations: FeedbackVideoDto = {
            ...videoMock,
            localizations: [otherLocalization, { ...localizationModelMock, language: languageMock }],
        };

        const { result } = renderHook(() =>
            useTranslateFeedbackVideo({
                video: videoWithMultipleLocalizations,
                language: languageMock,
                onSuccess,
                mode: ModalMode.Edit,
            }),
        );

        await act(async () => {
            await result.current.translateVideo(formValues);
        });

        expect(onSuccess).toHaveBeenCalledWith({
            ...videoWithMultipleLocalizations,
            localizations: [otherLocalization, localizationModelMock],
        });
    });

    it('should create translation when video has no localizations array', async () => {
        const onSuccess = jest.fn();
        mockedCreate.mockResolvedValue(localizationDtoMock as any);
        mockedMapper.mockReturnValue(localizationModelMock);

        const videoWithoutLocalizations = { ...videoMock, localizations: undefined } as unknown as FeedbackVideoDto;

        const { result } = renderHook(() =>
            useTranslateFeedbackVideo({
                video: videoWithoutLocalizations,
                language: languageMock,
                onSuccess,
                mode: ModalMode.Add,
            }),
        );

        await act(async () => {
            await result.current.translateVideo(formValues);
        });

        expect(onSuccess).toHaveBeenCalledWith({
            ...videoWithoutLocalizations,
            localizations: [localizationModelMock],
        });
    });

    it('should update translation when video has no localizations array', async () => {
        const onSuccess = jest.fn();
        mockedUpdate.mockResolvedValue(localizationDtoMock as any);
        mockedMapper.mockReturnValue(localizationModelMock);

        const videoWithoutLocalizations = { ...videoMock, localizations: undefined } as unknown as FeedbackVideoDto;

        const { result } = renderHook(() =>
            useTranslateFeedbackVideo({
                video: videoWithoutLocalizations,
                language: languageMock,
                onSuccess,
                mode: ModalMode.Edit,
            }),
        );

        await act(async () => {
            await result.current.translateVideo(formValues);
        });

        expect(onSuccess).toHaveBeenCalledWith({ ...videoWithoutLocalizations, localizations: [] });
    });

    it('should set error when translation fails', async () => {
        const onSuccess = jest.fn();
        mockedCreate.mockRejectedValue(new Error('API error'));

        const { result } = renderHook(() =>
            useTranslateFeedbackVideo({ video: videoMock, language: languageMock, onSuccess, mode: ModalMode.Add }),
        );

        await act(async () => {
            try {
                await result.current.translateVideo(formValues);
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
            useTranslateFeedbackVideo({
                video: videoMock,
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

    it('should do nothing if video is null', async () => {
        const onSuccess = jest.fn();

        const { result } = renderHook(() =>
            useTranslateFeedbackVideo({ video: null, language: languageMock, onSuccess, mode: ModalMode.Add }),
        );

        await act(async () => {
            await result.current.translateVideo(formValues);
        });

        expect(mockedCreate).not.toHaveBeenCalled();
        expect(onSuccess).not.toHaveBeenCalled();
    });
});
