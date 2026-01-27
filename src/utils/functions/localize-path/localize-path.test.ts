import { localizePath } from './localize-path';
import { DEFAULT_LOCALE } from '@/const/common/locales';

describe('localizePath', () => {
    const locale = 'en';
    const defaultLocale = DEFAULT_LOCALE;
    const path = '/en/services';

    test('return to if To is not a string', () => {
        const toObject = { pathname: '/profile', search: '?tab=info' };
        expect(localizePath(toObject, locale)).toBe(toObject);
    });

    test('return default To if locale is defaultLocale', () => {
        expect(localizePath('/about', defaultLocale)).toBe('/about');
    });

    test('replaces root "/" with "/{locale}"', () => {
        expect(localizePath('/', locale)).toBe('/en');
    });

    test('return path if it already includes the locale prefix', () => {
        expect(localizePath(path, locale)).toBe('/en/services');
    });
});
