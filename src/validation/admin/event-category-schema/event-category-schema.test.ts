import { EVENT_CATEGORY_VALIDATION } from '@/const/admin/events';
import { EVENT_CATEGORY_VALIDATION_FUNCTIONS } from './event-category-schema';

describe('EVENT_CATEGORY_VALIDATION_FUNCTIONS.validateName', () => {
    const { min, max, getRequiredError, getMinError, getMaxError } = EVENT_CATEGORY_VALIDATION.name;

    it('returns undefined for a valid name', () => {
        const value = 'Valid category name';

        expect(EVENT_CATEGORY_VALIDATION_FUNCTIONS.validateName(value)).toBeUndefined();
    });

    it('returns required error for an empty name', () => {
        const value = '';

        expect(EVENT_CATEGORY_VALIDATION_FUNCTIONS.validateName(value)).toBe(getRequiredError());
    });

    it('returns min length error when name is too short', () => {
        const value = 'a'.repeat(min - 1);

        expect(EVENT_CATEGORY_VALIDATION_FUNCTIONS.validateName(value)).toBe(getMinError());
    });

    it('returns max length error when name is too long', () => {
        const value = 'a'.repeat(max + 1);

        expect(EVENT_CATEGORY_VALIDATION_FUNCTIONS.validateName(value)).toBe(getMaxError());
    });

    it('returns min length error when trimmed name is too short', () => {
        const value = `  ${'a'.repeat(min - 1)}  `;

        expect(EVENT_CATEGORY_VALIDATION_FUNCTIONS.validateName(value)).toBe(getMinError());
    });

    it('accepts a name with exactly min length', () => {
        const value = 'a'.repeat(min);

        expect(EVENT_CATEGORY_VALIDATION_FUNCTIONS.validateName(value)).toBeUndefined();
    });

    it('accepts a name with exactly max length', () => {
        const value = 'a'.repeat(max);

        expect(EVENT_CATEGORY_VALIDATION_FUNCTIONS.validateName(value)).toBeUndefined();
    });
});
