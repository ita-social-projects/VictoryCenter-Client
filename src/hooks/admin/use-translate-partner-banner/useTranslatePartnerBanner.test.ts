import { renderHook, act, waitFor } from '@testing-library/react';
import { useTranslatePartnerBanner } from './useTranslatePartnerBanner';
import { PartnerBannerLocalizationApi } from '@/services/api/admin/partners/partners-banner-localizations-api';
import { mapLocalizationDtoToModel } from '@/utils/functions/mappers/common/localization/localization-mappers';
import { PARTNERS_TEXT } from '@/const/admin/partners';
import { LocalizationLanguage } from '@/types/common/language';
import { PartnerBanner, PartnerBannerLocalization } from '@/types/admin/partners';
import { ModalMode } from '@/types/admin/common';

jest.mock('@/services/api/admin/partners/partners-banner-localizations-api');
jest.mock('@/utils/functions/mappers/common/localization/localization-mappers');
jest.mock('../use-admin-client/useAdminClient', () => ({
    useAdminClient: () => ({ post: jest.fn() }),
}));

const mockedCreate = PartnerBannerLocalizationApi.create as jest.MockedFunction<
    typeof PartnerBannerLocalizationApi.create
>;
const mockedUpdate = PartnerBannerLocalizationApi.update as jest.MockedFunction<
    typeof PartnerBannerLocalizationApi.update
>;
const mockedMapper = mapLocalizationDtoToModel as jest.MockedFunction<typeof mapLocalizationDtoToModel>;

const bannerMock: PartnerBanner = {
    id: 1,
    title: 'Original banner title',
    description: 'Original banner description',
    image: null,
    imageId: null,
    localizations: [],
};

const languageMock: LocalizationLanguage = {
    id: 2,
    code: 'en',
    name: 'English',
};

const formValues = {
    title: 'Translated banner title',
    description: 'Translated banner description',
};

const localizationDtoMock = {
    entityId: 1,
    localizationInfoDto: {
        id: 2,
        code: 'en',
    },
    title: 'Translated banner title',
    description: 'Translated banner description',
    translationStatus: 1,
};

const localizationModelMock: PartnerBannerLocalization = {
    title: 'Translated banner title',
    description: 'Translated banner description',
    language: {
        id: 2,
        code: 'en',
    },
    translationStatus: 1,
};

describe('useTranslatePartnerBanner', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should initialize with default state', () => {
        const { result } = renderHook(() =>
            useTranslatePartnerBanner({
                banner: bannerMock,
                language: languageMock,
                onSuccess: jest.fn(),
                mode: ModalMode.Add,
            }),
        );

        expect(result.current.isSubmitting).toBe(false);
        expect(result.current.error).toBe('');
    });

    it('should translate partner banner successfully', async () => {
        const onSuccess = jest.fn();

        mockedCreate.mockResolvedValue(localizationDtoMock as any);
        mockedMapper.mockReturnValue(localizationModelMock);

        const { result } = renderHook(() =>
            useTranslatePartnerBanner({
                banner: bannerMock,
                language: languageMock,
                onSuccess,
                mode: ModalMode.Add,
            }),
        );

        act(() => {
            result.current.translateBanner(formValues);
        });

        await waitFor(() => {
            expect(onSuccess).toHaveBeenCalled();
        });

        expect(mockedCreate).toHaveBeenCalledWith(expect.anything(), {
            entityId: 1,
            languageId: 2,
            title: formValues.title,
            description: formValues.description,
        });

        expect(onSuccess).toHaveBeenCalledWith({
            ...bannerMock,
            localizations: [localizationModelMock],
        });

        expect(result.current.isSubmitting).toBe(false);
        expect(result.current.error).toBe('');
    });

    it('should update translation successfully in edit mode', async () => {
        const onSuccess = jest.fn();

        mockedUpdate.mockResolvedValue(localizationDtoMock as any);
        mockedMapper.mockReturnValue(localizationModelMock);

        const bannerWithLocalization: PartnerBanner = {
            ...bannerMock,
            localizations: [
                {
                    ...localizationModelMock,
                    language: languageMock,
                },
            ],
        };

        const { result } = renderHook(() =>
            useTranslatePartnerBanner({
                banner: bannerWithLocalization,
                language: languageMock,
                onSuccess,
                mode: ModalMode.Edit,
            }),
        );

        await act(async () => {
            await result.current.translateBanner(formValues);
        });

        expect(mockedUpdate).toHaveBeenCalledWith(expect.anything(), bannerMock.id, languageMock.id, {
            title: formValues.title,
            description: formValues.description,
        });

        expect(onSuccess).toHaveBeenCalledWith({
            ...bannerWithLocalization,
            localizations: [localizationModelMock],
        });
    });

    it('should set error when translation fails', async () => {
        const onSuccess = jest.fn();

        mockedCreate.mockRejectedValue(new Error('API error'));

        const { result } = renderHook(() =>
            useTranslatePartnerBanner({
                banner: bannerMock,
                language: languageMock,
                onSuccess,
                mode: ModalMode.Add,
            }),
        );

        await act(async () => {
            try {
                await result.current.translateBanner(formValues);
            } catch {
                // Ignoring error for test
            }
        });

        await waitFor(() => {
            expect(result.current.error).toBe(PARTNERS_TEXT.MESSAGE.FAIL_TO_TRANSLATE_BANNER);
        });

        expect(onSuccess).not.toHaveBeenCalled();
        expect(result.current.isSubmitting).toBe(false);
    });

    it('should set error when update fails in edit mode', async () => {
        const onSuccess = jest.fn();

        mockedUpdate.mockRejectedValue(new Error('API error'));

        const bannerWithLocalization: PartnerBanner = {
            ...bannerMock,
            localizations: [
                {
                    ...localizationModelMock,
                    language: languageMock,
                },
            ],
        };

        const { result } = renderHook(() =>
            useTranslatePartnerBanner({
                banner: bannerWithLocalization,
                language: languageMock,
                onSuccess,
                mode: ModalMode.Edit,
            }),
        );

        await act(async () => {
            try {
                await result.current.translateBanner(formValues);
            } catch {
                // Ignoring error for test
            }
        });

        await waitFor(() => {
            expect(result.current.error).toBe(PARTNERS_TEXT.MESSAGE.FAIL_TO_UPDATE_TRANSLATION_FOR_BANNER);
        });

        expect(onSuccess).not.toHaveBeenCalled();
        expect(result.current.isSubmitting).toBe(false);
    });

    it('should clear error', () => {
        const { result } = renderHook(() =>
            useTranslatePartnerBanner({
                banner: bannerMock,
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

    it('should do nothing if banner is null', async () => {
        const onSuccess = jest.fn();

        const { result } = renderHook(() =>
            useTranslatePartnerBanner({
                banner: null,
                language: languageMock,
                onSuccess,
                mode: ModalMode.Add,
            }),
        );

        await act(async () => {
            await result.current.translateBanner(formValues);
        });

        expect(mockedCreate).not.toHaveBeenCalled();
        expect(onSuccess).not.toHaveBeenCalled();
    });
});
