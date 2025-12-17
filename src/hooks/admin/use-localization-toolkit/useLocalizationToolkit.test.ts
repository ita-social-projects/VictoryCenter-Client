import { renderHook, waitFor, act } from '@testing-library/react';
import axios from 'axios';
import { useLocalizationToolkit } from './useLocalizationToolkit';
import { COMMON_TEXT_ADMIN } from '../../../const/admin/common';
import { DEFAULT_LOCALE } from '../../../const/common/locales';
import { localizationLanguagesDataFetch } from '../../../services/api/public/localization/languages/languages-api';
import { TranslationStatusFilter } from '../../../types/common/language';

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
        jest.clearAllMocks();
        mockedAxios.isCancel = jest.fn().mockReturnValue(false) as any;
    });

    it('should initialize with default state', () => {
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

        await waitFor(() => expect(result.current.allLanguages.length).toBeGreaterThan(0));

        expect(result.current.allLanguages).toEqual(languagesMock);
        const defaultLang = languagesMock.find((l) => l.code === DEFAULT_LOCALE);
        expect(result.current.selectedLanguage).toEqual(defaultLang);
        expect(result.current.translationLanguages).toEqual(languagesMock.filter((l) => l.code !== DEFAULT_LOCALE));
    });

    it('should call setErrorState when fetch fails', async () => {
        mockedFetch.mockRejectedValue(new Error('Network error'));

        renderHook(() =>
            useLocalizationToolkit({
                setErrorState: mockSetErrorState,
            }),
        );

        await waitFor(() =>
            expect(mockSetErrorState).toHaveBeenCalledWith(
                COMMON_TEXT_ADMIN.LOCALIZATION.LANGUAGES.MESSAGE.FAILED_TO_FETCH_LANGUAGES,
                'languages',
            ),
        );
    });

    it('should ignore canceled error', async () => {
        mockedFetch.mockRejectedValue({ name: 'CanceledError' });

        renderHook(() =>
            useLocalizationToolkit({
                setErrorState: mockSetErrorState,
            }),
        );

        await new Promise((resolve) => setTimeout(resolve, 50));

        expect(mockSetErrorState).not.toHaveBeenCalled();
    });

    it('should update selected language via onLanguageChange', async () => {
        mockedFetch.mockResolvedValue(languagesMock);

        const { result } = renderHook(() =>
            useLocalizationToolkit({
                setErrorState: mockSetErrorState,
            }),
        );

        await waitFor(() => expect(result.current.allLanguages.length).toBeGreaterThan(0));

        act(() => {
            result.current.onLanguageChange(languagesMock[2]);
        });

        expect(result.current.selectedLanguage).toEqual(languagesMock[2]);
    });

    it('should update translation status filter via onTranslationStatusFilterChange', () => {
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
        mockedFetch.mockResolvedValue([
            { id: 2, code: 'en', name: 'Англійська' },
            { id: 3, code: 'es', name: 'Іспанська' },
        ]);

        const { result } = renderHook(() =>
            useLocalizationToolkit({
                setErrorState: mockSetErrorState,
            }),
        );

        await waitFor(() => expect(result.current.allLanguages.length).toBeGreaterThan(0));

        expect(result.current.selectedLanguage).toEqual({
            id: 2,
            code: 'en',
            name: 'Англійська',
        });
    });
});
