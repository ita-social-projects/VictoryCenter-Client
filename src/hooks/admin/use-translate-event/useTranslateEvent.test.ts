import { renderHook, act, waitFor } from '@testing-library/react';
import { useTranslateEvent } from './useTranslateEvent';
import { EventLocalizationsApi } from '@/services/api/admin/events/event-localizations/event-localizations-api';
import { mapLocalizationDtoToModel } from '@/utils/functions/mappers/common/localization/localization-mappers';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { LocalizationLanguage, TranslationStatus } from '@/types/common/language';
import { EventItemDto, EventLocalization } from '@/types/admin/events';
import { ModalMode, VisibilityStatus } from '@/types/admin/common';

jest.mock('@/services/api/admin/events/event-localizations/event-localizations-api');
jest.mock('@/utils/functions/mappers/common/localization/localization-mappers');
jest.mock('../use-admin-client/useAdminClient', () => ({
    useAdminClient: () => ({ post: jest.fn(), put: jest.fn() }),
}));

const mockedCreate = EventLocalizationsApi.create as jest.MockedFunction<typeof EventLocalizationsApi.create>;
const mockedUpdate = EventLocalizationsApi.update as jest.MockedFunction<typeof EventLocalizationsApi.update>;
const mockedMapper = mapLocalizationDtoToModel as jest.MockedFunction<typeof mapLocalizationDtoToModel>;

const eventMock: EventItemDto = {
    id: 1,
    title: 'Original title',
    description: 'Original description',
    additionalDescription: 'Original additional',
    resource: 'https://example.com',
    publishedAt: '2024-01-01',
    status: VisibilityStatus.Published,
    previewImage: null,
    backgroundImage: null,
    priority: 1,
    localizations: [],
};

const languageMock: LocalizationLanguage = {
    id: 2,
    code: 'en',
    name: 'English',
};

const formValues = {
    title: 'English Title',
    description: 'English Description',
    additionalDescription: 'Eng extra',
};

const localizationDtoMock = {
    entityId: 1,
    title: 'English Title',
    description: 'English Description',
    additionalDescription: 'Eng extra',
    localizationInfoDto: {
        id: 2,
        code: 'en',
    },
    translationStatus: TranslationStatus.Relevant,
};

const localizationModelMock: EventLocalization = {
    title: 'English Title',
    description: 'English Description',
    additionalDescription: 'Eng extra',
    language: {
        id: 2,
        code: 'en',
    },
    translationStatus: TranslationStatus.Relevant,
};

describe('useTranslateEvent', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should initialize with default state', () => {
        const { result } = renderHook(() =>
            useTranslateEvent({
                event: eventMock,
                language: languageMock,
                onSuccess: jest.fn(),
                mode: ModalMode.Add,
            }),
        );

        expect(result.current.isSubmitting).toBe(false);
        expect(result.current.error).toBe('');
    });

    it('should translate event successfully in Add mode', async () => {
        const onSuccess = jest.fn();

        mockedCreate.mockResolvedValue(localizationDtoMock as any);
        mockedMapper.mockReturnValue(localizationModelMock);

        const { result } = renderHook(() =>
            useTranslateEvent({
                event: eventMock,
                language: languageMock,
                onSuccess,
                mode: ModalMode.Add,
            }),
        );

        act(() => {
            result.current.translateEvent(formValues);
        });

        await waitFor(() => {
            expect(onSuccess).toHaveBeenCalled();
        });

        expect(mockedCreate).toHaveBeenCalledWith(expect.anything(), {
            entityId: 1,
            languageId: 2,
            title: 'English Title',
            description: 'English Description',
            additionalDescription: 'Eng extra',
        });

        expect(onSuccess).toHaveBeenCalledWith({
            ...eventMock,
            localizations: [localizationModelMock],
        });

        expect(result.current.isSubmitting).toBe(false);
        expect(result.current.error).toBe('');
    });

    it('should update translation successfully in Edit mode', async () => {
        const onSuccess = jest.fn();

        mockedUpdate.mockResolvedValue(localizationDtoMock as any);
        mockedMapper.mockReturnValue(localizationModelMock);

        const eventWithLocalization: EventItemDto = {
            ...eventMock,
            localizations: [
                {
                    ...localizationModelMock,
                    language: languageMock,
                },
            ],
        };

        const { result } = renderHook(() =>
            useTranslateEvent({
                event: eventWithLocalization,
                language: languageMock,
                onSuccess,
                mode: ModalMode.Edit,
            }),
        );

        await act(async () => {
            await result.current.translateEvent(formValues);
        });

        expect(mockedUpdate).toHaveBeenCalledWith(expect.anything(), eventMock.id, languageMock.id, {
            title: 'English Title',
            description: 'English Description',
            additionalDescription: 'Eng extra',
        });

        expect(onSuccess).toHaveBeenCalledWith({
            ...eventWithLocalization,
            localizations: [localizationModelMock],
        });
    });

    it('should set error when translation fails in Add mode', async () => {
        const onSuccess = jest.fn();

        mockedCreate.mockRejectedValue(new Error('API error'));

        const { result } = renderHook(() =>
            useTranslateEvent({
                event: eventMock,
                language: languageMock,
                onSuccess,
                mode: ModalMode.Add,
            }),
        );

        await act(async () => {
            try {
                await result.current.translateEvent(formValues);
            } catch {
                // Expected error
            }
        });

        await waitFor(() => {
            expect(result.current.error).toBe(COMMON_TEXT_ADMIN.MESSAGE.ERROR_TRY_AGAIN);
        });

        expect(onSuccess).not.toHaveBeenCalled();
        expect(result.current.isSubmitting).toBe(false);
    });

    it('should set error when translation fails in Edit mode', async () => {
        const onSuccess = jest.fn();

        mockedUpdate.mockRejectedValue(new Error('API error'));

        const { result } = renderHook(() =>
            useTranslateEvent({
                event: eventMock,
                language: languageMock,
                onSuccess,
                mode: ModalMode.Edit,
            }),
        );

        await act(async () => {
            try {
                await result.current.translateEvent(formValues);
            } catch {
                // Expected error
            }
        });

        await waitFor(() => {
            expect(result.current.error).toBe(COMMON_TEXT_ADMIN.MESSAGE.ERROR_TRY_AGAIN);
        });

        expect(onSuccess).not.toHaveBeenCalled();
        expect(result.current.isSubmitting).toBe(false);
    });

    it('should clear error', () => {
        const { result } = renderHook(() =>
            useTranslateEvent({
                event: eventMock,
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

    it('should do nothing if event is null', async () => {
        const onSuccess = jest.fn();

        const { result } = renderHook(() =>
            useTranslateEvent({
                event: null,
                language: languageMock,
                onSuccess,
                mode: ModalMode.Add,
            }),
        );

        await act(async () => {
            await result.current.translateEvent(formValues);
        });

        expect(mockedCreate).not.toHaveBeenCalled();
        expect(onSuccess).not.toHaveBeenCalled();
    });

    it('should do nothing if language is null', async () => {
        const onSuccess = jest.fn();

        const { result } = renderHook(() =>
            useTranslateEvent({
                event: eventMock,
                language: null,
                onSuccess,
                mode: ModalMode.Add,
            }),
        );

        await act(async () => {
            await result.current.translateEvent(formValues);
        });

        expect(mockedCreate).not.toHaveBeenCalled();
        expect(onSuccess).not.toHaveBeenCalled();
    });
});
