import { Footer } from '../../components/public/footer/Footer';
import { Header } from '../../components/public/header/Header';
import { useLocation, Outlet } from 'react-router-dom';
import { useEffect } from 'react';

export const MainLayout = ({ behavior = 'auto' }: { behavior?: 'auto' | 'smooth' }) => {
    const pathname = useLocation().pathname;

    //TODO: temp fix for issue when after redirecting view area would not be on top
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
