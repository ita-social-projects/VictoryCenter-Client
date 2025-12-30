import 'i18next';
import { headerUk, footerUk, aboutUsPageUk, programsPageUk, globalUk, reportsPageUk } from '../../locales/uk';

declare module 'i18next' {
    interface CustomTypeOptions {
        // inferring types automatically (such as arrays of objects)
        resources: {
            header: typeof headerUk;
            footer: typeof footerUk;
            aboutUsPage: typeof aboutUsPageUk;
            programsPage: typeof programsPageUk;
            reportsPage: typeof reportsPageUk;
            global: typeof globalUk;
        };
    }
}
