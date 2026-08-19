import { describe, it, expect, afterAll } from '@jest/globals';
import fs from 'fs';
import path from 'path';

function getKeyPaths(obj: Record<string, unknown>, prefix = ''): string[] {
    return Object.keys(obj).flatMap((key) => {
        const keyPath = prefix ? `${prefix}.${key}` : key;
        const value = obj[key];
        return typeof value === 'object' && value !== null && !Array.isArray(value)
            ? getKeyPaths(value as Record<string, unknown>, keyPath)
            : [keyPath];
    });
}

function getValueAtPath(obj: Record<string, unknown>, key: string): unknown {
    return key.split('.').reduce<unknown>((o, k) => (o as Record<string, unknown> | undefined)?.[k], obj);
}

function readTranslationFile(dir: string, locale: string, namespace: string): Record<string, unknown> {
    const filePath = path.join(dir, locale, `${namespace}.json`);

    let raw: string;
    try {
        raw = fs.readFileSync(filePath, 'utf-8');
    } catch (err) {
        throw new Error(`Failed to read translation file "${filePath}": ${(err as Error).message}`);
    }

    let parsed: unknown;
    try {
        parsed = JSON.parse(raw);
    } catch (err) {
        throw new Error(`Failed to parse translation file "${filePath}": ${(err as Error).message}`);
    }

    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
        throw new Error(
            `Invalid translation file "${filePath}": expected a JSON object at the top level, got ` +
                `${Array.isArray(parsed) ? 'array' : parsed === null ? 'null' : typeof parsed}`,
        );
    }

    return parsed as Record<string, unknown>;
}

function buildAllowlistId(namespace: string, locale: string, key: string): string {
    return `${namespace}.${locale}.${key}`;
}

const LOCALES_DIR = __dirname;

if (!fs.existsSync(LOCALES_DIR) || !fs.statSync(LOCALES_DIR).isDirectory()) {
    throw new Error(`Locales directory not found: "${LOCALES_DIR}"`);
}

const LOCALES = ['uk', 'en'];
const BASE_LOCALE = 'uk';
const OTHER_LOCALES = LOCALES.filter((locale) => locale !== BASE_LOCALE);

for (const locale of LOCALES) {
    const localeDir = path.join(LOCALES_DIR, locale);
    if (!fs.existsSync(localeDir) || !fs.statSync(localeDir).isDirectory()) {
        throw new Error(`Missing locale directory: "${localeDir}"`);
    }
}

// format: buildAllowlistId(namespace, locale, key) -> 'namespace.locale.KEY.PATH'
const ALLOWED_EMPTY_VALUES = new Set<string>([buildAllowlistId('history', 'en', 'YEAR_SUFFIX')]);
const usedAllowlistEntries = new Set<string>();

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
                const allowlistId = buildAllowlistId(namespace, locale, key);
                if (ALLOWED_EMPTY_VALUES.has(allowlistId)) {
                    usedAllowlistEntries.add(allowlistId);
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

afterAll(() => {
    if (usedAllowlistEntries.size !== ALLOWED_EMPTY_VALUES.size) {
        const unused = Array.from(ALLOWED_EMPTY_VALUES).filter((id) => !usedAllowlistEntries.has(id));
        throw new Error(
            `Unused entries in ALLOWED_EMPTY_VALUES (remove them or fix the key/locale/namespace): ${unused.join(', ')}`,
        );
    }
});
