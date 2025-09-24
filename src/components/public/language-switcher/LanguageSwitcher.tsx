import React from 'react';
import '../../../i18n';
import { useTranslation } from 'react-i18next';
import { Select } from '../../common/select/Select';
import { languages } from '../../../const/common/languages';
import './LanguageSwitcher.scss';

export const LanguageSwitcher: React.FC = () => {
    const { i18n } = useTranslation();

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
    };

    return (
        <Select<string>
            value={i18n.language}
            onValueChange={changeLanguage}
            className="language-switcher"
            data-testid="language-switcher"
        >
            {languages.map((lng) => (
                <Select.Option key={lng.code} value={lng.code} name={lng.name} />
            ))}
        </Select>
    );
};

export default LanguageSwitcher;
