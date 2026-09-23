import { renderHook, waitFor, act } from '@testing-library/react';
import axios from 'axios';
import { useLocalizationToolkit } from './useLocalizationToolkit';
import { localizationLanguagesDataFetch } from '@/services/api/public/localization/languages/languages-api';
import { DEFAULT_LOCALE } from '@/const/common/locales';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { TranslationStatusFilter } from '@/types/common/language';

jest.mock('../../../services/api/public/localization/languages/languages-api');
jest.mock('axios');

const mockedFetch = localizationLanguagesDataFetch as jest.MockedFunction<typeof localizationLanguagesDataFetch>;
const mockedAxios = axios as jest.Mocked<typeof axios>;

const mockSetErrorState = jest.fn();

const languagesMock = [
    { id: 1, code: DEFAULT_LOCALE, name: 'Українська' },
    { id: 2, code: 'en', name: 'Англійська' },
    { id: 3, code: 'es', name: 'Іспанська' },
];

describe('useLocalizationToolkit', () => {
    beforeEach(() => {
        jest.resetAllMocks();

        mockedAxios.isCancel = jest.fn().mockReturnValue(false) as any;
    });

    it('should initialize with default state', () => {
        mockedFetch.mockReturnValue(new Promise(() => {}));

        const { result } = renderHook(() =>
            useLocalizationToolkit({
                setErrorState: mockSetErrorState,
            }),
        );

        expect(result.current.allLanguages).toEqual([]);
        expect(result.current.translationLanguages).toEqual([]);
        expect(result.current.selectedLanguage).toBeUndefined();
        expect(result.current.translationStatusFilter).toBeUndefined();
    });

    it('should fetch languages and setup states correctly', async () => {
        mockedFetch.mockResolvedValue(languagesMock);

        const { result } = renderHook(() =>
            useLocalizationToolkit({
                setErrorState: mockSetErrorState,
            }),
        );

        await waitFor(() => {
            expect(result.current.allLanguages).toEqual(languagesMock);
        });

        const defaultLang = languagesMock.find((language) => language.code === DEFAULT_LOCALE);

        expect(result.current.selectedLanguage).toEqual(defaultLang);
        expect(result.current.translationLanguages).toEqual(
            languagesMock.filter((language) => language.code !== DEFAULT_LOCALE),
        );
    });

    it('should call setErrorState when fetch fails', async () => {
        mockedFetch.mockRejectedValue(new Error('Network error'));

        renderHook(() =>
            useLocalizationToolkit({
                setErrorState: mockSetErrorState,
            }),
        );

        await waitFor(() => {
            expect(mockSetErrorState).toHaveBeenCalledWith(
                COMMON_TEXT_ADMIN.LOCALIZATION.LANGUAGES.MESSAGE.FAILED_TO_FETCH_LANGUAGES,
                'languages',
            );
        });
    });

    it('should ignore canceled error', async () => {
        const canceledError = Object.assign(new Error('Request canceled'), {
            name: 'CanceledError',
        });

        mockedAxios.isCancel = jest.fn().mockReturnValue(true) as any;
        mockedFetch.mockRejectedValue(canceledError);

        renderHook(() =>
            useLocalizationToolkit({
                setErrorState: mockSetErrorState,
            }),
        );

        await act(async () => {
            await Promise.resolve();
            await Promise.resolve();
        });

        expect(mockSetErrorState).not.toHaveBeenCalled();
    });

    it('should update selected language via onLanguageChange', async () => {
        mockedFetch.mockResolvedValue(languagesMock);

        const { result } = renderHook(() =>
            useLocalizationToolkit({
                setErrorState: mockSetErrorState,
            }),
        );

        await waitFor(() => {
            expect(result.current.allLanguages).toEqual(languagesMock);
        });

        act(() => {
            result.current.onLanguageChange(languagesMock[2]);
        });

        expect(result.current.selectedLanguage).toEqual(languagesMock[2]);
    });

    it('should update translation status filter via onTranslationStatusFilterChange', () => {
        mockedFetch.mockReturnValue(new Promise(() => {}));

        const { result } = renderHook(() =>
            useLocalizationToolkit({
                setErrorState: mockSetErrorState,
            }),
        );

        act(() => {
            result.current.onTranslationStatusFilterChange(TranslationStatusFilter.Outdated);
        });

        expect(result.current.translationStatusFilter).toBe(TranslationStatusFilter.Outdated);
    });

    it('should fallback to first language when DEFAULT_LOCALE not found', async () => {
        const languagesWithoutDefaultLocale = [
            { id: 2, code: 'en', name: 'Англійська' },
            { id: 3, code: 'es', name: 'Іспанська' },
        ];

        mockedFetch.mockResolvedValue(languagesWithoutDefaultLocale);

        const { result } = renderHook(() =>
            useLocalizationToolkit({
                setErrorState: mockSetErrorState,
            }),
        );

        await waitFor(() => {
            expect(result.current.allLanguages).toEqual(languagesWithoutDefaultLocale);
        });

        expect(result.current.selectedLanguage).toEqual({
            id: 2,
            code: 'en',
            name: 'Англійська',
        });

        expect(result.current.translationLanguages).toEqual(languagesWithoutDefaultLocale);
    });
});
