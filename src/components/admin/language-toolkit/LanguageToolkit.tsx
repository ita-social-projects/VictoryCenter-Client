import { useCallback, useEffect, useState, useRef } from 'react';
import { LOCALIZATION_TEXT } from '@/const/admin/localization';
import { DEFAULT_LOCALE } from '@/const/common/locales';
import { Select } from '@/components/common/select/Select';
import { ReactComponent as GlobeIcon } from '@/assets/icons/globe.svg';
import { LocalizationLanguage } from '@/types/common/language';
import styles from './LanguageToolkit.module.scss';

export interface LanguageToolkitProps {
    languages: LocalizationLanguage[];
    onLanguageChange: (language: LocalizationLanguage) => void;
}

export const LanguageToolkit = ({ languages, onLanguageChange }: LanguageToolkitProps) => {
    const [selectedLanguage, setSelectedLanguage] = useState<LocalizationLanguage | null>(null);

    const onLanguageChangeRef = useRef(onLanguageChange);
    onLanguageChangeRef.current = onLanguageChange;

    const changeLanguage = useCallback((language: LocalizationLanguage) => {
        setSelectedLanguage(language);
        onLanguageChangeRef.current(language);
    }, []);

    useEffect(() => {
        if (!languages.length) {
            return;
        }
        const defaultLanguage = languages.find((language) => language.code === DEFAULT_LOCALE) || languages[0];
        changeLanguage(defaultLanguage);
    }, [languages, changeLanguage]);

    return (
        <div className={styles.toolkit} data-testid="language-toolkit">
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
        </div>
    );
};
