import { useEffect } from 'react';
import { useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useLocale } from '@/hooks/common/use-locale/useLocale';
import { DEFAULT_LOCALE, LOCALES } from '@/const/common/locales';

export const LanguageSyncWrapper = () => {
    const { pathname, search } = useLocation();
    const navigate = useNavigate();
    const { currentLanguage, i18n } = useLocale();

    useEffect(() => {
        const segments = pathname.split('/').filter(Boolean);
        const langInUrl = segments[0];
        const isSupported = LOCALES.includes(langInUrl);
        const currentLang = currentLanguage;

        if (isSupported && langInUrl !== currentLang) {
            i18n.changeLanguage(langInUrl);
            return;
        }

        if (isSupported) return;

        if (pathname === '/') {
            if (currentLang !== DEFAULT_LOCALE) {
                i18n.changeLanguage(DEFAULT_LOCALE);
            }
            return;
        }

        if (currentLang === DEFAULT_LOCALE) return;

        navigate(`/${currentLang}${pathname}${search}`, { replace: true });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pathname, search, navigate, i18n]);

    return <Outlet />;
};
