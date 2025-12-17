import { useCallback, useEffect, useState } from 'react';
import { ReactComponent as GlobeIcon } from '@/assets/icons/globe.svg';
import styles from './LocalizationToolkit.module.scss';
import { DEFAULT_LOCALE } from '../../../const/common/locales';
import { LocalizationLanguage, TranslationStatusFilter } from '../../../types/common/language';
import { Select } from '../../common/select/Select';
import { LOCALIZATION_TEXT } from '../../../const/admin/localization';
import { mapLabelToTranslationStatusFilter } from '../../../utils/functions/mappers/admin/localization-status/localization-status-mappers';

export interface LocalizationToolkitProps {
    languages: LocalizationLanguage[];
    onLanguageChange: (language: LocalizationLanguage) => void;
    onTranslationStatusFilterChange: (translationFilter: TranslationStatusFilter | undefined) => void;
}

export const LocalizationToolkit = ({
    languages,
    onLanguageChange,
    onTranslationStatusFilterChange,
}: LocalizationToolkitProps) => {
    const [selectedLanguage, setSelectedLanguage] = useState<LocalizationLanguage | null>(null);
    const [selectedTranslationStatus, setSelectedTranslationStatus] = useState<TranslationStatusFilter>(
        TranslationStatusFilter.All,
    );

    const changeLanguage = useCallback(
        (language: LocalizationLanguage) => {
            setSelectedLanguage(language);
            onLanguageChange(language);
        },
        [onLanguageChange],
    );

    const changeTranslationStatus = useCallback(
        (translationFilter: TranslationStatusFilter) => {
            setSelectedTranslationStatus(translationFilter);
            onTranslationStatusFilterChange(translationFilter);
        },
        [onTranslationStatusFilterChange],
    );

    useEffect(() => {
        if (!languages.length) {
            return;
        }
        const defaultLanguage = languages.find((language) => language.code === DEFAULT_LOCALE) || languages[0];
        changeLanguage(defaultLanguage);
        changeTranslationStatus(TranslationStatusFilter.All);
    }, [languages, changeLanguage, changeTranslationStatus]);

    return (
        <div className={styles.toolkit} data-testid="localization-toolkit">
            {selectedLanguage && (
                <Select<LocalizationLanguage>
                    value={selectedLanguage}
                    onValueChange={changeLanguage}
                    placeholder={LOCALIZATION_TEXT.LANGUAGE}
                    icon={GlobeIcon}
                >
                    {languages.map((language) => (
                        <Select.Option key={language.id} value={language} name={language.name} />
                    ))}
                </Select>
            )}
            <Select<TranslationStatusFilter>
                value={selectedTranslationStatus}
                onValueChange={changeTranslationStatus}
                placeholder={LOCALIZATION_TEXT.TRANSLATIONS}
            >
                {Object.entries(LOCALIZATION_TEXT.FILTER.STATUS).map(([, value], index) => (
                    <Select.Option key={index} value={mapLabelToTranslationStatusFilter(value)} name={value} />
                ))}
            </Select>
        </div>
    );
};
