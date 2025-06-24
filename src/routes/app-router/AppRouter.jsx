import React from 'react';

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MainLayout } from '../../layouts/main-layout/MainLayout';

import { AdminPage } from '../../pages/admin/AdminPage';

import { HomePage } from '../../pages/user-pages/home/HomePage';
import { TeamPage } from '../../pages/user-pages/team-page/TeamPage';
import { Page2 } from '../../pages/user-pages/page2/Page2';

import { NotFound } from '../../pages/not-found/NotFound';

import { routes } from '../../const/routers/routes';

const { adminRoute, userPageRoutes: { teamPageRoute, page2Route } } = routes;

export const AppRouter = () => (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path={adminRoute} element={<AdminPage />} />
          <Route path={teamPageRoute} element={<TeamPage />} />
          <Route path={page2Route} element={<Page2 />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
