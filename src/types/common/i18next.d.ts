import 'i18next';
import {
    headerUk,
    hippotherapyUk,
    footerUk,
    aboutUsPageUk,
    programsPageUk,
    detailedProgramPageUk,
    donateUk,
    reportsPageUk,
    partnersPageUk,
    successPageUk,
    globalUk,
    contactUsPageUk,
    mainPageUk,
    historyPageUk,
    supportUsPageUk,
    notFoundPageUk,
} from '../../locales/uk';

declare module 'i18next' {
    interface CustomTypeOptions {
        resources: {
            header: typeof headerUk;
            hippotherapy: typeof hippotherapyUk;
            footer: typeof footerUk;
            aboutUsPage: typeof aboutUsPageUk;
            eventsNewsPage: typeof eventsNewsUk;
            programsPage: typeof programsPageUk;
            detailedProgramPage: typeof detailedProgramPageUk;
            donatePage: typeof donateUk;
            reportsPage: typeof reportsPageUk;
            partnersPage: typeof partnersPageUk;
            successPage: typeof successPageUk;
            global: typeof globalUk;
            contactUsPage: typeof contactUsPageUk;
            mainPage: typeof mainPageUk;
            historyPage: typeof historyPageUk;
            supportUsPage: typeof supportUsPageUk;
            notFoundPage: typeof notFoundPageUk;
        };
    }
}
