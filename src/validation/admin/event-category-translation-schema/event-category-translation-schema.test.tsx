import { EVENT_CATEGORY_TRANSLATION_VALIDATION_FUNCTIONS } from './event-category-translation-schema';
import { EventCategoryDto } from '@/types/admin/event-category';

jest.mock('@/const/admin/events', () => ({
    EVENT_CATEGORY_VALIDATION: {
        name: {
            min: 2,
            max: 20,
            getRequiredError: () => 'Name is required error',
            getMinError: () => 'Name must be at least 2 characters',
        },
    },
}));

jest.mock('@/const/admin/common', () => ({
    COMMON_TEXT_ADMIN: {
        VALIDATION_MESSAGE: {
            FIELD_REQUIRED: 'Category is required error',
            getMaxError: (max: number) => `Name must be at most ${max} characters`,
        },
    },
}));

describe('EVENT_CATEGORY_TRANSLATION_VALIDATION_FUNCTIONS', () => {
    const validCategory: EventCategoryDto = {
        id: 1,
        name: 'Test Category',
        relatedEventNewsCount: 0,
    };

    describe('validateName', () => {
        it('should return undefined when the name is valid', () => {
            const result = EVENT_CATEGORY_TRANSLATION_VALIDATION_FUNCTIONS.validateName('Valid Name');
            expect(result).toBeUndefined();
        });

        it('should return the required error message when the name is undefined', () => {
            const result = EVENT_CATEGORY_TRANSLATION_VALIDATION_FUNCTIONS.validateName(undefined);
            expect(result).toBe('Name is required error');
        });

        it('should return the required error message when the name is an empty string', () => {
            const result = EVENT_CATEGORY_TRANSLATION_VALIDATION_FUNCTIONS.validateName('');
            expect(result).toBe('Name is required error');
        });

        it('should return the minimum length error message when the name is too short', () => {
            const result = EVENT_CATEGORY_TRANSLATION_VALIDATION_FUNCTIONS.validateName('A');
            expect(result).toBe('Name must be at least 2 characters');
        });

        it('should return the maximum length error message when the name is too long', () => {
            const result = EVENT_CATEGORY_TRANSLATION_VALIDATION_FUNCTIONS.validateName('A'.repeat(21));
            expect(result).toBe('Name must be at most 20 characters');
        });
    });

    describe('validateCategory', () => {
        it('should return undefined when a valid category object is provided', () => {
            const result = EVENT_CATEGORY_TRANSLATION_VALIDATION_FUNCTIONS.validateCategory(validCategory);
            expect(result).toBeUndefined();
        });

        it('should return the required error message when the category is null', () => {
            const result = EVENT_CATEGORY_TRANSLATION_VALIDATION_FUNCTIONS.validateCategory(null);
            expect(result).toBe('Category is required error');
        });

        it('should return the required error message when the category is undefined', () => {
            const result = EVENT_CATEGORY_TRANSLATION_VALIDATION_FUNCTIONS.validateCategory(undefined);
            expect(result).toBe('Category is required error');
        });
    });

    describe('validateFrom', () => {
        it('should return an object with undefined values when both inputs are valid', () => {
            const result = EVENT_CATEGORY_TRANSLATION_VALIDATION_FUNCTIONS.validateFrom('Valid Name', validCategory);
            expect(result).toEqual({
                name: undefined,
                category: undefined,
            });
        });

        it('should return an object with error messages when both inputs are invalid', () => {
            const result = EVENT_CATEGORY_TRANSLATION_VALIDATION_FUNCTIONS.validateFrom('', undefined);
            expect(result).toEqual({
                name: 'Name is required error',
                category: 'Category is required error',
            });
        });

        it('should return an error for name but undefined for category if only name is invalid', () => {
            const result = EVENT_CATEGORY_TRANSLATION_VALIDATION_FUNCTIONS.validateFrom('A', validCategory);
            expect(result).toEqual({
                name: 'Name must be at least 2 characters',
                category: undefined,
            });
        });
    });
});
