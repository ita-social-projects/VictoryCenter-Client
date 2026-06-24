import { act, renderHook, waitFor } from '@testing-library/react';
import axios from 'axios';

import { MainPageLocalizationsApi } from '@/services/api/admin/main-page/main-page-localizations-api/main-page-localizations-api';
import { MainPage, MainPageLocalizationBlock } from '@/types/admin/main-page';
import { TranslationStatus } from '@/types/common/language';
import { useTranslateMainPageBlock } from './useTranslateMainPageBlock';

jest.mock('@/hooks/admin/use-admin-client/useAdminClient', () => ({
    useAdminClient: () => ({}),
}));

jest.mock('@/services/api/admin/main-page/main-page-localizations-api/main-page-localizations-api', () => ({
    MainPageLocalizationsApi: {
        getByLanguageId: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
    },
}));

const englishLanguage = { id: 2, code: 'en', name: 'Англійська' };

const page: MainPage = {
    id: 1,
    title: 'Титул',
    description: 'Опис',
    image: null,
    localizations: [
        {
            languageId: englishLanguage.id,
            language: englishLanguage,
            title: 'Existing title',
            description: 'Existing description',
            translationStatus: TranslationStatus.Relevant,
        },
    ],
    mainAboutUs: {
        id: 10,
        title: 'Про нас',
        description: 'Опис про нас',
        localizations: [],
    },
    mainPartners: {
        id: 20,
        title: 'Партнери',
        description: 'Опис партнерів',
        localizations: [
            {
                languageId: englishLanguage.id,
                language: englishLanguage,
                title: 'Existing partners title',
                description: 'Existing partners description',
                translationStatus: TranslationStatus.Relevant,
            },
        ],
    },
    impactStatistics: null,
};

const renderTranslateHook = (overrides?: Partial<Parameters<typeof useTranslateMainPageBlock>[0]>) => {
    const onSuccess = jest.fn();
    const utils = renderHook(() =>
        useTranslateMainPageBlock({
            page,
            block: MainPageLocalizationBlock.Title,
            language: englishLanguage,
            onSuccess,
            ...overrides,
        }),
    );

    return { ...utils, onSuccess };
};

describe('useTranslateMainPageBlock', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(axios, 'isAxiosError').mockReturnValue(false);
        (MainPageLocalizationsApi.create as jest.Mock).mockResolvedValue({});
        (MainPageLocalizationsApi.update as jest.Mock).mockResolvedValue({});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('does nothing when required params are missing', async () => {
        const { result } = renderTranslateHook({ page: null });

        await act(async () => {
            await result.current.translateMainPageBlock({ title: 'Title', description: 'Description' });
        });

        expect(MainPageLocalizationsApi.getByLanguageId).not.toHaveBeenCalled();
        expect(MainPageLocalizationsApi.create).not.toHaveBeenCalled();
        expect(MainPageLocalizationsApi.update).not.toHaveBeenCalled();
    });

    it('sets error when block entity id is missing', async () => {
        const { result } = renderTranslateHook({
            page: { ...page, mainAboutUs: null },
            block: MainPageLocalizationBlock.AboutUs,
        });

        await act(async () => {
            await result.current.translateMainPageBlock({ title: 'Title', description: 'Description' });
        });

        await waitFor(() => expect(result.current.error).toBe('Помилка збереження перекладу'));
        expect(MainPageLocalizationsApi.getByLanguageId).not.toHaveBeenCalled();
    });

    it('creates localization for missing language localization and preserves known values', async () => {
        jest.spyOn(axios, 'isAxiosError').mockReturnValue(true);
        (MainPageLocalizationsApi.getByLanguageId as jest.Mock).mockRejectedValue({ response: { status: 404 } });
        const { result, onSuccess } = renderTranslateHook({ block: MainPageLocalizationBlock.Partners });

        await act(async () => {
            await result.current.translateMainPageBlock({
                title: 'New partners title',
                description: 'New partners description',
            });
        });

        expect(MainPageLocalizationsApi.create).toHaveBeenCalledWith(
            expect.any(Object),
            expect.objectContaining({
                entityId: page.id,
                languageId: englishLanguage.id,
                title: 'Existing title',
                description: 'Existing description',
                mainPartners: {
                    entityId: 20,
                    title: 'New partners title',
                    description: 'New partners description',
                },
            }),
        );
        expect(onSuccess).toHaveBeenCalled();
    });

    it('preserves existing values from API-shaped localizationInfoDto localizations', async () => {
        jest.spyOn(axios, 'isAxiosError').mockReturnValue(true);
        (MainPageLocalizationsApi.getByLanguageId as jest.Mock).mockRejectedValue({ response: { status: 404 } });

        const { result } = renderTranslateHook({
            block: MainPageLocalizationBlock.AboutUs,
            page: {
                ...page,
                localizations: [
                    {
                        entityId: 1,
                        localizationInfoDto: englishLanguage,
                        title: '<p>Horses with healing experience</p>',
                        description: 'When body and soul recover, true strength is born.',
                        translationStatus: TranslationStatus.Relevant,
                    } as any,
                ],
                mainPartners: {
                    ...page.mainPartners!,
                    localizations: [
                        {
                            entityId: 20,
                            localizationInfoDto: englishLanguage,
                            title: 'The Foundation’s trusted partners',
                            description: '<p>The organisations and benefactors.</p>',
                            translationStatus: TranslationStatus.Relevant,
                        } as any,
                    ],
                },
            },
        });

        await act(async () => {
            await result.current.translateMainPageBlock({
                title: 'About us and who we are',
                description: 'Victory Centre is a safe space.',
            });
        });

        expect(MainPageLocalizationsApi.create).toHaveBeenCalledWith(
            expect.any(Object),
            expect.objectContaining({
                title: '<p>Horses with healing experience</p>',
                description: 'When body and soul recover, true strength is born.',
                mainAboutUs: {
                    entityId: 10,
                    title: 'About us and who we are',
                    description: 'Victory Centre is a safe space.',
                },
                mainPartners: {
                    entityId: 20,
                    title: 'The Foundation’s trusted partners',
                    description: '<p>The organisations and benefactors.</p>',
                },
            }),
        );
    });

    it('treats zero entity ids as valid ids', async () => {
        jest.spyOn(axios, 'isAxiosError').mockReturnValue(true);
        (MainPageLocalizationsApi.getByLanguageId as jest.Mock).mockRejectedValue({ response: { status: 404 } });
        const { result } = renderTranslateHook({
            page: {
                ...page,
                id: 0,
                mainAboutUs: {
                    ...page.mainAboutUs!,
                    id: 0,
                },
            },
            block: MainPageLocalizationBlock.AboutUs,
        });

        await act(async () => {
            await result.current.translateMainPageBlock({
                title: 'New about title',
                description: 'New about description',
            });
        });

        expect(MainPageLocalizationsApi.create).toHaveBeenCalledWith(
            expect.any(Object),
            expect.objectContaining({
                entityId: 0,
                mainAboutUs: {
                    entityId: 0,
                    title: 'New about title',
                    description: 'New about description',
                },
            }),
        );
    });

    it('sets error and rethrows when loading current localization fails with non-404', async () => {
        (MainPageLocalizationsApi.getByLanguageId as jest.Mock).mockRejectedValue(new Error('failed'));
        const { result } = renderTranslateHook();
        let caughtError: unknown;

        await act(async () => {
            try {
                await result.current.translateMainPageBlock({ title: 'Title', description: 'Description' });
            } catch (error) {
                caughtError = error;
            }
        });

        expect(caughtError).toEqual(new Error('failed'));
        await waitFor(() => expect(result.current.error).toBe('Помилка збереження перекладу'));
    });

    it('sets error and rethrows when save fails', async () => {
        jest.spyOn(axios, 'isAxiosError').mockReturnValue(true);
        (MainPageLocalizationsApi.getByLanguageId as jest.Mock).mockRejectedValue({ response: { status: 404 } });
        (MainPageLocalizationsApi.create as jest.Mock).mockRejectedValue(new Error('save failed'));
        const { result } = renderTranslateHook();
        let caughtError: unknown;

        await act(async () => {
            try {
                await result.current.translateMainPageBlock({ title: 'Title', description: 'Description' });
            } catch (error) {
                caughtError = error;
            }
        });

        expect(caughtError).toEqual(new Error('save failed'));
        await waitFor(() => expect(result.current.error).toBe('Помилка збереження перекладу'));
    });
});
