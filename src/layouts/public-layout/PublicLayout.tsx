import './PublicLayout.scss';
import { useLocation, Outlet, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Header } from '@/components/public/header/Header';
import { Footer } from '@/components/public/footer/Footer';
import { useLocale } from '@/hooks/common/use-locale/useLocale';

export const PublicLayout = ({ behavior = 'auto' }: { behavior?: 'auto' | 'smooth' }) => {
    const { pathname, search } = useLocation();
    const navigate = useNavigate();
    const { currentLanguage, i18n } = useLocale();

    useEffect(() => {
        const isEnPath = pathname.startsWith('/en');
        const savedLang = currentLanguage;

        if (savedLang === 'en' && !isEnPath) {
            navigate(`/en${pathname === '/' ? '' : pathname}${search}`, { replace: true });
            return;
        }

        if (isEnPath && savedLang !== 'en') {
            i18n.changeLanguage('en');
        } else if (!isEnPath && savedLang === 'en' && pathname === '/') {
            i18n.changeLanguage('uk');
        }
    }, [pathname, currentLanguage, i18n, navigate, search]);

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
