import { Outlet } from 'react-router-dom';

import { Header } from '../../components/header/Header';
import { Footer } from '../../components/footer/Footer';

import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';

export const MainLayout = ({ behavior = 'auto' }: { behavior?: 'auto' | 'smooth' }) => {
    const pathname = useLocation().pathname;

    useEffect(() => {
        window.scrollTo({
            top: 0,
            behavior: behavior,
        });
    }, [pathname, behavior]);

    return (
        <div>
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
