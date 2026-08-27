import type { To } from 'react-router-dom';
import { DEFAULT_LOCALE } from '@/const/common/locales';

export function localizePath(to: string, locale: string, defaultLocale?: string): string;
export function localizePath(to: To, locale: string, defaultLocale?: string): To;
export function localizePath(to: To, locale: string, defaultLocale: string = DEFAULT_LOCALE): To {
    if (typeof to !== 'string') {
        return to;
    }

    if (locale === defaultLocale) {
        return to;
    }

    if (to === '/') {
        return `/${locale}`;
    }

    if (to === `/${locale}` || to.startsWith(`/${locale}/`)) {
        return to;
    }

    return `/${locale}${to}`;
}
