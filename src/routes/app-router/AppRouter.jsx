import React from 'react';

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MainLayout } from '../../layouts/main-layout/MainLayout';

import { AdminPage } from '../../pages/admin/AdminPage';

import { HomePage } from '../../pages/user-pages/home/HomePage';
import { TeamPage } from '../../pages/user-pages/team-page/TeamPage';

import { NotFound } from '../../pages/not-found/NotFound';
import { ProgramPage } from '../../pages/program-page/ProgramPage';

import { routes } from '../../const/routers/routes';
import { AdminLayout } from '../../layouts/admin-layout/AdminLayout';
import { TeamPageAdmin } from '../../pages/admin/team/TeamPage';

import { LoginPage } from '../../pages/login/LoginPage';
import { AdminContextWrapper } from '../../components/admin/admin-context-wrapper/AdminContextWrapper';

import { PrivateRoute } from '../../components/admin/private-route/PrivateRoute';
import { PublicRoute } from '../../components/admin/public-route/PublicRoute';

const {
    programPage,
    adminRoutes,
    userPageRoutes: { teamPageRoute, page2Route },
} = routes;

export const AppRouter = () => (
    <BrowserRouter>
        <Routes>
            <Route path="/" element={<MainLayout />}>
                <Route index element={<HomePage />} />
                <Route path={teamPageRoute} element={<TeamPage />} />
                <Route path={page2Route} element={<ProgramPage />} />
                <Route path={programPage} element={<ProgramPage />} />
                <Route path="*" element={<NotFound />} />
            </Route>

            <Route element={<AdminContextWrapper />}>
                <Route element={<PublicRoute />}>
                    <Route path={adminRoutes.loginRoute} element={<LoginPage />} />
                </Route>

                <Route element={<PrivateRoute />}>
                    <Route path={adminRoutes.adminRoute} element={<AdminLayout />}>
                        <Route index element={<AdminPage />} />
                        <Route path={adminRoutes.teamSubRoute} element={<TeamPageAdmin />} />
                    </Route>
                </Route>
            </Route>
        </Routes>
    </BrowserRouter>
);
