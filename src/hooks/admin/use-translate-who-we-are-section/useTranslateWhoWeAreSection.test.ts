import { act, renderHook, waitFor } from '@testing-library/react';
import { WHO_WE_ARE_TEXT } from '@/const/admin/who-we-are';
import { ModalMode } from '@/types/admin/common';
import { ContentType, SectionType } from '@/types/common/about-us';
import { LocalizationLanguage, TranslationStatus } from '@/types/common/language';
import { WhoWeAreLocalizationsApi } from '@/services/api/admin/who-we-are/who-we-are-localizations/who-we-are-localizations-api';
import { mapLocalizationDtoToModel } from '@/utils/functions/mappers/common/localization/localization-mappers';
import { WhoWeAreSection } from '@/types/admin/who-we-are';
import { useTranslateWhoWeAreSection } from './useTranslateWhoWeAreSection';

jest.mock('@/services/api/admin/who-we-are/who-we-are-localizations/who-we-are-localizations-api');
jest.mock('@/utils/functions/mappers/common/localization/localization-mappers');
jest.mock('../use-admin-client/useAdminClient', () => ({
    useAdminClient: () => ({ post: jest.fn() }),
}));

const mockedCreate = WhoWeAreLocalizationsApi.create as jest.MockedFunction<typeof WhoWeAreLocalizationsApi.create>;
const mockedUpdate = WhoWeAreLocalizationsApi.update as jest.MockedFunction<typeof WhoWeAreLocalizationsApi.update>;
const mockedMapper = mapLocalizationDtoToModel as jest.MockedFunction<typeof mapLocalizationDtoToModel>;

interface CreatePayloadOptions {
    description: string;
    titles: [string, string, string];
}

const buildUniformExpectedCreatePayload = ({ description, titles }: CreatePayloadOptions) => [
    {
        description,
        title: titles[0],
        entityId: 1,
        languageId: 2,
    },
    {
        description,
        title: titles[1],
        entityId: 2,
        languageId: 2,
    },
    {
        description,
        title: titles[2],
        entityId: 4,
        languageId: 2,
    },
];

const englishLanguage: LocalizationLanguage = {
    id: 2,
    code: 'en',
    name: 'English',
};

const baseSection: WhoWeAreSection = {
    id: 10,
    title: 'Who We Are',
    sectionType: SectionType.Main,
    contents: [
        {
            id: 1,
            contentType: ContentType.Description,
            title: 'Original title 1',
            description: 'Original description 1',
            image: null,
            imageId: null,
            localizations: [
                {
                    language: { id: 2, code: 'en' },
                    translationStatus: TranslationStatus.Relevant,
                    title: 'Old title 1',
                    description: 'Old description 1',
                },
                {
                    language: { id: 1, code: 'uk' },
                    translationStatus: TranslationStatus.Relevant,
                    title: 'UA title 1',
                    description: 'UA description 1',
                },
            ],
        },
        {
            id: 2,
            contentType: ContentType.Title,
            title: 'Original title 2',
            description: 'Original description 2',
            image: null,
            imageId: null,
            localizations: [
                {
                    language: { id: 2, code: 'en' },
                    translationStatus: TranslationStatus.Relevant,
                    title: 'Old title 2',
                    description: 'Old description 2',
                },
            ],
        },
        {
            id: 3,
            contentType: ContentType.Image,
            title: null,
            description: null,
            image: { id: 11, url: 'image.jpg', mimeType: 'image/jpeg' },
            imageId: 11,
            localizations: [],
        },
        {
            id: 4,
            contentType: ContentType.Description,
            title: 'Original title 4',
            description: 'Original description 4',
            image: null,
            imageId: null,
            localizations: undefined as any,
        },
    ],
};

describe('useTranslateWhoWeAreSection', () => {
    const renderTranslateHook = (options: Partial<Parameters<typeof useTranslateWhoWeAreSection>[0]> = {}) => {
        const onSuccess = options.onSuccess ?? jest.fn();

        const utils = renderHook(() =>
            useTranslateWhoWeAreSection({
                section: baseSection,
                language: englishLanguage,
                mode: ModalMode.Add,
                ...options,
                onSuccess,
            }),
        );

        return { ...utils, onSuccess };
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('initializes with default state', () => {
        const { result } = renderTranslateHook();

        expect(result.current.isSubmitting).toBe(false);
        expect(result.current.error).toBe('');
    });

    it('maps rows form payload and updates translated localizations on success', async () => {
        const onSuccess = jest.fn();

        mockedCreate.mockResolvedValue([
            {
                entityId: 1,
                localizationInfoDto: { id: 2, code: 'en' },
                title: 'Mapped title 1',
                description: 'Mapped row description 1',
                translationStatus: TranslationStatus.Relevant,
            } as any,
            {
                entityId: 2,
                localizationInfoDto: { id: 2, code: 'en' },
                title: 'Mapped title 2',
                description: 'Mapped row description 2',
                translationStatus: TranslationStatus.Relevant,
            } as any,
            {
                entityId: 4,
                localizationInfoDto: { id: 2, code: 'en' },
                title: 'Mapped title 4',
                description: 'Mapped row description 4',
                translationStatus: TranslationStatus.Relevant,
            } as any,
        ]);

        mockedMapper.mockImplementation((dto: any) => ({
            entityId: dto.entityId,
            language: dto.localizationInfoDto,
            title: dto.title,
            description: dto.description,
            translationStatus: dto.translationStatus,
        }));

        const { result } = renderTranslateHook({ onSuccess });

        await act(async () => {
            await result.current.translateSection({
                rows: [
                    { contentId: 1, image: 'i1.jpg', description: 'Row description for 1' },
                    { contentId: 2, image: 'i2.jpg', description: 'Row description for 2' },
                ],
            });
        });

        expect(mockedCreate).toHaveBeenCalledWith(expect.anything(), SectionType.Main, [
            {
                description: 'Row description for 1',
                title: 'Original title 1',
                entityId: 1,
                languageId: 2,
            },
            {
                description: 'Row description for 2',
                title: 'Original title 2',
                entityId: 2,
                languageId: 2,
            },
            {
                description: null,
                title: 'Original title 4',
                entityId: 4,
                languageId: 2,
            },
        ]);

        await waitFor(() => {
            expect(onSuccess).toHaveBeenCalledTimes(1);
        });

        const updatedSection = onSuccess.mock.calls[0][0] as WhoWeAreSection;
        const updatedContent1 = updatedSection.contents.find((content) => content.id === 1);
        const updatedContent2 = updatedSection.contents.find((content) => content.id === 2);
        const updatedContent4 = updatedSection.contents.find((content) => content.id === 4);

        expect(updatedContent1?.localizations?.find((l) => l.language.id === 2)?.description).toBe(
            'Mapped row description 1',
        );
        expect(updatedContent2?.localizations?.find((l) => l.language.id === 2)?.description).toBe(
            'Mapped row description 2',
        );
        expect(updatedContent4?.localizations).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    language: expect.objectContaining({ id: 2, code: 'en' }),
                    title: 'Mapped title 4',
                    description: 'Mapped row description 4',
                }),
            ]),
        );

        expect(result.current.isSubmitting).toBe(false);
        expect(result.current.error).toBe('');
    });

    it('maps title and description form payload for add mode', async () => {
        mockedCreate.mockResolvedValue([] as any);
        mockedMapper.mockImplementation((dto: any) => dto);

        const { result } = renderTranslateHook();

        await act(async () => {
            await result.current.translateSection({
                title: 'Translated title',
                description: 'Translated description',
            });
        });

        expect(mockedCreate).toHaveBeenCalledWith(
            expect.anything(),
            SectionType.Main,
            buildUniformExpectedCreatePayload({
                description: 'Translated description',
                titles: ['Translated title', 'Translated title', 'Translated title'],
            }),
        );
    });

    it('maps description-only form payload for add mode', async () => {
        mockedCreate.mockResolvedValue([] as any);
        mockedMapper.mockImplementation((dto: any) => dto);

        const { result } = renderTranslateHook();

        await act(async () => {
            await result.current.translateSection({
                description: 'Description only',
            });
        });

        expect(mockedCreate).toHaveBeenCalledWith(
            expect.anything(),
            SectionType.Main,
            buildUniformExpectedCreatePayload({
                description: 'Description only',
                titles: ['Original title 1', 'Original title 2', 'Original title 4'],
            }),
        );
    });

    it('does nothing when section is null', async () => {
        const onSuccess = jest.fn();

        const { result } = renderTranslateHook({ section: null, onSuccess });

        await act(async () => {
            await result.current.translateSection({ description: 'Ignored' });
        });

        expect(mockedCreate).not.toHaveBeenCalled();
        expect(onSuccess).not.toHaveBeenCalled();
    });

    it('calls update API in edit mode and completes successfully', async () => {
        mockedUpdate.mockResolvedValue([] as any);
        mockedMapper.mockImplementation((dto: any) => dto);

        const onSuccess = jest.fn();

        const { result } = renderTranslateHook({ mode: ModalMode.Edit, onSuccess });

        await act(async () => {
            await result.current.translateSection({ description: 'Edit flow value' });
        });

        expect(mockedCreate).not.toHaveBeenCalled();
        expect(mockedUpdate).toHaveBeenCalledWith(
            expect.anything(),
            SectionType.Main,
            buildUniformExpectedCreatePayload({
                description: 'Edit flow value',
                titles: ['Original title 1', 'Original title 2', 'Original title 4'],
            }),
        );
        expect(onSuccess).toHaveBeenCalledTimes(1);
        expect(result.current.error).toBe('');
        expect(result.current.isSubmitting).toBe(false);
    });

    it('sets translation error and rethrows on edit mode API failure', async () => {
        mockedUpdate.mockRejectedValue(new Error('update failed'));

        const { result } = renderTranslateHook({ mode: ModalMode.Edit });

        await act(async () => {
            await expect(result.current.translateSection({ description: 'Will fail in edit' })).rejects.toThrow(
                'update failed',
            );
        });

        await waitFor(() => {
            expect(result.current.error).toBe(WHO_WE_ARE_TEXT.FORM.MESSAGE.FAIL_TO_UPDATE_TRANSLATION);
        });

        expect(result.current.isSubmitting).toBe(false);
    });

    it('sets translation error and rethrows on add mode API failure', async () => {
        mockedCreate.mockRejectedValue(new Error('create failed'));

        const { result } = renderTranslateHook();

        await act(async () => {
            await expect(result.current.translateSection({ description: 'Will fail' })).rejects.toThrow(
                'create failed',
            );
        });

        await waitFor(() => {
            expect(result.current.error).toBe(WHO_WE_ARE_TEXT.FORM.MESSAGE.FAIL_TO_TRANSLATE_SECTION);
        });

        expect(result.current.isSubmitting).toBe(false);
    });

    it('clears error state', async () => {
        mockedCreate.mockRejectedValue(new Error('failure'));

        const { result } = renderTranslateHook();

        await act(async () => {
            await expect(result.current.translateSection({ description: 'Will fail first' })).rejects.toThrow(
                'failure',
            );
        });

        act(() => {
            result.current.clearError();
        });

        expect(result.current.error).toBe('');
    });
});
