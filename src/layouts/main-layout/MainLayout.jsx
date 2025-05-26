import { Outlet } from 'react-router-dom';

import { Header } from '../../components/header/Header';

export const MainLayout = () => (
  <div>
    <div className="header-container">
      <Header />
    </div>
    <div className="page-container">
      <Outlet />
    </div>
  </div>
);
