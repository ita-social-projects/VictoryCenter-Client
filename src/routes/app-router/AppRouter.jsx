import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MainLayout } from '../../layouts/main-layout/MainLayout';

import { AdminPage } from '../../pages/admin/AdminPage';

import { TeamPage } from '../../pages/user-pages/team-page/TeamPage';

import { NotFound } from '../../pages/not-found/NotFound';
import { ProgramPage } from '../../pages/program-page/ProgramPage';

import { AboutUsPage } from '../../pages/about-us-page/AboutUsPage';
import { AdminLayout } from '../../layouts/admin-layout/AdminLayout';
import { TeamPageAdmin } from '../../pages/admin/team/TeamPage';
import { ProgramsPageAdmin } from '../../pages/admin/programs/ProgramsPageAdmin';

import { LoginPage } from '../../pages/login/LoginPage';
import { AdminContextWrapper } from '../../components/admin/admin-context-wrapper/AdminContextWrapper';

import { PrivateRoute } from '../../components/admin/private-route/PrivateRoute';
import { PublicRoute } from '../../components/admin/public-route/PublicRoute';
import { publicRoutes } from '../../const/routes/public-routes';
import { adminRoutes } from '../../const/routes/admin-routes';

export const AppRouter = () => (
    <BrowserRouter>
        <Routes>
            <Route path="/" element={<MainLayout />}>
                <Route index element={<AboutUsPage />} />
                <Route path={publicRoutes.TEAM.FULL} element={<TeamPage />} />
                <Route path={publicRoutes.PROGRAMS.FULL} element={<ProgramPage />} />
                <Route path={publicRoutes.ABOUT_US.FULL} element={<AboutUsPage />} />
                <Route path="*" element={<NotFound />} />
            </Route>

            <Route element={<AdminContextWrapper />}>
                <Route element={<PublicRoute />}>
                    <Route path={adminRoutes.LOGIN.FULL} element={<LoginPage />} />
                </Route>

                <Route element={<PrivateRoute />}>
                    <Route path={adminRoutes.ROOT} element={<AdminLayout />}>
                        <Route index element={<AdminPage />} />
                        <Route path={adminRoutes.TEAM.PATH} element={<TeamPageAdmin />} />
                        <Route path={adminRoutes.PROGRAMS.PATH} element={<ProgramsPageAdmin />} />
                    </Route>
                </Route>
            </Route>
        </Routes>
    </BrowserRouter>
);
