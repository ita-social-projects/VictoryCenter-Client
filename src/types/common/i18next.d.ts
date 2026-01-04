import 'i18next';
import {
    headerUk,
    footerUk,
    aboutUsPageUk,
    programsPageUk,
    donateUk,
    reportsPageUk,
    partnersPageUk,
    globalUk,
} from '../../locales/uk';

declare module 'i18next' {
    interface CustomTypeOptions {
        resources: {
            header: typeof headerUk;
            footer: typeof footerUk;
            aboutUsPage: typeof aboutUsPageUk;
            programsPage: typeof programsPageUk;
            donatePage: typeof donateUk;
            reportsPage: typeof reportsPageUk;
            partnersPage: typeof partnersPageUk;
            global: typeof globalUk;
        };
    }
}
