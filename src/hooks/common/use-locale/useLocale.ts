import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';

export const useLocale = () => {
    const { i18n } = useTranslation();
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const [searchParams] = useSearchParams();

    const currentLang = i18n.resolvedLanguage ?? i18n.language;
    const changeLanguage = (newLng: string) => {
        if (newLng === currentLang) return;

        const params = new URLSearchParams(searchParams);

        if (newLng === 'en') {
            params.set('lang', 'en');
        } else {
            params.delete('lang');
        }

        const queryString = params.toString();
        const newUrl = `${pathname}${queryString ? `?${queryString}` : ''}`;

        i18n.changeLanguage(newLng);
        navigate(newUrl, { replace: true });
    };

    return {
        currentLanguage: currentLang,
        changeLanguage,
        isUk: currentLang === 'uk',
        isEn: currentLang === 'en',
    };
};
