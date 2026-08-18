import { describe, it, expect } from '@jest/globals';
import fs from 'fs';
import path from 'path';

function getKeyPaths(obj: any, prefix = ''): string[] {
    return Object.keys(obj).flatMap((key) => {
        const path = prefix ? `${prefix}.${key}` : key;
        const value = obj[key];
        return typeof value === 'object' && value !== null && !Array.isArray(value) ? getKeyPaths(value, path) : [path];
    });
}

function getValueAtPath(obj: any, key: string): any {
    return key.split('.').reduce((o, k) => o?.[k], obj);
}

function readTranslationFile(dir: string, locale: string, namespace: string): any {
    const filePath = path.join(dir, locale, `${namespace}.json`);
    try {
        return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    } catch (err) {
        throw new Error(`Failed to read translation file "${filePath}": ${(err as Error).message}`);
    }
}

const LOCALES_DIR = __dirname;
const LOCALES = ['uk', 'en'];
const BASE_LOCALE = 'uk';
const OTHER_LOCALES = LOCALES.filter((locale) => locale !== BASE_LOCALE);

// format 'namespace.locale.KEY.PATH'
const ALLOWED_EMPTY_VALUES = new Set<string>(['history.en.YEAR_SUFFIX']);

const namespaces = Array.from(
    new Set(
        LOCALES.flatMap((locale) =>
            fs
                .readdirSync(path.join(LOCALES_DIR, locale))
                .filter((f) => f.endsWith('.json'))
                .map((f) => f.replace('.json', '')),
        ),
    ),
).sort();

describe.each(namespaces)('%s.json translation integrity', (namespace) => {
    const translations = Object.fromEntries(
        LOCALES.map((locale) => [locale, readTranslationFile(LOCALES_DIR, locale, namespace)]),
    );

    it('should have identical key structure across locales', () => {
        const baseKeys = getKeyPaths(translations[BASE_LOCALE]).sort();
        for (const locale of OTHER_LOCALES) {
            expect(getKeyPaths(translations[locale]).sort()).toEqual(baseKeys);
        }
    });

    it('should not have empty translation values', () => {
        for (const locale of LOCALES) {
            const keys = getKeyPaths(translations[locale]);
            for (const key of keys) {
                const allowlistId = `${namespace}.${locale}.${key}`;
                if (ALLOWED_EMPTY_VALUES.has(allowlistId)) {
                    continue;
                }

                const value = getValueAtPath(translations[locale], key);
                if (value === '') {
                    throw new Error(
                        `${locale}/${namespace}.json: "${key}" is empty. ` +
                            `If this is intentional, add "${allowlistId}" to ALLOWED_EMPTY_VALUES.`,
                    );
                }
                expect(value).not.toBe('');
            }
        }
    });

    it('should have matching value types across locales', () => {
        const baseKeys = getKeyPaths(translations[BASE_LOCALE]);
        for (const locale of OTHER_LOCALES) {
            for (const key of baseKeys) {
                const baseValue = getValueAtPath(translations[BASE_LOCALE], key);
                const localeValue = getValueAtPath(translations[locale], key);

                if (Array.isArray(baseValue) !== Array.isArray(localeValue)) {
                    throw new Error(
                        `${locale}/${namespace}.json: "${key}" array/type mismatch ` +
                            `(${BASE_LOCALE}: ${Array.isArray(baseValue) ? 'array' : typeof baseValue}, ` +
                            `${locale}: ${Array.isArray(localeValue) ? 'array' : typeof localeValue})`,
                    );
                }
                expect(typeof localeValue).toBe(typeof baseValue);
            }
        }
    });
});
