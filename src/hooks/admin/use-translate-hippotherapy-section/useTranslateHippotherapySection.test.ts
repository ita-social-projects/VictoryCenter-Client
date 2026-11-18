import { renderHook, act } from '@testing-library/react';
import {
    useTranslateHippotherapySection,
    getHippotherapySectionEntityId,
    createSectionMapContext,
} from './useTranslateHippotherapySection';
import { HippotherapyPageContentModel, HippotherapyPageLocalizationBlock } from '@/types/admin/hippotherapy-page';
import { LocalizationLanguage } from '@/types/common/language';
import { HIPPOTHERAPY_PAGE_TEXT } from '@/const/admin/hippotherapy-page';
import { useAdminClient } from '../use-admin-client/useAdminClient';
import { getHippotherapySectionLocalizationApi } from '@/utils/functions/get-hippotherapy-section-localization-api/get-hippotherapy-section-localization-api';
import { mapHippotherapySectionFormValuesToDto } from '@/utils/functions/mappers/admin/hippotherapy-localization/hippotherapy-localization-mappers';

jest.mock('../use-admin-client/useAdminClient');
jest.mock('@/utils/functions/get-hippotherapy-section-localization-api/get-hippotherapy-section-localization-api');
jest.mock('@/utils/functions/mappers/admin/hippotherapy-localization/hippotherapy-localization-mappers', () => {
    const actual = jest.requireActual(
        '@/utils/functions/mappers/admin/hippotherapy-localization/hippotherapy-localization-mappers',
    );
    return {
        ...actual,
        mapHippotherapySectionFormValuesToDto: jest.fn(),
    };
});

const mockedUseAdminClient = useAdminClient as jest.Mock;
const mockedGetApi = getHippotherapySectionLocalizationApi as jest.Mock;
const mockedMapDto = mapHippotherapySectionFormValuesToDto as jest.Mock;

const mockClient = { post: jest.fn(), put: jest.fn() } as any;

const englishLanguage: LocalizationLanguage = {
    id: 2,
    code: 'en',
    name: 'English',
};

const buildContent = (overrides: Partial<HippotherapyPageContentModel> = {}): HippotherapyPageContentModel => ({
    localizations: [],
    translationStatuses: [],
    introSection: { id: 10, title: 'Intro title', description: 'Intro desc', image: null, imageId: null },
    descriptionSection: { id: 11, title: 'Desc title', description: 'Desc text' },
    quoteSection: { id: 12, quoteText: 'Quote text', authorName: 'Author', image: null, imageId: null },
    hippoventionSection: { id: 13, title: 'Hippovention title', description: 'Hippovention text' },
    hippoventionCenterSection: {
        id: 14,
        title: 'Center title',
        description: 'Center desc',
        pros: 'Pros',
        image: null,
        imageId: null,
    },
    advantagesSection: {
        id: 15,
        title: 'Advantages title',
        cards: [{ id: 101, description: 'Card 1', image: null, imageId: null }],
    },
    analysisSection: { id: 16, title: 'Analysis title', description: 'Analysis text' },
    anotherQuoteSection: { id: 17, quoteText: 'Another quote', authorName: 'Author 2', image: null, imageId: null },
    participantsSection: {
        id: 18,
        title: 'Participants title',
        cards: [{ id: 201, description: 'Participant 1', image: null, imageId: null }],
    },
    ethicsSection: {
        id: 19,
        title: 'Ethics title',
        description: 'Ethics desc',
        principles: [{ id: 301, text: 'Principle 1' }],
        image: null,
        imageId: null,
    },
    scientificReferencesSection: {
        id: 20,
        title: 'Research title',
        description: 'Research desc',
        scientificReferences: [{ localId: 'local-1', id: 401, name: 'Ref 1', url: 'https://example.com/1' }],
    },
    ...overrides,
});

describe('useTranslateHippotherapySection helper functions', () => {
    describe('getHippotherapySectionEntityId', () => {
        const content = buildContent();

        it.each([
            [HippotherapyPageLocalizationBlock.Intro, 10],
            [HippotherapyPageLocalizationBlock.Description, 11],
            [HippotherapyPageLocalizationBlock.Quote, 12],
            [HippotherapyPageLocalizationBlock.Hippovention, 13],
            [HippotherapyPageLocalizationBlock.HippoventionCenter, 14],
            [HippotherapyPageLocalizationBlock.Advantages, 15],
            [HippotherapyPageLocalizationBlock.Analysis, 16],
            [HippotherapyPageLocalizationBlock.AnotherQuote, 17],
            [HippotherapyPageLocalizationBlock.Participants, 18],
            [HippotherapyPageLocalizationBlock.Ethics, 19],
            [HippotherapyPageLocalizationBlock.ScientificReferences, 20],
        ])('returns correct entityId for block %s', (block, expectedId) => {
            expect(getHippotherapySectionEntityId(content, block)).toBe(expectedId);
        });

        it('returns null for an invalid or unknown block', () => {
            expect(getHippotherapySectionEntityId(content, 999 as any)).toBeNull();
        });
    });

    describe('createSectionMapContext', () => {
        it('returns null if entityId <= 0 or missing', () => {
            const content = buildContent({
                introSection: { id: -1, title: '', description: '', image: null, imageId: null },
            });
            expect(createSectionMapContext(content, HippotherapyPageLocalizationBlock.Intro, 2)).toBeNull();
        });

        it('creates base context for simple sections (Intro, Description, Quote, etc.)', () => {
            const content = buildContent();
            expect(createSectionMapContext(content, HippotherapyPageLocalizationBlock.Intro, 2)).toEqual({
                entityId: 10,
                languageId: 2,
            });
        });

        it('includes cardIds for Advantages and Participants', () => {
            const content = buildContent();
            expect(createSectionMapContext(content, HippotherapyPageLocalizationBlock.Advantages, 2)).toEqual({
                entityId: 15,
                languageId: 2,
                cardIds: [101],
            });
            expect(createSectionMapContext(content, HippotherapyPageLocalizationBlock.Participants, 2)).toEqual({
                entityId: 18,
                languageId: 2,
                cardIds: [201],
            });
        });

        it('includes principleIds for Ethics', () => {
            const content = buildContent();
            expect(createSectionMapContext(content, HippotherapyPageLocalizationBlock.Ethics, 2)).toEqual({
                entityId: 19,
                languageId: 2,
                principleIds: [301],
            });
        });

        it('includes research metadata and existing localization for ScientificReferences', () => {
            const existingLocalization = {
                title: 'Existing research title',
                description: 'Existing research desc',
                scientificReferences: [{ id: 401, name: 'Ref 1 en' }],
            };
            const content = buildContent({
                localizations: [
                    {
                        languageId: 2,
                        scientificReferencesSection: existingLocalization,
                    } as any,
                ],
            });

            const context = createSectionMapContext(
                content,
                HippotherapyPageLocalizationBlock.ScientificReferences,
                2,
                'research',
                'local-1',
            );

            expect(context).toEqual({
                entityId: 20,
                languageId: 2,
                subBlock: 'research',
                targetResearchLocalId: 'local-1',
                existingSectionLocalization: existingLocalization,
                scientificReferences: content.scientificReferencesSection.scientificReferences,
            });
        });
    });
});

describe('useTranslateHippotherapySection hook', () => {
    const mockApiService = {
        create: jest.fn(),
        update: jest.fn(),
    };
    const mockOnSuccess = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        mockedUseAdminClient.mockReturnValue(mockClient);
        mockedGetApi.mockReturnValue(mockApiService);
        mockedMapDto.mockReturnValue({ title: 'Mapped Title' });
        mockApiService.create.mockResolvedValue({ data: {} });
        mockApiService.update.mockResolvedValue({ data: {} });
    });

    it('sets error and skips API when required params are missing', async () => {
        const { result } = renderHook(() =>
            useTranslateHippotherapySection({
                pageContent: null,
                block: HippotherapyPageLocalizationBlock.Intro,
                language: englishLanguage,
                onSuccess: mockOnSuccess,
            }),
        );

        await act(async () => {
            await result.current.translateHippotherapySection({ title: 'Test' } as any);
        });

        expect(result.current.error).toBe(HIPPOTHERAPY_PAGE_TEXT.ERRORS.TRANSLATION_SAVE_FAILED);
        expect(mockApiService.create).not.toHaveBeenCalled();
        expect(mockApiService.update).not.toHaveBeenCalled();
    });

    it('sets error when entityId is invalid (e.g. unpublished page with id -1)', async () => {
        const content = buildContent({
            introSection: { id: -1, title: '', description: '', image: null, imageId: null },
        });

        const { result } = renderHook(() =>
            useTranslateHippotherapySection({
                pageContent: content,
                block: HippotherapyPageLocalizationBlock.Intro,
                language: englishLanguage,
                onSuccess: mockOnSuccess,
            }),
        );

        await act(async () => {
            await result.current.translateHippotherapySection({ title: 'Test' } as any);
        });

        expect(result.current.error).toBe(HIPPOTHERAPY_PAGE_TEXT.ERRORS.TRANSLATION_SAVE_FAILED);
        expect(mockApiService.create).not.toHaveBeenCalled();
    });

    it.each([
        ['apiService is not found for the block', () => mockedGetApi.mockReturnValue(null)],
        ['dto mapping returns null', () => mockedMapDto.mockReturnValue(null)],
    ])('sets error when %s', async (_scenario, setupMock) => {
        setupMock();

        const { result } = renderHook(() =>
            useTranslateHippotherapySection({
                pageContent: buildContent(),
                block: HippotherapyPageLocalizationBlock.Intro,
                language: englishLanguage,
                onSuccess: mockOnSuccess,
            }),
        );

        await act(async () => {
            await result.current.translateHippotherapySection({ title: 'Test' } as any);
        });

        expect(result.current.error).toBe(HIPPOTHERAPY_PAGE_TEXT.ERRORS.TRANSLATION_SAVE_FAILED);
        expect(mockApiService.create).not.toHaveBeenCalled();
    });

    it('calls apiService.create when section translation does not exist', async () => {
        const content = buildContent();
        const { result } = renderHook(() =>
            useTranslateHippotherapySection({
                pageContent: content,
                block: HippotherapyPageLocalizationBlock.Intro,
                language: englishLanguage,
                onSuccess: mockOnSuccess,
            }),
        );

        await act(async () => {
            await result.current.translateHippotherapySection({ title: 'New Intro' } as any);
        });

        expect(mockedMapDto).toHaveBeenCalledWith(
            HippotherapyPageLocalizationBlock.Intro,
            { title: 'New Intro' },
            { entityId: 10, languageId: 2 },
            false,
        );
        expect(mockApiService.create).toHaveBeenCalledWith(mockClient, { title: 'Mapped Title' });
        expect(mockApiService.update).not.toHaveBeenCalled();
        expect(mockOnSuccess).toHaveBeenCalledTimes(1);
        expect(result.current.error).toBe('');
    });

    it('calls apiService.update when section translation already exists', async () => {
        const content = buildContent({
            localizations: [
                {
                    languageId: 2,
                    introSection: { title: 'Old Intro', description: 'Old Desc' },
                } as any,
            ],
        });

        const { result } = renderHook(() =>
            useTranslateHippotherapySection({
                pageContent: content,
                block: HippotherapyPageLocalizationBlock.Intro,
                language: englishLanguage,
                onSuccess: mockOnSuccess,
            }),
        );

        await act(async () => {
            await result.current.translateHippotherapySection({ title: 'Updated Intro' } as any);
        });

        expect(mockedMapDto).toHaveBeenCalledWith(
            HippotherapyPageLocalizationBlock.Intro,
            { title: 'Updated Intro' },
            { entityId: 10, languageId: 2 },
            true,
        );
        expect(mockApiService.update).toHaveBeenCalledWith(mockClient, 10, 2, { title: 'Mapped Title' });
        expect(mockApiService.create).not.toHaveBeenCalled();
        expect(mockOnSuccess).toHaveBeenCalledTimes(1);
    });

    it('correctly detects existing ScientificReferences localization and calls update', async () => {
        const content = buildContent({
            localizations: [
                {
                    language: { id: 2 },
                    scientificReferencesSection: {
                        title: 'Old Title',
                        description: 'Old Desc',
                        scientificReferences: [],
                    },
                } as any,
            ],
        });

        const { result } = renderHook(() =>
            useTranslateHippotherapySection({
                pageContent: content,
                block: HippotherapyPageLocalizationBlock.ScientificReferences,
                subBlock: 'general',
                language: englishLanguage,
                onSuccess: mockOnSuccess,
            }),
        );

        await act(async () => {
            await result.current.translateHippotherapySection({ title: 'New General' } as any);
        });

        expect(mockApiService.update).toHaveBeenCalledWith(mockClient, 20, 2, { title: 'Mapped Title' });
        expect(mockApiService.create).not.toHaveBeenCalled();
    });

    it('manages isSubmitting state and catches API rejection without crashing', async () => {
        mockApiService.create.mockRejectedValue(new Error('Network error'));

        const { result } = renderHook(() =>
            useTranslateHippotherapySection({
                pageContent: buildContent(),
                block: HippotherapyPageLocalizationBlock.Intro,
                language: englishLanguage,
                onSuccess: mockOnSuccess,
            }),
        );

        expect(result.current.isSubmitting).toBe(false);

        await act(async () => {
            await result.current.translateHippotherapySection({ title: 'Intro' } as any);
        });

        expect(result.current.isSubmitting).toBe(false);
        expect(result.current.error).toBe(HIPPOTHERAPY_PAGE_TEXT.ERRORS.TRANSLATION_SAVE_FAILED);
        expect(mockOnSuccess).not.toHaveBeenCalled();
    });
});
