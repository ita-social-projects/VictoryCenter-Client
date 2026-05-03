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
    globalUk,
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
            global: typeof globalUk;
        };
    }
}
