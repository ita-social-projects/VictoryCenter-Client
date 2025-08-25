import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import aboutUsPageEn from './locales/en/about-us-translation.json';
import headerEn from './locales/en/header-translation.json';

import aboutUsPageUk from './locales/uk/about-us-translation.json';
import headerUk from './locales/uk/header-translation.json';

const resources = {
    en: {
        aboutUsPage: aboutUsPageEn,
        header: headerEn,
    },
    uk: {
        aboutUsPage: aboutUsPageUk,
        header: headerUk,
    },
};

i18n.use(initReactI18next).init({
    resources,
    lng: 'en', // default
    fallbackLng: 'en',
    ns: ['aboutUsPage', 'header'], // namespaces
    defaultNS: 'aboutUsPage',
    interpolation: {
        escapeValue: false, // leave it for React
    },
});

export default i18n;
