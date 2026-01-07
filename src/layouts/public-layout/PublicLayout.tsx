import './PublicLayout.scss';
import { useLocation, Outlet, useSearchParams } from 'react-router-dom';
import { useEffect } from 'react';
import { Header } from '@/components/public/header/Header';
import { Footer } from '@/components/public/footer/Footer';
import { useTranslation } from 'react-i18next';

export const PublicLayout = ({ behavior = 'auto' }: { behavior?: 'auto' | 'smooth' }) => {
    const pathname = useLocation().pathname;
    const [searchParams] = useSearchParams();
    const { i18n } = useTranslation();

    useEffect(() => {
        const langParam = searchParams.get('lang');

        if (langParam === 'en' && i18n.language !== 'en') {
            i18n.changeLanguage('en');
        } else if (!langParam && i18n.language !== 'uk') {
            i18n.changeLanguage('uk');
        }
    }, [searchParams, i18n]);
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
