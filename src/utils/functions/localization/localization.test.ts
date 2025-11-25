import { returnDisplayedLocale } from './localization';
import { EntityWithLocalizations, EntityLocalization } from '../../../types/common/language';

enum TranslationStatus {
    Outdated,
    Relevant,
}

interface TestLocalization extends EntityLocalization {
    fullName?: string;
    description?: string;
}

const createLocalization = (
    code: string,
    status: TranslationStatus,
    extra?: Partial<TestLocalization>,
): TestLocalization => ({
    language: { id: Math.random(), code },
    translationStatus: status,
    ...extra,
});

const createEntity = (localizations: TestLocalization[]): EntityWithLocalizations<TestLocalization> => ({
    localizations,
});

describe('returnDisplayedLocale', () => {
    it('should return localization for matching language code', () => {
        const entity = createEntity([
            createLocalization('en', TranslationStatus.Relevant, { fullName: 'John EN' }),
            createLocalization('ua', TranslationStatus.Relevant, { fullName: 'John UA' }),
        ]);

        const result = returnDisplayedLocale(entity, 'ua');

        expect(result).not.toBeNull();
        expect(result?.language.code).toBe('ua');
        expect(result?.fullName).toBe('John UA');
    });

    it('should return null when language code not found', () => {
        const entity = createEntity([createLocalization('en', TranslationStatus.Relevant)]);

        const result = returnDisplayedLocale(entity, 'fr');

        expect(result).toBeNull();
    });

    it('should return null when localizations array is empty', () => {
        const entity = createEntity([]);

        const result = returnDisplayedLocale(entity, 'en');

        expect(result).toBeNull();
    });
});
