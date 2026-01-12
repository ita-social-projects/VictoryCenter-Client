import './PublicLayout.scss';
import { useLocation, Outlet, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Header } from '@/components/public/header/Header';
import { Footer } from '@/components/public/footer/Footer';
import { useLocale } from '@/hooks/common/use-locale/useLocale';
import { DEFAULT_LOCALE, LOCALES } from '@/const/common/locales';

export const PublicLayout = ({ behavior = 'auto' }: { behavior?: 'auto' | 'smooth' }) => {
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

    //TODO: temp fix for issue when after redirecting view area would not be on top
    useEffect(() => {
        window.scrollTo({
            top: 0,
            behavior: behavior,
        });
    }, [pathname, behavior]);

    return (
        <div className="public-layout">
            <div className="header-container">
                <Header />
            </div>
            <div className="page-container">
                <Outlet />
            </div>
            <div className="footer-container">
                <Footer />
            </div>
        </div>
    );
};
