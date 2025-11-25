import { returnDisplayedLocalization } from './localization';
import { EntityWithLocalizations, EntityLocalization, TranslationStatus } from '../../../types/common/language';

interface TestLocalization extends EntityLocalization {
    fullName?: string;
    description?: string;
}

const createLocalization = (
    id: number,
    code: string,
    status: TranslationStatus,
    extra?: Partial<TestLocalization>,
): TestLocalization => ({
    language: { id, code },
    translationStatus: status,
    ...extra,
});

const createEntity = (localizations: TestLocalization[]): EntityWithLocalizations<TestLocalization> => ({
    localizations,
});

describe('returnDisplayedLocale', () => {
    it('should return localization for matching language code', () => {
        const entity = createEntity([
            createLocalization(2, 'en', TranslationStatus.Relevant, { fullName: 'John EN' }),
            createLocalization(1, 'ua', TranslationStatus.Relevant, { fullName: 'John UA' }),
        ]);

        const result = returnDisplayedLocalization(entity, 'ua');

        expect(result).not.toBeNull();
        expect(result?.language.code).toBe('ua');
        expect(result?.fullName).toBe('John UA');
    });

    it('should return null when language code not found', () => {
        const entity = createEntity([createLocalization(2, 'en', TranslationStatus.Relevant)]);

        const result = returnDisplayedLocalization(entity, 'fr');

        expect(result).toBeNull();
    });

    it('should return null when localizations array is empty', () => {
        const entity = createEntity([]);

        const result = returnDisplayedLocalization(entity, 'en');

        expect(result).toBeNull();
    });
});
