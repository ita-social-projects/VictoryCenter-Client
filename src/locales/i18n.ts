import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import {
    headerUk,
    hippotherapyUk,
    footerUk,
    aboutUsPageUk,
    eventsNewsUk,
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
} from './uk';
import {
    headerEn,
    hippotherapyEn,
    footerEn,
    aboutUsPageEn,
    eventsNewsEn,
    programsPageEn,
    detailedProgramPageEn,
    donateEn,
    reportsPageEn,
    partnersPageEn,
    successPageEn,
    globalEn,
    contactUsPageEn,
    mainPageEn,
    historyPageEn,
    notFoundPageEn,
} from './en';
import { DEFAULT_LOCALE, LOCALES } from '../const/common/locales';

const resources = {
    uk: {
        header: headerUk,
        hippotherapy: hippotherapyUk,
        footer: footerUk,
        aboutUsPage: aboutUsPageUk,
        eventsNewsPage: eventsNewsUk,
        programsPage: programsPageUk,
        detailedProgramPage: detailedProgramPageUk,
        donatePage: donateUk,
        reportsPage: reportsPageUk,
        partnersPage: partnersPageUk,
        successPage: successPageUk,
        global: globalUk,
        contactUsPage: contactUsPageUk,
        mainPage: mainPageUk,
        historyPage: historyPageUk,
        supportUsPage: supportUsPageUk,
        notFoundPage: notFoundPageUk,
    },
    en: {
        header: headerEn,
        hippotherapy: hippotherapyEn,
        footer: footerEn,
        aboutUsPage: aboutUsPageEn,
        eventsNewsPage: eventsNewsEn,
        programsPage: programsPageEn,
        detailedProgramPage: detailedProgramPageEn,
        donatePage: donateEn,
        reportsPage: reportsPageEn,
        partnersPage: partnersPageEn,
        successPage: successPageEn,
        global: globalEn,
        contactUsPage: contactUsPageEn,
        mainPage: mainPageEn,
        historyPage: historyPageEn,
        notFoundPage: notFoundPageEn,
    },
};

const isTest = process.env.NODE_ENV === 'test';

if (!isTest) {
    i18n.use(LanguageDetector);
}

i18n.use(initReactI18next).init({
    resources,
    supportedLngs: LOCALES,
    fallbackLng: DEFAULT_LOCALE,
    ns: [
        'header',
        'footer',
        'aboutUsPage',
        'eventsNewsPage',
        'hippotherapy',
        'programsPage',
        'detailedProgramPage',
        'donatePage',
        'reportsPage',
        'partnersPage',
        'successPage',
        'global',
        'contactUsPage',
        'mainPage',
        'historyPage',
        'supportUsPage',
        'notFoundPage',
    ], // namespaces
    defaultNS: 'aboutUsPage',
    interpolation: {
        escapeValue: false, // leave it for React
    },
    detection: {
        // saving selected language
        order: ['path'],
    },
});

export default i18n;
