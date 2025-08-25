import React from 'react';
import { useTranslation } from 'react-i18next';

const ENGLISH = 'English';
const UKRAINIAN = 'Українська';

export const LanguageSwitcher: React.FC = () => {
    const { i18n } = useTranslation();

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
    };

    const languageSelectionHandler = (e: React.ChangeEvent<HTMLSelectElement>) => changeLanguage(e.target.value);

    return (
        <select value={i18n.language} onChange={languageSelectionHandler} className="language-switcher">
            <option value="en">{ENGLISH}</option>
            <option value="uk">{UKRAINIAN}</option>
        </select>
    );
};

export default LanguageSwitcher;
