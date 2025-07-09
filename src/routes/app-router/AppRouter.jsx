import React from 'react';

import {BrowserRouter, Routes, Route} from 'react-router-dom';
import {MainLayout} from '../../layouts/main-layout/MainLayout';

import {AdminPage} from '../../pages/admin/AdminPage';

import { HomePage } from '../../pages/user-pages/home/HomePage';
import { TeamPage } from '../../pages/user-pages/team-page/TeamPage';

import { NotFound } from '../../pages/not-found/NotFound';
import {ProgramPage} from "../../pages/program-page/ProgramPage";

import {routes} from '../../const/routers/routes';
import {AdminLayout} from "../../layouts/admin-layout/AdminLayout";
import {TeamPageAdmin} from "../../pages/admin/team/TeamPage";

import {AboutUsPage} from "../../pages/about-us-page/AboutUsPage";

const { programPage, adminRoutes,aboutUsRoute,
    userPageRoutes: { teamPageRoute, page2Route } } = routes;

export const AppRouter = () => (
    <BrowserRouter>
        <Routes>
            <Route path="/" element={<MainLayout/>}>
                <Route index element={<HomePage/>}/>
                <Route path={teamPageRoute} element={<TeamPage />} />
                <Route path={page2Route} element={<ProgramPage/>}/>
                <Route path={programPage} element={<ProgramPage />} />
                <Route path="*" element={<NotFound/>}/>
            </Route>

            <Route path={adminRoutes.adminRoute} element={<AdminLayout/>}>
                <Route index element={<AdminPage/>}/>
                <Route path={adminRoutes.teamSubRoute} element={<TeamPageAdmin/>}/>
                <Route path={adminRoutes.testSubRoute} element={<div>hello</div>}></Route>
            </Route>
        </Routes>
    </BrowserRouter>
  );
