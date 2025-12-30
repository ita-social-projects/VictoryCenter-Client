import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import { headerUk, footerUk, aboutUsPageUk, programsPageUk, globalUk, reportsPageUk } from './uk';
import { headerEn, footerEn, aboutUsPageEn, programsPageEn, globalEn, reportsPageEn } from './en';
import { DEFAULT_LOCALE, LOCALES } from '../const/common/locales';

const resources = {
    uk: {
        header: headerUk,
        footer: footerUk,
        aboutUsPage: aboutUsPageUk,
        programsPage: programsPageUk,
        reportsPage: reportsPageUk,
        global: globalUk,
    },
    en: {
        header: headerEn,
        footer: footerEn,
        aboutUsPage: aboutUsPageEn,
        programsPage: programsPageEn,
        reportsPage: reportsPageEn,
        global: globalEn,
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
    ns: ['header', 'footer', 'aboutUsPage', 'programsPage', 'reportsPage', 'global'], // namespaces
    defaultNS: 'aboutUsPage',
    interpolation: {
        escapeValue: false, // leave it for React
    },
    detection: {
        // saving selected language
        order: ['localStorage', 'navigator'],
        caches: ['localStorage'],
    },
});

export default i18n;
