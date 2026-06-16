import { renderHook, act } from '@testing-library/react';
import { useTranslateHistorySection } from './useTranslateHistorySection';
import { HistoryLocalizationsApi } from '@/services/api/admin/history/history-localizations-api';
import { useAdminClient } from '@/hooks/admin/use-admin-client/useAdminClient';
import { HistorySectionDto } from '@/types/common/history-sections';
import { ContentType } from '@/types/common/section-contents';
import { LocalizationLanguage } from '@/types/common/language';

jest.mock('@/hooks/admin/use-admin-client/useAdminClient');
jest.mock('@/services/api/admin/history/history-localizations-api');

describe('useTranslateHistorySection', () => {
    const mockClient = { post: jest.fn() };
    const mockOnSuccess = jest.fn();

    const mockLanguage: LocalizationLanguage = {
        id: 1,
        code: 'en',
        name: 'English',
    };

    const mockSection: HistorySectionDto = {
        id: 10,
        template: 1,
        order: 0,
        contents: [
            {
                id: 100,
                sectionId: 10,
                contentType: ContentType.Title,
                title: 'UA Title',
                order: 0,
                localizations: [],
            },
            {
                id: 101,
                sectionId: 10,
                contentType: ContentType.Description,
                description: 'UA Description',
                order: 1,
                localizations: [],
            },
        ],
    };

    beforeEach(() => {
        jest.clearAllMocks();
        (useAdminClient as jest.Mock).mockReturnValue(mockClient);
        (HistoryLocalizationsApi.create as jest.Mock).mockResolvedValue({});
        (HistoryLocalizationsApi.update as jest.Mock).mockResolvedValue({});
    });

    it('translates title and description fields and calls onSuccess with updated section', async () => {
        const { result } = renderHook(() =>
            useTranslateHistorySection({
                section: mockSection,
                language: mockLanguage,
                onSuccess: mockOnSuccess,
            }),
        );

        await act(async () => {
            await result.current.translateSection({
                title: 'EN Title',
                description: 'EN Description',
            });
        });

        expect(HistoryLocalizationsApi.create).toHaveBeenCalledTimes(1);

        expect(HistoryLocalizationsApi.create).toHaveBeenCalledWith(mockClient, {
            entityId: 10,
            languageId: 1,
            contents: [
                {
                    entityId: 100,
                    languageId: 1,
                    title: 'EN Title',
                    description: null,
                },
                {
                    entityId: 101,
                    languageId: 1,
                    title: null,
                    description: 'EN Description',
                },
            ],
        });

        expect(mockOnSuccess).toHaveBeenCalledTimes(1);
        const updatedSection = mockOnSuccess.mock.calls[0][0] as HistorySectionDto;

        expect(updatedSection.contents[0].localizations?.[0]).toEqual({
            entityId: 100,
            languageId: 1,
            localizationInfoDto: { id: 1, code: 'en', name: 'English' },
            translationStatus: 0,
            title: 'EN Title',
            description: null,
        });

        expect(updatedSection.contents[1].localizations?.[0]).toEqual({
            entityId: 101,
            languageId: 1,
            localizationInfoDto: { id: 1, code: 'en', name: 'English' },
            translationStatus: 0,
            title: null,
            description: 'EN Description',
        });
    });

    it('sets error state if API call fails', async () => {
        (HistoryLocalizationsApi.create as jest.Mock).mockRejectedValue(new Error('Failed'));

        const { result } = renderHook(() =>
            useTranslateHistorySection({
                section: mockSection,
                language: mockLanguage,
                onSuccess: mockOnSuccess,
            }),
        );

        await act(async () => {
            await expect(
                result.current.translateSection({
                    title: 'EN Title',
                    description: 'EN Description',
                }),
            ).rejects.toThrow();
        });

        expect(result.current.error).toBeTruthy();
        expect(mockOnSuccess).not.toHaveBeenCalled();
    });

    it('clears error state', () => {
        const { result } = renderHook(() =>
            useTranslateHistorySection({
                section: mockSection,
                language: mockLanguage,
                onSuccess: mockOnSuccess,
            }),
        );

        act(() => {
            result.current.clearError();
        });

        expect(result.current.error).toBe('');
    });

    it('calls update instead of create if localizations already exist', async () => {
        const mockSectionWithLocalizations: HistorySectionDto = {
            ...mockSection,
            contents: [
                {
                    ...mockSection.contents[0],
                    localizations: [
                        {
                            entityId: 100,
                            localizationInfoDto: { id: 1, code: 'en' },
                            translationStatus: 0,
                            title: 'Old Title',
                            description: null,
                        },
                    ],
                },
                mockSection.contents[1],
            ],
        };

        const { result } = renderHook(() =>
            useTranslateHistorySection({
                section: mockSectionWithLocalizations,
                language: mockLanguage,
                onSuccess: mockOnSuccess,
            }),
        );

        await act(async () => {
            await result.current.translateSection({
                title: 'New EN Title',
                description: 'New EN Description',
            });
        });

        expect(HistoryLocalizationsApi.update).toHaveBeenCalledTimes(1);
        expect(HistoryLocalizationsApi.create).not.toHaveBeenCalled();

        expect(HistoryLocalizationsApi.update).toHaveBeenCalledWith(mockClient, 10, 1, {
            entityId: 10,
            languageId: 1,
            contents: [
                {
                    entityId: 100,
                    languageId: 1,
                    title: 'New EN Title',
                    description: null,
                },
                {
                    entityId: 101,
                    languageId: 1,
                    title: null,
                    description: 'New EN Description',
                },
            ],
        });
    });
});
