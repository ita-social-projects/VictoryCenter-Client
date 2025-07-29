import { Outlet } from 'react-router-dom';

import { Header } from '../../components/public/header/Header';
import { Footer } from '../../components/public/footer/Footer';

export const MainLayout = () => (
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
