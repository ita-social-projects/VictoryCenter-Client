import { ProgramCategoryValidationSchema } from './program-category-schema';
import { PROGRAM_CATEGORY_VALIDATION } from '../../../const/admin/programs';

describe('ProgramCategoryValidationSchema', () => {
    const expectValidationToPass = async (data: any) => {
        await expect(ProgramCategoryValidationSchema.validate(data)).resolves.toBeTruthy();
    };

    const expectValidationToFail = async (data: any, expectedError: any) => {
        await expect(ProgramCategoryValidationSchema.validate(data)).rejects.toThrow(expectedError);
    };

    describe('valid cases', () => {
        it.each([
            ['valid name', { name: 'Valid Category' }],
            ['name at minimum length', { name: 'a'.repeat(PROGRAM_CATEGORY_VALIDATION.name.min) }],
            ['name at maximum length', { name: 'a'.repeat(PROGRAM_CATEGORY_VALIDATION.name.max) }],
            ['name with allowed special characters', { name: 'Category-Name' }],
            ['name with numbers', { name: 'P category 123' }],
            ['name with Ukrainian characters', { name: 'Категорія' }],
        ])('should pass validation with %s', async (description, data) => {
            await expectValidationToPass(data);
        });
    });

    describe('invalid cases', () => {
        const invalidCases = [
            {
                description: 'name is missing',
                data: {},
                expectedError: PROGRAM_CATEGORY_VALIDATION.name.getRequiredError(),
            },
            {
                description: 'name is empty string',
                data: { name: '' },
                expectedError: PROGRAM_CATEGORY_VALIDATION.name.getRequiredError(),
            },
            {
                description: 'name is only whitespace',
                data: { name: '   ' },
                expectedError: PROGRAM_CATEGORY_VALIDATION.name.getRequiredError(),
            },
            {
                description: 'name is too short',
                data: { name: 'a'.repeat(PROGRAM_CATEGORY_VALIDATION.name.min - 1) },
                expectedError: PROGRAM_CATEGORY_VALIDATION.name.getMinError(),
            },
            {
                description: 'name is too long',
                data: { name: 'a'.repeat(PROGRAM_CATEGORY_VALIDATION.name.max + 1) },
                expectedError: PROGRAM_CATEGORY_VALIDATION.name.getMaxError(),
            },
        ];

        invalidCases.forEach(({ description, data, expectedError }) => {
            it(`should fail validation when ${description}`, async () => {
                await expectValidationToFail(data, expectedError);
            });
        });
    });

    describe('edge cases', () => {
        const edgeCases = [
            { description: 'null input', data: null },
            { description: 'undefined input', data: undefined },
            { description: 'non-object input', data: 'string' },
        ];

        edgeCases.forEach(({ description, data }) => {
            it(`should handle ${description}`, async () => {
                await expect(ProgramCategoryValidationSchema.validate(data)).rejects.toThrow();
            });
        });
    });
});
