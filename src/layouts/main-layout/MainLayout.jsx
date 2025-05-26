import { Outlet } from 'react-router-dom';

import { Navigation } from '../../components/navigation/Navigation';
import { Footer } from '../../components/footer/Footer';

export const MainLayout = () => (
  <div>
    <div className="navigation-container">
      <Navigation />
    </div>
    <div className="page-container">
      <Outlet />
    </div>
    <div className="footer-container">
      <Footer />
    </div>
  </div>
);
