import { ProgramCategoryValidationSchema } from './program-category-schema';
import { PROGRAM_CATEGORY_VALIDATION } from '../../../const/admin/programs';

describe('ProgramCategoryValidationSchema', () => {
    it('should pass validation with valid name', async () => {
        const validData = { name: 'Valid Category' };

        await expect(ProgramCategoryValidationSchema.validate(validData))
            .resolves.toBeTruthy();
    });

    it('should fail validation when name is missing', async () => {
        const invalidData = {};

        await expect(ProgramCategoryValidationSchema.validate(invalidData))
            .rejects.toThrow(PROGRAM_CATEGORY_VALIDATION.name.requiredError);
    });

    it('should fail validation when name is empty string', async () => {
        const invalidData = { name: '' };

        await expect(ProgramCategoryValidationSchema.validate(invalidData))
            .rejects.toThrow(PROGRAM_CATEGORY_VALIDATION.name.requiredError);
    });

    it('should fail validation when name is only whitespace', async () => {
        const invalidData = { name: '   ' };

        await expect(ProgramCategoryValidationSchema.validate(invalidData))
            .rejects.toThrow(PROGRAM_CATEGORY_VALIDATION.name.requiredError);
    });

    it('should fail validation when name contains disallowed characters', async () => {
        const invalidData = { name: 'Invalid@Name!' };

        await expect(ProgramCategoryValidationSchema.validate(invalidData))
            .rejects.toThrow(PROGRAM_CATEGORY_VALIDATION.name.getAllowedCharsError());
    });

    it('should fail validation when name is too short', async () => {
        const shortName = 'a'.repeat(PROGRAM_CATEGORY_VALIDATION.name.min - 1);
        const invalidData = { name: shortName };

        await expect(ProgramCategoryValidationSchema.validate(invalidData))
            .rejects.toThrow(PROGRAM_CATEGORY_VALIDATION.name.getMinError());
    });

    it('should pass validation when name is at minimum length', async () => {
        const minName = 'a'.repeat(PROGRAM_CATEGORY_VALIDATION.name.min);
        const validData = { name: minName };

        await expect(ProgramCategoryValidationSchema.validate(validData))
            .resolves.toBeTruthy();
    });

    it('should fail validation when name is too long', async () => {
        const longName = 'a'.repeat(PROGRAM_CATEGORY_VALIDATION.name.max + 1);
        const invalidData = { name: longName };

        await expect(ProgramCategoryValidationSchema.validate(invalidData))
            .rejects.toThrow(PROGRAM_CATEGORY_VALIDATION.name.getMaxError());
    });

    it('should pass validation when name is at maximum length', async () => {
        const maxName = 'a'.repeat(PROGRAM_CATEGORY_VALIDATION.name.max);
        const validData = { name: maxName };

        await expect(ProgramCategoryValidationSchema.validate(validData))
            .resolves.toBeTruthy();
    });

    it('should pass validation with name containing allowed special characters', async () => {
        const validData = { name: 'Category-Name' };

        await expect(ProgramCategoryValidationSchema.validate(validData))
            .resolves.toBeTruthy();
    });

    it('should pass validation with name containing numbers', async () => {
        const validData = { name: 'P category 123' };

        await expect(ProgramCategoryValidationSchema.validate(validData))
            .resolves.toBeTruthy();
    });

    it('should pass validation with name containing Ukrainian characters', async () => {
        const validData = { name: 'Програма Категорія' };

        await expect(ProgramCategoryValidationSchema.validate(validData))
            .resolves.toBeTruthy();
    });

    it('should handle null input', async () => {
        await expect(ProgramCategoryValidationSchema.validate(null))
            .rejects.toThrow();
    });

    it('should handle undefined input', async () => {
        await expect(ProgramCategoryValidationSchema.validate(undefined))
            .rejects.toThrow();
    });

    it('should handle non-object input', async () => {
        await expect(ProgramCategoryValidationSchema.validate('string'))
            .rejects.toThrow();
    });
});
