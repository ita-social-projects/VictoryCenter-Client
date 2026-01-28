import { useCallback, useEffect, useState } from 'react';
import { LocalizationLanguage, TranslationStatusFilter } from '@/types/common/language';
import { localizationLanguagesDataFetch } from '@/services/api/public/localization/languages/languages-api';
import axios from 'axios';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { DEFAULT_LOCALE } from '@/const/common/locales';

export interface UseLocalizationToolkitProps<TError> {
    setErrorState: (message: string, type: TError) => void;
}

export function useLocalizationToolkit<TError>({ setErrorState }: UseLocalizationToolkitProps<TError>) {
    const [allLanguages, setAllLanguages] = useState<LocalizationLanguage[]>([]);
    const [translationLanguages, setTranslationLanguages] = useState<LocalizationLanguage[]>([]);
    const [selectedLanguage, setSelectedLanguage] = useState<LocalizationLanguage>();
    const [translationStatusFilter, setTranslationStatusFilter] = useState<TranslationStatusFilter | undefined>();

    const onLanguageChange = useCallback((language: LocalizationLanguage) => {
        setSelectedLanguage(language);
    }, []);

    const onTranslationStatusFilterChange = useCallback((translationStatus: TranslationStatusFilter | undefined) => {
        setTranslationStatusFilter(translationStatus);
    }, []);

    const fetchLanguages = useCallback(async () => {
        try {
            const fetchedLanguages = await localizationLanguagesDataFetch();
            setAllLanguages(fetchedLanguages);
            const defaultLang =
                fetchedLanguages.find((language) => language.code === DEFAULT_LOCALE) ?? fetchedLanguages[0];
            setSelectedLanguage(defaultLang);
            setTranslationLanguages(fetchedLanguages.filter((language) => language.code !== DEFAULT_LOCALE));
        } catch (error: any) {
            if (axios.isCancel?.(error) || error.name === 'CanceledError' || error.name === 'AbortError') {
                return;
            }

            setErrorState(
                COMMON_TEXT_ADMIN.LOCALIZATION.LANGUAGES.MESSAGE.FAILED_TO_FETCH_LANGUAGES,
                'languages' as TError,
            );
        }
    }, [setErrorState]);

    const retryFetchLanguages = () => {
        return fetchLanguages();
    };

    useEffect(() => {
        fetchLanguages();
    }, [fetchLanguages]);

    return {
        allLanguages,
        translationLanguages,
        selectedLanguage,
        onLanguageChange,
        translationStatusFilter,
        onTranslationStatusFilterChange,
        retryFetchLanguages,
    };
}
