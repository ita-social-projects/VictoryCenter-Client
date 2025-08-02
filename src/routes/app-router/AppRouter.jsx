import { BrowserRouter, Routes, Route } from 'react-router';

import { AdminPage } from '../../pages/admin/AdminPage';

import { TeamPage } from '../../pages/public/team-page/TeamPage';

import { NotFound } from '../../pages/public/not-found/NotFound';
import { ProgramPage } from '../../pages/public/program-page/ProgramPage';

import { AdminLayout } from '../../layouts/admin-layout/AdminLayout';
import { PublicLayout } from '../../layouts/public-layout/PublicLayout';
import { TeamPageAdmin } from '../../pages/admin/team/TeamPage';
import { ProgramsPageAdmin } from '../../pages/admin/programs/ProgramsPageAdmin';

import { LoginPage } from '../../pages/login/LoginPage';
import { AdminContextWrapper } from '../../components/admin/admin-context-wrapper/AdminContextWrapper';

import { PrivateRoute } from '../../components/admin/private-route/PrivateRoute';
import { PublicRoute } from '../../components/admin/public-route/PublicRoute';
import { PUBLIC_ROUTES } from '../../const/public/routes';
import { ADMIN_ROUTES } from '../../const/admin/routes';
import { AboutUsPage } from '../../pages/public/about-us-page/AboutUsPage';

export const AppRouter = () => (
    <BrowserRouter>
        <Routes>
            <Route path="/" element={<PublicLayout />}>
                <Route index element={<AboutUsPage />} />
                <Route path={PUBLIC_ROUTES.TEAM.FULL} element={<TeamPage />} />
                <Route path={PUBLIC_ROUTES.PROGRAMS.FULL} element={<ProgramPage />} />
                <Route path={PUBLIC_ROUTES.ABOUT_US.FULL} element={<AboutUsPage />} />
                <Route path={PUBLIC_ROUTES.DONATE.FULL} element={<DonatePage />} />
                <Route path="*" element={<NotFound />} />
            </Route>

            <Route element={<AdminContextWrapper />}>
                <Route element={<PublicRoute />}>
                    <Route path={ADMIN_ROUTES.LOGIN.FULL} element={<LoginPage />} />
                </Route>

                <Route element={<PrivateRoute />}>
                    <Route path={ADMIN_ROUTES.ROOT} element={<AdminLayout />}>
                        <Route index element={<AdminPage />} />
                        <Route path={ADMIN_ROUTES.TEAM.PATH} element={<TeamPageAdmin />} />
                        <Route path={ADMIN_ROUTES.PROGRAMS.PATH} element={<ProgramsPageAdmin />} />
                    </Route>
                </Route>
            </Route>
        </Routes>
    </BrowserRouter>
);
