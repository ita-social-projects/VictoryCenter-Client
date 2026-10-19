import { LOCALES } from '@/const/common/locales';
import { getPublicLocalization } from './get-public-localization';

type Item = { language?: { code: string } | null; name?: string };

const createItems = (): Item[] => LOCALES.map((code) => ({ language: { code }, name: `name ${code}` }));

describe('getPublicLocalization', () => {
    it.each(LOCALES)('returns the item that matches "%s"', (language) => {
        const result = getPublicLocalization(createItems(), language);

        expect(result).toEqual({ language: { code: language }, name: `name ${language}` });
    });

    it('returns the same object reference from the list, not a copy', () => {
        const items = createItems();

        expect(getPublicLocalization(items, LOCALES[0])).toBe(items[0]);
    });

    it.each(LOCALES)('matches "%s" regardless of the case of the requested code', (language) => {
        const items = createItems();

        expect(getPublicLocalization(items, language.toUpperCase())).toBe(
            items.find((item) => item.language?.code === language),
        );
    });

    it('matches regardless of the case of the stored code', () => {
        const items: Item[] = [{ language: { code: 'UK' }, name: 'Медіа' }];

        expect(getPublicLocalization(items, 'uk')).toBe(items[0]);
    });

    it('returns null when no item matches the language', () => {
        const items: Item[] = [{ language: { code: 'uk' } }];

        expect(getPublicLocalization(items, 'xx')).toBeNull();
    });

    it('does not fall back to another language', () => {
        const items: Item[] = [{ language: { code: 'uk' }, name: 'Медіа' }];

        expect(getPublicLocalization(items, 'en')).toBeNull();
    });

    it('returns the first item when several match', () => {
        const items: Item[] = [
            { language: { code: 'en' }, name: 'first' },
            { language: { code: 'en' }, name: 'second' },
        ];

        expect(getPublicLocalization(items, 'en')).toBe(items[0]);
    });

    it.each([undefined, null, []])('returns null for the items value %p', (items) => {
        expect(getPublicLocalization(items as Item[] | null | undefined, 'uk')).toBeNull();
    });

    it.each([
        ['language is undefined', { name: 'a' }],
        ['language is null', { language: null, name: 'a' }],
        ['language code is empty', { language: { code: '' }, name: 'a' }],
    ] as [string, Item][])('skips items where %s', (_description, item) => {
        expect(getPublicLocalization([item], 'uk')).toBeNull();
    });

    it('skips items without a language and still finds a later match', () => {
        const items: Item[] = [{ name: 'no language' }, { language: null }, { language: { code: 'en' }, name: 'EN' }];

        expect(getPublicLocalization(items, 'en')).toBe(items[2]);
    });

    it('does not match an empty requested code against items with a code', () => {
        expect(getPublicLocalization(createItems(), '')).toBeNull();
    });
});
