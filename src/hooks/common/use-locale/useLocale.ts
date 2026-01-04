import { useTranslation } from 'react-i18next';

export const useLocale = () => {
    const { i18n } = useTranslation();

    const currentLang = i18n.resolvedLanguage || i18n.language;
    const changeLocaleLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
    };

    return {
        currentLanguage: currentLang,
        changeLocaleLanguage,
        isUk: currentLang === 'uk',
        isEn: currentLang === 'en',
    };
};
