import type { To } from 'react-router-dom';
import { DEFAULT_LOCALE } from '@/const/common/locales';

export const localizePath = (to: To, locale: string, defaultLocale: string = DEFAULT_LOCALE): To => {
    if (typeof to !== 'string') {
        return to;
    }

    if (locale === defaultLocale) {
        return to;
    }

    if (to === '/') {
        return `/${locale}`;
    }

    if (to.startsWith(`/${locale}`)) {
        return to;
    }

    return `/${locale}${to}`;
};
