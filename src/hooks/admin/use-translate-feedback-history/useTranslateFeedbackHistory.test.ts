import { renderHook, act, waitFor } from '@testing-library/react';
import { useTranslateFeedbackHistory } from './useTranslateFeedbackHistory';
import { FeedbackHistoryLocalizationsApi } from '@/services/api/admin/feedback/feedback-history-localizations/feedback-history-localizations-api';
import { mapLocalizationDtoToModel } from '@/utils/functions/mappers/common/localization/localization-mappers';
import { FEEDBACK_TEXT } from '@/const/admin/feedback';
import { LocalizationLanguage } from '@/types/common/language';
import { FeedbackHistoryDto, FeedbackHistoryLocalization } from '@/types/admin/feedback';
import { ModalMode } from '@/types/admin/common';
import { VisibilityStatus } from '@/types/admin/common';

jest.mock('@/services/api/admin/feedback/feedback-history-localizations/feedback-history-localizations-api');
jest.mock('@/utils/functions/mappers/common/localization/localization-mappers');
jest.mock('../use-admin-client/useAdminClient', () => ({
    useAdminClient: () => ({ post: jest.fn() }),
}));

const mockedCreate = FeedbackHistoryLocalizationsApi.create as jest.MockedFunction<
    typeof FeedbackHistoryLocalizationsApi.create
>;
const mockedUpdate = FeedbackHistoryLocalizationsApi.update as jest.MockedFunction<
    typeof FeedbackHistoryLocalizationsApi.update
>;
const mockedMapper = mapLocalizationDtoToModel as jest.MockedFunction<typeof mapLocalizationDtoToModel>;

const historyMock: FeedbackHistoryDto = {
    id: 1,
    title: 'Original title',
    story: 'Original story',
    image: null,
    status: VisibilityStatus.Published,
    priority: 0,
    localizations: [],
};

const languageMock: LocalizationLanguage = { id: 2, code: 'en', name: 'English' };

const formValues = { title: 'Translated title', story: 'Translated story' };

const localizationDtoMock = {
    entityId: 1,
    localizationInfoDto: { id: 2, code: 'en' },
    title: 'Translated title',
    story: 'Translated story',
    translationStatus: 1,
};

const localizationModelMock: FeedbackHistoryLocalization = {
    title: 'Translated title',
    story: 'Translated story',
    language: { id: 2, code: 'en' },
    translationStatus: 1,
};

describe('useTranslateFeedbackHistory', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should initialize with default state', () => {
        const { result } = renderHook(() =>
            useTranslateFeedbackHistory({
                history: historyMock,
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
            useTranslateFeedbackHistory({
                history: historyMock,
                language: languageMock,
                onSuccess,
                mode: ModalMode.Add,
            }),
        );

        await act(async () => {
            await result.current.translateHistory(formValues);
        });

        expect(mockedCreate).toHaveBeenCalledWith(expect.anything(), {
            entityId: 1,
            languageId: 2,
            title: formValues.title,
            story: formValues.story,
        });
        expect(onSuccess).toHaveBeenCalledWith({ ...historyMock, localizations: [localizationModelMock] });
        expect(result.current.isSubmitting).toBe(false);
    });

    it('should update translation successfully in edit mode', async () => {
        const onSuccess = jest.fn();
        mockedUpdate.mockResolvedValue(localizationDtoMock as any);
        mockedMapper.mockReturnValue(localizationModelMock);

        const historyWithLocalization: FeedbackHistoryDto = {
            ...historyMock,
            localizations: [{ ...localizationModelMock, language: languageMock }],
        };

        const { result } = renderHook(() =>
            useTranslateFeedbackHistory({
                history: historyWithLocalization,
                language: languageMock,
                onSuccess,
                mode: ModalMode.Edit,
            }),
        );

        await act(async () => {
            await result.current.translateHistory(formValues);
        });

        expect(mockedUpdate).toHaveBeenCalledWith(expect.anything(), historyMock.id, languageMock.id, {
            title: formValues.title,
            story: formValues.story,
        });
        expect(onSuccess).toHaveBeenCalledWith({ ...historyWithLocalization, localizations: [localizationModelMock] });
    });

    it('should keep other-language localizations untouched when updating one language', async () => {
        const onSuccess = jest.fn();
        mockedUpdate.mockResolvedValue(localizationDtoMock as any);
        mockedMapper.mockReturnValue(localizationModelMock);

        const otherLocalization: FeedbackHistoryLocalization = {
            title: 'Titre',
            story: 'Histoire',
            language: { id: 3, code: 'fr' },
            translationStatus: 1,
        };

        const historyWithMultipleLocalizations: FeedbackHistoryDto = {
            ...historyMock,
            localizations: [otherLocalization, { ...localizationModelMock, language: languageMock }],
        };

        const { result } = renderHook(() =>
            useTranslateFeedbackHistory({
                history: historyWithMultipleLocalizations,
                language: languageMock,
                onSuccess,
                mode: ModalMode.Edit,
            }),
        );

        await act(async () => {
            await result.current.translateHistory(formValues);
        });

        expect(onSuccess).toHaveBeenCalledWith({
            ...historyWithMultipleLocalizations,
            localizations: [otherLocalization, localizationModelMock],
        });
    });

    it('should create translation when history has no localizations array', async () => {
        const onSuccess = jest.fn();
        mockedCreate.mockResolvedValue(localizationDtoMock as any);
        mockedMapper.mockReturnValue(localizationModelMock);

        const historyWithoutLocalizations = {
            ...historyMock,
            localizations: undefined,
        } as unknown as FeedbackHistoryDto;

        const { result } = renderHook(() =>
            useTranslateFeedbackHistory({
                history: historyWithoutLocalizations,
                language: languageMock,
                onSuccess,
                mode: ModalMode.Add,
            }),
        );

        await act(async () => {
            await result.current.translateHistory(formValues);
        });

        expect(onSuccess).toHaveBeenCalledWith({
            ...historyWithoutLocalizations,
            localizations: [localizationModelMock],
        });
    });

    it('should update translation when history has no localizations array', async () => {
        const onSuccess = jest.fn();
        mockedUpdate.mockResolvedValue(localizationDtoMock as any);
        mockedMapper.mockReturnValue(localizationModelMock);

        const historyWithoutLocalizations = {
            ...historyMock,
            localizations: undefined,
        } as unknown as FeedbackHistoryDto;

        const { result } = renderHook(() =>
            useTranslateFeedbackHistory({
                history: historyWithoutLocalizations,
                language: languageMock,
                onSuccess,
                mode: ModalMode.Edit,
            }),
        );

        await act(async () => {
            await result.current.translateHistory(formValues);
        });

        expect(onSuccess).toHaveBeenCalledWith({ ...historyWithoutLocalizations, localizations: [] });
    });

    it('should set error when translation fails', async () => {
        const onSuccess = jest.fn();
        mockedCreate.mockRejectedValue(new Error('API error'));

        const { result } = renderHook(() =>
            useTranslateFeedbackHistory({
                history: historyMock,
                language: languageMock,
                onSuccess,
                mode: ModalMode.Add,
            }),
        );

        await act(async () => {
            try {
                await result.current.translateHistory(formValues);
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
            useTranslateFeedbackHistory({
                history: historyMock,
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

    it('should do nothing if history is null', async () => {
        const onSuccess = jest.fn();

        const { result } = renderHook(() =>
            useTranslateFeedbackHistory({ history: null, language: languageMock, onSuccess, mode: ModalMode.Add }),
        );

        await act(async () => {
            await result.current.translateHistory(formValues);
        });

        expect(mockedCreate).not.toHaveBeenCalled();
        expect(onSuccess).not.toHaveBeenCalled();
    });
});
