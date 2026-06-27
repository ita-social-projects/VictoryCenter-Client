import { renderHook, act } from '@testing-library/react';
import { useTranslatePdfSection } from './useTranslatePdfSection';
import { PdfSectionLocalizationsApi } from '@/services/api/admin/reports/pdf-section/pdf-section-localization/pdf-section-localizations-api';
import { useAdminClient } from '@/hooks/admin/use-admin-client/useAdminClient';
import { ModalMode } from '@/types/admin/common';
import { PdfSection, PdfSectionLocalizationDto } from '@/types/admin/pdf-section';
import { LocalizationLanguage, TranslationStatus } from '@/types/common/language';

jest.mock('@/hooks/admin/use-admin-client/useAdminClient');
jest.mock('@/services/api/admin/reports/pdf-section/pdf-section-localization/pdf-section-localizations-api');

const mockUseAdminClient = useAdminClient as jest.MockedFunction<typeof useAdminClient>;
const mockPdfSectionLocalizationsApi = PdfSectionLocalizationsApi as jest.Mocked<typeof PdfSectionLocalizationsApi>;

const TEST_DATA = {
    mockClient: { post: jest.fn(), put: jest.fn() },
    mockLanguage: {
        id: 2,
        code: 'en',
        name: 'English',
    } as LocalizationLanguage,
    mockPdfSection: {
        title: 'Original Title',
        description: 'Original Description',
        localizations: [],
    } as PdfSection,
    mockLocalizationDto: {
        languageId: 2,
        title: 'Translated Title',
        description: 'Translated Description',
        localizationInfoDto: {
            id: 2,
            code: 'en',
        },
        translationStatus: TranslationStatus.Relevant,
    } as PdfSectionLocalizationDto,
};

describe('useTranslatePdfSection', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockUseAdminClient.mockReturnValue(TEST_DATA.mockClient as any);
    });

    describe('Add mode', () => {
        it('should create localization and call onSuccess with updated section', async () => {
            const onSuccess = jest.fn();
            mockPdfSectionLocalizationsApi.create.mockResolvedValueOnce(TEST_DATA.mockLocalizationDto);

            const { result } = renderHook(() =>
                useTranslatePdfSection({
                    pdfSection: TEST_DATA.mockPdfSection,
                    language: TEST_DATA.mockLanguage,
                    mode: ModalMode.Add,
                    onSuccess,
                }),
            );

            const formData = {
                title: 'Translated Title',
                description: 'Translated Description',
            };

            await act(async () => {
                await result.current.translatePdfSection(formData);
            });

            expect(mockPdfSectionLocalizationsApi.create).toHaveBeenCalledWith(TEST_DATA.mockClient, {
                languageId: TEST_DATA.mockLanguage.id,
                title: formData.title,
                description: formData.description,
            });

            expect(onSuccess).toHaveBeenCalledWith(
                expect.objectContaining({
                    ...TEST_DATA.mockPdfSection,
                    localizations: [TEST_DATA.mockLocalizationDto],
                }),
            );
        });

        it('should set error message on create failure', async () => {
            const onSuccess = jest.fn();
            mockPdfSectionLocalizationsApi.create.mockRejectedValueOnce(new Error('Network error'));

            const { result } = renderHook(() =>
                useTranslatePdfSection({
                    pdfSection: TEST_DATA.mockPdfSection,
                    language: TEST_DATA.mockLanguage,
                    mode: ModalMode.Add,
                    onSuccess,
                }),
            );

            await act(async () => {
                await result.current.translatePdfSection({ title: 'Test', description: 'Test' }).catch(() => {});
            });

            expect(result.current.error).toBeTruthy();
            expect(onSuccess).not.toHaveBeenCalled();
        });
    });

    describe('Edit mode', () => {
        it('should update localization and call onSuccess with updated section', async () => {
            const onSuccess = jest.fn();
            const existingLocalization: PdfSectionLocalizationDto = {
                languageId: TEST_DATA.mockLanguage.id,
                title: 'Old Title',
                description: 'Old Description',
                localizationInfoDto: {
                    id: TEST_DATA.mockLanguage.id,
                    code: TEST_DATA.mockLanguage.code,
                },
                translationStatus: TranslationStatus.Relevant,
            };
            const sectionWithLocalization: PdfSection = {
                ...TEST_DATA.mockPdfSection,
                localizations: [existingLocalization],
            };

            mockPdfSectionLocalizationsApi.update.mockResolvedValueOnce(TEST_DATA.mockLocalizationDto);

            const { result } = renderHook(() =>
                useTranslatePdfSection({
                    pdfSection: sectionWithLocalization,
                    language: TEST_DATA.mockLanguage,
                    mode: ModalMode.Edit,
                    onSuccess,
                }),
            );

            const formData = {
                title: 'Updated Title',
                description: 'Updated Description',
            };

            await act(async () => {
                await result.current.translatePdfSection(formData);
            });

            expect(mockPdfSectionLocalizationsApi.update).toHaveBeenCalledWith(
                TEST_DATA.mockClient,
                TEST_DATA.mockLanguage.id,
                {
                    title: formData.title,
                    description: formData.description,
                },
            );

            expect(onSuccess).toHaveBeenCalledWith(
                expect.objectContaining({
                    ...sectionWithLocalization,
                    localizations: [TEST_DATA.mockLocalizationDto],
                }),
            );
        });

        it('should set error message on update failure', async () => {
            const onSuccess = jest.fn();
            mockPdfSectionLocalizationsApi.update.mockRejectedValueOnce(new Error('Update failed'));

            const { result } = renderHook(() =>
                useTranslatePdfSection({
                    pdfSection: TEST_DATA.mockPdfSection,
                    language: TEST_DATA.mockLanguage,
                    mode: ModalMode.Edit,
                    onSuccess,
                }),
            );

            await act(async () => {
                await result.current.translatePdfSection({ title: 'Test', description: 'Test' }).catch(() => {});
            });

            expect(result.current.error).toBeTruthy();
            expect(onSuccess).not.toHaveBeenCalled();
        });
    });

    describe('Submission state', () => {
        it('should set isSubmitting to true during API call and false after', async () => {
            let resolveApiCall!: (value: PdfSectionLocalizationDto) => void;
            mockPdfSectionLocalizationsApi.create.mockImplementationOnce(
                () =>
                    new Promise((resolve) => {
                        resolveApiCall = resolve;
                    }),
            );

            const { result } = renderHook(() =>
                useTranslatePdfSection({
                    pdfSection: TEST_DATA.mockPdfSection,
                    language: TEST_DATA.mockLanguage,
                    mode: ModalMode.Add,
                    onSuccess: jest.fn(),
                }),
            );

            expect(result.current.isSubmitting).toBe(false);

            let submitPromise: Promise<void>;
            act(() => {
                submitPromise = result.current.translatePdfSection({ title: 'Test', description: 'Test' });
            });

            expect(result.current.isSubmitting).toBe(true);

            await act(async () => {
                resolveApiCall(TEST_DATA.mockLocalizationDto);
                await submitPromise;
            });

            expect(result.current.isSubmitting).toBe(false);
        });
    });

    describe('Without pdfSection', () => {
        it('should not make API call if pdfSection is null', async () => {
            const onSuccess = jest.fn();

            const { result } = renderHook(() =>
                useTranslatePdfSection({
                    pdfSection: null,
                    language: TEST_DATA.mockLanguage,
                    mode: ModalMode.Add,
                    onSuccess,
                }),
            );

            await act(async () => {
                await result.current.translatePdfSection({ title: 'Test', description: 'Test' });
            });

            expect(mockPdfSectionLocalizationsApi.create).not.toHaveBeenCalled();
            expect(onSuccess).not.toHaveBeenCalled();
        });
    });
});
