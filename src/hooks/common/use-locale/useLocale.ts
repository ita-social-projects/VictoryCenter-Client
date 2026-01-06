import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';

export const useLocale = () => {
    const { i18n } = useTranslation();
    const navigate = useNavigate();
    const { pathname, search } = useLocation();

    const currentLang = i18n.resolvedLanguage ?? i18n.language;

    const changeLanguage = async (newLng: string) => {
        if (newLng === currentLang) return;

        await i18n.changeLanguage(newLng);

        const cleanPath = pathname.startsWith('/en') ? pathname.replace(/^\/en/, '') : pathname;

        let newPath = '';
        if (newLng === 'en') {
            newPath = `/en${cleanPath === '/' ? '' : cleanPath}`;
        } else {
            newPath = cleanPath || '/';
        }

        navigate(`${newPath}${search}`, { replace: true });
    };

    return {
        currentLanguage: currentLang,
        changeLanguage,
        isUk: currentLang === 'uk',
        isEn: currentLang === 'en',
        i18n,
    };
};
