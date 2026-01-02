import { useTranslation } from 'react-i18next';

export const useLocale = () => {
    const { i18n } = useTranslation();

    const changeLocaleLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
    };

    return {
        currentLanguage: i18n.language,
        changeLocaleLanguage,
        isUk: i18n.language === 'uk',
        isEn: i18n.language === 'en',
        i18n,
    };
};
