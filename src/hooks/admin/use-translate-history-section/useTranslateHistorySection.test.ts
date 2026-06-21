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

    const mockSections: HistorySectionDto[] = [
        {
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
        },
        {
            id: 11,
            template: 2,
            order: 1,
            contents: [
                {
                    id: 102,
                    sectionId: 11,
                    contentType: ContentType.Title,
                    title: 'UA Title 2',
                    order: 0,
                    localizations: [],
                },
            ],
        },
    ];

    beforeEach(() => {
        jest.clearAllMocks();
        (useAdminClient as jest.Mock).mockReturnValue(mockClient);
        (HistoryLocalizationsApi.create as jest.Mock).mockResolvedValue({});
        (HistoryLocalizationsApi.update as jest.Mock).mockResolvedValue({});
    });

    it('translates title and description fields and calls onSuccess with updated sections', async () => {
        const { result } = renderHook(() =>
            useTranslateHistorySection({
                sections: mockSections,
                language: mockLanguage,
                onSuccess: mockOnSuccess,
            }),
        );

        await act(async () => {
            await result.current.translateSections([
                {
                    sectionId: 10,
                    data: { title: 'EN Title', description: 'EN Description' },
                },
                {
                    sectionId: 11,
                    data: { title: 'EN Title 2', description: '' },
                },
            ]);
        });

        expect(HistoryLocalizationsApi.create).toHaveBeenCalledTimes(1);

        expect(HistoryLocalizationsApi.create).toHaveBeenCalledWith(mockClient, [
            {
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
            },
            {
                entityId: 11,
                languageId: 1,
                contents: [
                    {
                        entityId: 102,
                        languageId: 1,
                        title: 'EN Title 2',
                        description: null,
                    },
                ],
            },
        ]);

        expect(mockOnSuccess).toHaveBeenCalledTimes(1);
        const updatedSections = mockOnSuccess.mock.calls[0][0] as HistorySectionDto[];

        expect(updatedSections[0].contents[0].localizations?.[0]).toEqual({
            entityId: 100,
            languageId: 1,
            localizationInfoDto: { id: 1, code: 'en', name: 'English' },
            translationStatus: 0,
            title: 'EN Title',
            description: null,
        });

        expect(updatedSections[1].contents[0].localizations?.[0]).toEqual({
            entityId: 102,
            languageId: 1,
            localizationInfoDto: { id: 1, code: 'en', name: 'English' },
            translationStatus: 0,
            title: 'EN Title 2',
            description: null,
        });
    });

    it('sets error state if API call fails', async () => {
        (HistoryLocalizationsApi.create as jest.Mock).mockRejectedValue(new Error('Failed'));

        const { result } = renderHook(() =>
            useTranslateHistorySection({
                sections: mockSections,
                language: mockLanguage,
                onSuccess: mockOnSuccess,
            }),
        );

        await act(async () => {
            await expect(
                result.current.translateSections([
                    {
                        sectionId: 10,
                        data: { title: 'EN Title', description: 'EN Description' },
                    },
                ]),
            ).rejects.toThrow();
        });

        expect(result.current.error).toBeTruthy();
        expect(mockOnSuccess).not.toHaveBeenCalled();
    });

    it('clears error state', () => {
        const { result } = renderHook(() =>
            useTranslateHistorySection({
                sections: mockSections,
                language: mockLanguage,
                onSuccess: mockOnSuccess,
            }),
        );

        act(() => {
            result.current.clearError();
        });

        expect(result.current.error).toBe('');
    });

    it('calls update instead of create if localizations already exist for a section', async () => {
        const mockSectionsWithLocalizations: HistorySectionDto[] = [
            {
                ...mockSections[0],
                contents: [
                    {
                        ...mockSections[0].contents[0],
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
                    mockSections[0].contents[1],
                ],
            },
            mockSections[1],
        ];

        const { result } = renderHook(() =>
            useTranslateHistorySection({
                sections: mockSectionsWithLocalizations,
                language: mockLanguage,
                onSuccess: mockOnSuccess,
            }),
        );

        await act(async () => {
            await result.current.translateSections([
                {
                    sectionId: 10,
                    data: { title: 'New EN Title', description: 'New EN Description' },
                },
                {
                    sectionId: 11,
                    data: { title: 'New EN Title 2', description: '' },
                },
            ]);
        });

        expect(HistoryLocalizationsApi.update).toHaveBeenCalledTimes(1);
        expect(HistoryLocalizationsApi.create).toHaveBeenCalledTimes(1);

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

        expect(HistoryLocalizationsApi.create).toHaveBeenCalledWith(mockClient, [
            {
                entityId: 11,
                languageId: 1,
                contents: [
                    {
                        entityId: 102,
                        languageId: 1,
                        title: 'New EN Title 2',
                        description: null,
                    },
                ],
            },
        ]);
    });

    it('normalizes spaces in title and description when saving (trims ends + collapses consecutive spaces)', async () => {
        const { result } = renderHook(() =>
            useTranslateHistorySection({
                sections: mockSections,
                language: mockLanguage,
                onSuccess: mockOnSuccess,
            }),
        );

        await act(async () => {
            await result.current.translateSections([
                {
                    sectionId: 10,
                    data: {
                        title: '  EN  Title  With  Spaces  ',
                        description: '  EN  Description  With  Spaces  ',
                    },
                },
            ]);
        });

        expect(HistoryLocalizationsApi.create).toHaveBeenCalledWith(
            mockClient,
            expect.arrayContaining([
                expect.objectContaining({
                    contents: expect.arrayContaining([
                        expect.objectContaining({ title: 'EN Title With Spaces' }),
                        expect.objectContaining({ description: 'EN Description With Spaces' }),
                    ]),
                }),
            ]),
        );

        const updatedSections = mockOnSuccess.mock.calls[0][0] as HistorySectionDto[];
        expect(updatedSections[0].contents[0].localizations?.[0]?.title).toBe('EN Title With Spaces');
        expect(updatedSections[0].contents[1].localizations?.[0]?.description).toBe('EN Description With Spaces');
    });
});
