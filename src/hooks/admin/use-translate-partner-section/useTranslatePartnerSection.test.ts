import { renderHook, act, waitFor } from '@testing-library/react';
import { useTranslatePartnerSection } from './useTranslatePartnerSection';
import { PartnerSectionLocalizationApi } from '@/services/api/admin/partners/partner-section-localizations-api';
import { PARTNERS_TEXT } from '@/const/admin/partners';
import { LocalizationLanguage } from '@/types/common/language';
import { PartnerSection, PartnerSectionLocalizationDto } from '@/types/admin/partners';

jest.mock('@/services/api/admin/partners/partner-section-localizations-api');
jest.mock('../use-admin-client/useAdminClient', () => ({
    useAdminClient: () => 'mock-client',
}));

const mockedGet = PartnerSectionLocalizationApi.get as jest.MockedFunction<typeof PartnerSectionLocalizationApi.get>;
const mockedCreate = PartnerSectionLocalizationApi.create as jest.MockedFunction<
    typeof PartnerSectionLocalizationApi.create
>;
const mockedUpdate = PartnerSectionLocalizationApi.update as jest.MockedFunction<
    typeof PartnerSectionLocalizationApi.update
>;

const sectionMock: PartnerSection = {
    id: 1,
    title: 'Original section title',
    description: 'Original section description',
    partners: [
        { id: 5, description: 'Partner 1', image: null, imageId: null },
        { id: 6, description: 'Partner 2', image: null, imageId: null },
    ],
    localizations: [],
};

const languageMock: LocalizationLanguage = {
    id: 2,
    code: 'en',
    name: 'English',
};

const formValues = {
    title: 'Translated section title',
    description: 'Translated section description',
    partners: [
        { partnerId: 5, description: 'Translated partner 1' },
        { partnerId: 6, description: 'Translated partner 2' },
    ],
};

describe('useTranslatePartnerSection', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should initialize with default state and not fetch while closed', () => {
        const { result } = renderHook(() =>
            useTranslatePartnerSection({
                section: sectionMock,
                language: languageMock,
                isOpen: false,
                onSuccess: jest.fn(),
            }),
        );

        expect(result.current.isSubmitting).toBe(false);
        expect(result.current.error).toBe('');
        expect(result.current.existingTranslation).toBeNull();
        expect(mockedGet).not.toHaveBeenCalled();
    });

    it('should fetch the existing translation when opened and enter edit mode when found', async () => {
        const existingTranslation: PartnerSectionLocalizationDto = {
            entityId: 1,
            title: 'Existing EN title',
            description: 'Existing EN description',
            partners: [{ partnerId: 5, description: 'Existing EN partner' }],
            localizationInfoDto: { id: 2, code: 'en' },
            translationStatus: 1,
        };
        mockedGet.mockResolvedValue(existingTranslation);

        const { result } = renderHook(() =>
            useTranslatePartnerSection({
                section: sectionMock,
                language: languageMock,
                isOpen: true,
                onSuccess: jest.fn(),
            }),
        );

        expect(mockedGet).toHaveBeenCalledWith('mock-client', 1, 2);

        await waitFor(() => {
            expect(result.current.isLoadingTranslation).toBe(false);
        });

        expect(result.current.existingTranslation).toEqual(existingTranslation);
        expect(result.current.isEditMode).toBe(true);
    });

    it('should stay in add mode when the translation is not found (404 -> null)', async () => {
        mockedGet.mockResolvedValue(null);

        const { result } = renderHook(() =>
            useTranslatePartnerSection({
                section: sectionMock,
                language: languageMock,
                isOpen: true,
                onSuccess: jest.fn(),
            }),
        );

        await waitFor(() => {
            expect(result.current.isLoadingTranslation).toBe(false);
        });

        expect(result.current.existingTranslation).toBeNull();
        expect(result.current.isEditMode).toBe(false);
    });

    it('should set a fetch error when loading the translation fails', async () => {
        mockedGet.mockRejectedValue(new Error('network error'));

        const { result } = renderHook(() =>
            useTranslatePartnerSection({
                section: sectionMock,
                language: languageMock,
                isOpen: true,
                onSuccess: jest.fn(),
            }),
        );

        await waitFor(() => {
            expect(result.current.translationFetchError).toBe(
                PARTNERS_TEXT.MESSAGE.FAIL_TO_LOAD_TRANSLATION_FOR_SECTION,
            );
        });
    });

    it('should create a translation when in add mode', async () => {
        const onSuccess = jest.fn();
        mockedGet.mockResolvedValue(null);
        mockedCreate.mockResolvedValue({} as PartnerSectionLocalizationDto);

        const { result } = renderHook(() =>
            useTranslatePartnerSection({
                section: sectionMock,
                language: languageMock,
                isOpen: true,
                onSuccess,
            }),
        );

        await waitFor(() => {
            expect(result.current.isLoadingTranslation).toBe(false);
        });

        await act(async () => {
            await result.current.translateSection(formValues);
        });

        expect(mockedCreate).toHaveBeenCalledWith('mock-client', {
            entityId: 1,
            languageId: 2,
            title: formValues.title,
            description: formValues.description,
            partners: [
                { partnerId: 5, description: 'Translated partner 1' },
                { partnerId: 6, description: 'Translated partner 2' },
            ],
        });
        expect(onSuccess).toHaveBeenCalled();
    });

    it('should update a translation when in edit mode', async () => {
        const onSuccess = jest.fn();
        mockedGet.mockResolvedValue({
            entityId: 1,
            title: 'Existing',
            description: 'Existing',
            partners: [],
            localizationInfoDto: { id: 2, code: 'en' },
            translationStatus: 1,
        });
        mockedUpdate.mockResolvedValue({} as PartnerSectionLocalizationDto);

        const { result } = renderHook(() =>
            useTranslatePartnerSection({
                section: sectionMock,
                language: languageMock,
                isOpen: true,
                onSuccess,
            }),
        );

        await waitFor(() => {
            expect(result.current.isEditMode).toBe(true);
        });

        await act(async () => {
            await result.current.translateSection(formValues);
        });

        expect(mockedUpdate).toHaveBeenCalledWith('mock-client', 1, 2, {
            title: formValues.title,
            description: formValues.description,
            partners: [
                { partnerId: 5, description: 'Translated partner 1' },
                { partnerId: 6, description: 'Translated partner 2' },
            ],
        });
        expect(onSuccess).toHaveBeenCalled();
    });

    it('should set an error when create fails', async () => {
        mockedGet.mockResolvedValue(null);
        mockedCreate.mockRejectedValue(new Error('API error'));

        const { result } = renderHook(() =>
            useTranslatePartnerSection({
                section: sectionMock,
                language: languageMock,
                isOpen: true,
                onSuccess: jest.fn(),
            }),
        );

        await waitFor(() => {
            expect(result.current.isLoadingTranslation).toBe(false);
        });

        await act(async () => {
            try {
                await result.current.translateSection(formValues);
            } catch {
                // Ignoring error for test
            }
        });

        await waitFor(() => {
            expect(result.current.error).toBe(PARTNERS_TEXT.MESSAGE.FAIL_TO_TRANSLATE_SECTION);
        });
        expect(result.current.isSubmitting).toBe(false);
    });

    it('should do nothing if section is null', async () => {
        const onSuccess = jest.fn();

        const { result } = renderHook(() =>
            useTranslatePartnerSection({
                section: null,
                language: languageMock,
                isOpen: true,
                onSuccess,
            }),
        );

        await act(async () => {
            await result.current.translateSection(formValues);
        });

        expect(mockedCreate).not.toHaveBeenCalled();
        expect(mockedGet).not.toHaveBeenCalled();
        expect(onSuccess).not.toHaveBeenCalled();
    });

    it('clears the previous translation immediately when language changes while open, before the new fetch resolves', async () => {
        const existingTranslationA: PartnerSectionLocalizationDto = {
            entityId: 1,
            title: 'Existing A title',
            description: 'Existing A description',
            partners: [],
            localizationInfoDto: { id: 2, code: 'en' },
            translationStatus: 1,
        };
        const languageB: LocalizationLanguage = { id: 3, code: 'pl', name: 'Polish' };

        mockedGet.mockResolvedValueOnce(existingTranslationA);

        const { result, rerender } = renderHook(
            ({ language }: { language: LocalizationLanguage }) =>
                useTranslatePartnerSection({
                    section: sectionMock,
                    language,
                    isOpen: true,
                    onSuccess: jest.fn(),
                }),
            { initialProps: { language: languageMock } },
        );

        await waitFor(() => {
            expect(result.current.existingTranslation).toEqual(existingTranslationA);
        });
        expect(result.current.isEditMode).toBe(true);

        let resolveSecondFetch: (value: PartnerSectionLocalizationDto | null) => void = () => {};
        mockedGet.mockImplementationOnce(
            () =>
                new Promise((resolve) => {
                    resolveSecondFetch = resolve;
                }),
        );

        rerender({ language: languageB });

        expect(result.current.existingTranslation).toBeNull();
        expect(result.current.isEditMode).toBe(false);

        await act(async () => {
            resolveSecondFetch(null);
        });
    });

    it('should clear error', () => {
        const { result } = renderHook(() =>
            useTranslatePartnerSection({
                section: sectionMock,
                language: languageMock,
                isOpen: false,
                onSuccess: jest.fn(),
            }),
        );

        act(() => {
            result.current.clearError();
        });

        expect(result.current.error).toBe('');
    });
});
