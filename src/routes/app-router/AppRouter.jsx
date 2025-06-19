import React from 'react';

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MainLayout } from '../../layouts/main-layout/MainLayout';

import { AdminPage } from '../../pages/admin/AdminPage';

import { HomePage } from '../../pages/user-pages/home/HomePage';
import { Page1 } from '../../pages/user-pages/page1/Page1';

import { NotFound } from '../../pages/not-found/NotFound';
import {ProgramPage} from "../../pages/program-page/ProgramPage";

import { routes } from '../../const/routers/routes';

const { programPage, adminRoute, userPageRoutes: { page1Route, page2Route } } = routes;

export const AppRouter = () => (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path={adminRoute} element={<AdminPage />} />
          <Route path={page1Route} element={<Page1 />} />
          <Route path={page2Route} element={<ProgramPage />} />
          <Route path={programPage} element={<ProgramPage />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
