import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import aboutUsPageEn from './locales/en/about-us.json';
import aboutUsPageUk from './locales/uk/about-us.json';

const resources = {
    uk: {
        aboutUsPage: aboutUsPageUk,
    },
    en: {
        aboutUsPage: aboutUsPageEn,
    },
};

const isTest = process.env.NODE_ENV === 'test';

if (!isTest) {
  i18n.use(LanguageDetector);
}

i18n.use(initReactI18next)
    .init({
        resources,
        fallbackLng: 'uk',
        ns: ['aboutUsPage'], // namespaces
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
