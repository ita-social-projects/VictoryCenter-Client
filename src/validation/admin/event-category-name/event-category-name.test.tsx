import { EVENT_CATEGORY_VALIDATION } from '@/const/admin/events';
import { createEventCategoryNameSchema } from './event-category-name';

jest.mock('@/const/admin/events', () => ({
    EVENT_CATEGORY_VALIDATION: {
        name: {
            min: 2,
            max: 50,
            getRequiredError: jest.fn(() => 'Default required error'),
            getMinError: jest.fn(() => 'Default min error'),
            getMaxError: jest.fn(() => 'Default max error'),
        },
    },
}));

describe('createEventCategoryNameSchema', () => {
    describe('Default configuration', () => {
        const schema = createEventCategoryNameSchema();

        it('should pass validation for a valid name', () => {
            const validName = 'Conferences';
            expect(() => schema.validateSync(validName)).not.toThrow();
            expect(schema.validateSync(validName)).toBe('Conferences');
        });

        it('should trim surrounding whitespace during validation', () => {
            const paddedName = '   Conferences   ';
            const result = schema.validateSync(paddedName);
            expect(result).toBe('Conferences');
        });

        it('should fail when value is missing or empty string', () => {
            expect(() => schema.validateSync('')).toThrow(EVENT_CATEGORY_VALIDATION.name.getRequiredError());
            expect(() => schema.validateSync(undefined)).toThrow(EVENT_CATEGORY_VALIDATION.name.getRequiredError());
        });

        it('should fail with required error when value is only whitespace', () => {
            expect(() => schema.validateSync('   ')).toThrow(EVENT_CATEGORY_VALIDATION.name.getRequiredError());
        });

        it('should fail when value length is less than minimum', () => {
            const tooShort = 'a'.repeat(EVENT_CATEGORY_VALIDATION.name.min - 1);
            expect(() => schema.validateSync(tooShort)).toThrow(EVENT_CATEGORY_VALIDATION.name.getMinError());
        });

        it('should fail when value length is greater than maximum', () => {
            const tooLong = 'a'.repeat(EVENT_CATEGORY_VALIDATION.name.max + 1);
            expect(() => schema.validateSync(tooLong)).toThrow(EVENT_CATEGORY_VALIDATION.name.getMaxError());
        });

        it('should pass boundary values for min and max lengths', () => {
            const minBoundary = 'a'.repeat(EVENT_CATEGORY_VALIDATION.name.min);
            const maxBoundary = 'a'.repeat(EVENT_CATEGORY_VALIDATION.name.max);

            expect(() => schema.validateSync(minBoundary)).not.toThrow();
            expect(() => schema.validateSync(maxBoundary)).not.toThrow();
        });
    });

    describe('Custom error message overrides', () => {
        const customOptions = {
            requiredError: 'Custom name is required',
            minError: 'Custom name is too short',
            maxError: 'Custom name is too long',
        };

        const customSchema = createEventCategoryNameSchema(customOptions);

        it('should return custom required error when value is empty or omitted', () => {
            expect(() => customSchema.validateSync('')).toThrow(customOptions.requiredError);
            expect(() => customSchema.validateSync(undefined)).toThrow(customOptions.requiredError);
        });

        it('should return custom min error when length is below threshold', () => {
            const tooShort = 'a'.repeat(EVENT_CATEGORY_VALIDATION.name.min - 1);
            expect(() => customSchema.validateSync(tooShort)).toThrow(customOptions.minError);
        });

        it('should return custom max error when length exceeds threshold', () => {
            const tooLong = 'a'.repeat(EVENT_CATEGORY_VALIDATION.name.max + 1);
            expect(() => customSchema.validateSync(tooLong)).toThrow(customOptions.maxError);
        });
    });
});
