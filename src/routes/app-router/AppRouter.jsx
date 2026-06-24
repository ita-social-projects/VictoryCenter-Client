import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { NotFound } from '@/pages/public/not-found-page/NotFound';
import { ProgramsPage } from '@/pages/public/programs-page/ProgramsPage';
import { DetailedProgramPage } from '@/pages/public/detailed-program-page/DetailedProgramPage';
import { AdminLayout } from '@/layouts/admin-layout/AdminLayout';
import { PublicLayout } from '@/layouts/public-layout/PublicLayout';
import { TeamPageAdmin } from '@/pages/admin/team/TeamPage';
import { ProgramsPageAdmin } from '@/pages/admin/programs/ProgramsPageAdmin';
import { DonatePageAdmin } from '@/pages/admin/donate/DonatePageAdmin';
import { AdminContextWrapper } from '@/components/admin/admin-context-wrapper/AdminContextWrapper';
import { PUBLIC_ROUTES } from '@/const/public/routes';
import { ADMIN_ROUTES } from '@/const/admin/routes';
import { PrivateRoute } from '@/components/admin/private-route/PrivateRoute';
import { PublicRoute } from '@/components/admin/public-route/PublicRoute';
import { AboutUsPage } from '@/pages/public/about-us-page/AboutUsPage';
import { EventsNewsPage } from '@/pages/public/events-news-page/EventsNewsPage';
import { DetailedEventNewsPage } from '@/pages/public/detailed-event-news-page/DetailedEventNewsPage';
import { DonatePage } from '@/pages/public/donate-page/DonatePage';
import { LoginPage } from '@/pages/admin/login/LoginPage';
import { AdminHomePage } from '@/pages/admin/home/AdminHomePage';
import { TeamPage } from '@/pages/public/team-page/TeamPage';
import { FaqPanel } from '@/pages/admin/faq/FaqPanel';
import { HippotherapyPage } from '@/pages/public/hippotherapy-page/HippotherapyPage';
import { PartnersPage } from '@/pages/public/partners-page/PartnersPage';
import { WhoWeArePageAdmin } from '@/pages/admin/who-we-are/WhoWeArePageAdmin';
import { PartnerPanel } from '@/pages/admin/partners/PartnerPanel';
import { ReportsPage } from '@/pages/public/reports-page';
import { ContactUsPage } from '@/pages/public/contact-us';
import { CompanyProfileContent } from '@/pages/admin/company-profile/components/company-profile-content/CompanyProfileContent';
import { LanguageSyncWrapper } from '@/components/public/language-sync-wrapper/LanguageSyncWrapper';
import { ReportsPanelContent } from '@/pages/admin/reports/components/reports-panel-content/ReportsPanelContent';
import { HistoryPageContent } from '@/pages/admin/history/components/history-page-content/HistoryPageContent';
import { MainPageContent } from '@/pages/admin/main/components/main-page-content/MainPageContent';
import { HistoryPage } from '@/pages/public/history-page/HistoryPage';

export const AppRouter = () => {
    const PublicContent = () => (
        <Routes>
            <Route index element={<AboutUsPage />} />
            <Route path={PUBLIC_ROUTES.TEAM.PATH} element={<TeamPage />} />
            <Route path={PUBLIC_ROUTES.PROGRAMS.PATH} element={<ProgramsPage />} />
            <Route path={PUBLIC_ROUTES.PROGRAM_DETAIL.FULL} element={<DetailedProgramPage />} />
            <Route path={PUBLIC_ROUTES.HIPPOTHERAPY.PATH} element={<HippotherapyPage />} />
            <Route path={PUBLIC_ROUTES.PARTNERS.PATH} element={<PartnersPage />} />
            <Route path={PUBLIC_ROUTES.ABOUT_US.PATH} element={<AboutUsPage />} />
            <Route path={PUBLIC_ROUTES.EVENTS_AND_NEWS.PATH} element={<EventsNewsPage />} />
            <Route path={PUBLIC_ROUTES.EVENTS_NEWS_DETAIL.PATH} element={<DetailedEventNewsPage />} />
            <Route path={PUBLIC_ROUTES.DONATE.PATH} element={<DonatePage />} />
            <Route path={PUBLIC_ROUTES.REPORTS.PATH} element={<ReportsPage />} />
            <Route path={PUBLIC_ROUTES.CONTACT_US.PATH} element={<ContactUsPage />} />
            <Route path={PUBLIC_ROUTES.HISTORY.PATH} element={<HistoryPage />} />
            <Route path="*" element={<NotFound />} />
        </Routes>
    );

    return (
        <BrowserRouter>
            <Routes>
                {/*For EN*/}
                <Route path="/en/*" element={<LanguageSyncWrapper />}>
                    <Route element={<PublicLayout />}>
                        <Route path="*" element={<PublicContent />} />
                    </Route>
                </Route>

                {/*For UA*/}
                <Route path="/*" element={<LanguageSyncWrapper />}>
                    <Route element={<PublicLayout />}>
                        <Route path="*" element={<PublicContent />} />
                    </Route>
                </Route>

                {/*Admin*/}
                <Route element={<AdminContextWrapper />}>
                    <Route element={<PublicRoute />}>
                        <Route path={ADMIN_ROUTES.LOGIN.FULL} element={<LoginPage />} />
                    </Route>
                    <Route element={<PrivateRoute />}>
                        <Route path={ADMIN_ROUTES.ROOT} element={<AdminLayout />}>
                            <Route index element={<AdminHomePage />} />
                            <Route path={ADMIN_ROUTES.TEAM.PATH} element={<TeamPageAdmin />} />
                            <Route path={ADMIN_ROUTES.PROGRAMS.PATH} element={<ProgramsPageAdmin />} />
                            <Route path={ADMIN_ROUTES.DONATE.PATH} element={<DonatePageAdmin />} />
                            <Route path={ADMIN_ROUTES.FAQ.PATH} element={<FaqPanel />} />
                            <Route path={ADMIN_ROUTES.WHO_WE_ARE.PATH} element={<WhoWeArePageAdmin />} />
                            <Route path={ADMIN_ROUTES.PARTNERS.PATH} element={<PartnerPanel />} />
                            <Route path={ADMIN_ROUTES.PROFILE_COMPANY.PATH} element={<CompanyProfileContent />} />
                            <Route path={ADMIN_ROUTES.REPORTS.PATH} element={<ReportsPanelContent />} />
                            <Route path={ADMIN_ROUTES.HISTORY.PATH} element={<HistoryPageContent />} />
                            <Route path={ADMIN_ROUTES.MAIN.PATH} element={<MainPageContent />} />
                        </Route>
                    </Route>
                </Route>
            </Routes>
        </BrowserRouter>
    );
};
