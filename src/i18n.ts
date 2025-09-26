import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import { headerUk, footerUk, aboutUsPageUk } from './locales/uk';
import { headerEn, footerEn, aboutUsPageEn } from './locales/en';

const resources = {
    uk: {
        header: headerUk,
        footer: footerUk,
        aboutUsPage: aboutUsPageUk,
    },
    en: {
        header: headerEn,
        footer: footerEn,
        aboutUsPage: aboutUsPageEn,
    },
};

const isTest = process.env.NODE_ENV === 'test';

if (!isTest) {
    i18n.use(LanguageDetector);
}

i18n.use(initReactI18next).init({
    resources,
    fallbackLng: 'uk',
    ns: ['header', 'footer', 'aboutUsPage'], // namespaces
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
