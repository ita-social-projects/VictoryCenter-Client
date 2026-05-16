import { PDF_FILES_SECTION_VALIDATION } from '@/const/admin/reports';
import { PdfFileRenameValidationSchema, PDF_FILE_RENAME_VALIDATION_FUNCTIONS } from './pdf-file-rename-schema';

describe('PdfFileRenameValidationSchema', () => {
    describe('name field', () => {
        it('should validate a valid name', async () => {
            const validName = 'Valid PDF Name';
            await expect(PdfFileRenameValidationSchema.validate({ name: validName })).resolves.toEqual({
                name: validName,
            });
        });

        it('should trim whitespace', async () => {
            const nameWithSpaces = '  Valid PDF Name  ';
            const result = await PdfFileRenameValidationSchema.validate({ name: nameWithSpaces });
            expect(result.name).toBe('Valid PDF Name');
        });

        it('should reject name with less than 2 characters', async () => {
            await expect(PdfFileRenameValidationSchema.validate({ name: 'A' })).rejects.toThrow();
        });

        it('should reject empty string', async () => {
            await expect(PdfFileRenameValidationSchema.validate({ name: '' })).rejects.toThrow();
        });

        it('should reject name longer than 50 characters', async () => {
            const longName = 'a'.repeat(51);
            await expect(PdfFileRenameValidationSchema.validate({ name: longName })).rejects.toThrow();
        });

        it('should accept name exactly 2 characters', async () => {
            const validName = 'Ab';
            await expect(PdfFileRenameValidationSchema.validate({ name: validName })).resolves.toEqual({
                name: validName,
            });
        });

        it('should accept name exactly 50 characters', async () => {
            const validName = 'a'.repeat(50);
            await expect(PdfFileRenameValidationSchema.validate({ name: validName })).resolves.toEqual({
                name: validName,
            });
        });

        it('should reject name that is too short after trimming', async () => {
            await expect(PdfFileRenameValidationSchema.validate({ name: 'A  ' })).rejects.toThrow();
        });

        it('should accept name that is exactly 2 chars after trimming', async () => {
            await expect(PdfFileRenameValidationSchema.validate({ name: '  Ab  ' })).resolves.toBeDefined();
        });

        it('should reject whitespace-only name', async () => {
            await expect(PdfFileRenameValidationSchema.validate({ name: '   ' })).rejects.toThrow();
        });
    });

    describe('PDF_FILE_RENAME_VALIDATION_FUNCTIONS', () => {
        describe('validateName', () => {
            it('should return undefined for valid name', () => {
                const error = PDF_FILE_RENAME_VALIDATION_FUNCTIONS.validateName('Valid Name');
                expect(error).toBeUndefined();
            });

            it('should return min length error message for short name', () => {
                const error = PDF_FILE_RENAME_VALIDATION_FUNCTIONS.validateName('A');
                expect(error).toBe(PDF_FILES_SECTION_VALIDATION.fileName.getMinError());
            });

            it('should return max length error message for long name', () => {
                const error = PDF_FILE_RENAME_VALIDATION_FUNCTIONS.validateName('a'.repeat(51));
                expect(error).toBe(PDF_FILES_SECTION_VALIDATION.fileName.getMaxError());
            });

            it('should trim and validate', () => {
                const error = PDF_FILE_RENAME_VALIDATION_FUNCTIONS.validateName('  Valid Name  ');
                expect(error).toBeUndefined();
            });
        });
    });
});
