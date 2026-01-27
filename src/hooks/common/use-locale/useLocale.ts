import { DEFAULT_LOCALE, LOCALES } from '@/const/common/locales';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';

export const useLocale = () => {
    const { i18n } = useTranslation();
    const navigate = useNavigate();
    const { pathname, search } = useLocation();

    const currentLang = i18n.resolvedLanguage ?? i18n.language;

    const changeLanguage = (newLng: string) => {
        if (newLng === currentLang) return;

        i18n.changeLanguage(newLng);

        const segments = pathname.split('/').filter(Boolean);

        if (LOCALES.includes(segments[0])) {
            segments.shift();
        }

        let newPath = '';
        if (newLng === DEFAULT_LOCALE) {
            newPath = `/${segments.join('/')}`;
        } else {
            newPath = `/${newLng}/${segments.join('/')}`;
        }

        const finalPath = newPath.replace(/\/$/, '') || '/';

        navigate(`${finalPath}${search}`, { replace: true });
    };

    return {
        currentLanguage: currentLang,
        changeLanguage,
        isUk: currentLang === 'uk',
        isEn: currentLang === 'en',
        i18n,
    };
};
