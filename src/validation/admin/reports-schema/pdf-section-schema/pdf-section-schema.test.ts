import { PDF_SECTION_FIELD_VALIDATORS } from './pdf-section-schema';

import { PDF_FILES_SECTION_VALIDATION } from '@/const/admin/reports';

describe('pdf-section-schema', () => {
    describe('validateTitle', () => {
        it('should return undefined for a valid title', () => {
            const result = PDF_SECTION_FIELD_VALIDATORS.validateTitle('Valid title text');
            expect(result).toBeUndefined();
        });

        it('should return required error for empty string', () => {
            const result = PDF_SECTION_FIELD_VALIDATORS.validateTitle('');
            expect(result).toBe(PDF_FILES_SECTION_VALIDATION.title.getRequiredError());
        });

        it('should return required error for whitespace string', () => {
            const result = PDF_SECTION_FIELD_VALIDATORS.validateTitle('   ');
            expect(result).toBe(PDF_FILES_SECTION_VALIDATION.title.getRequiredError());
        });

        it('should return min error when title is too short', () => {
            const shortTitle = 'a'.repeat(PDF_FILES_SECTION_VALIDATION.title.min - 1);
            const result = PDF_SECTION_FIELD_VALIDATORS.validateTitle(shortTitle);

            expect(result).toBe(PDF_FILES_SECTION_VALIDATION.title.getMinError());
        });

        it('should return undefined for title at min length', () => {
            const minTitle = 'a'.repeat(PDF_FILES_SECTION_VALIDATION.title.min);
            const result = PDF_SECTION_FIELD_VALIDATORS.validateTitle(minTitle);

            expect(result).toBeUndefined();
        });

        it('should return max error when title is too long', () => {
            const longTitle = 'a'.repeat(PDF_FILES_SECTION_VALIDATION.title.max + 1);
            const result = PDF_SECTION_FIELD_VALIDATORS.validateTitle(longTitle);

            expect(result).toBe(PDF_FILES_SECTION_VALIDATION.title.getMaxError());
        });

        it('should return undefined for title at max length', () => {
            const maxTitle = 'a'.repeat(PDF_FILES_SECTION_VALIDATION.title.max);
            const result = PDF_SECTION_FIELD_VALIDATORS.validateTitle(maxTitle);

            expect(result).toBeUndefined();
        });
    });

    describe('validateDescription', () => {
        it('should return undefined for a valid description', () => {
            const result = PDF_SECTION_FIELD_VALIDATORS.validateDescription('Valid description text');
            expect(result).toBeUndefined();
        });

        it('should return required error for empty string', () => {
            const result = PDF_SECTION_FIELD_VALIDATORS.validateDescription('');
            expect(result).toBe(PDF_FILES_SECTION_VALIDATION.description.getRequiredError());
        });

        it('should return required error for whitespace string', () => {
            const result = PDF_SECTION_FIELD_VALIDATORS.validateDescription('   ');
            expect(result).toBe(PDF_FILES_SECTION_VALIDATION.description.getRequiredError());
        });

        it('should return min error when description is too short', () => {
            const shortText = 'a'.repeat(PDF_FILES_SECTION_VALIDATION.description.min - 1);
            const result = PDF_SECTION_FIELD_VALIDATORS.validateDescription(shortText);

            expect(result).toBe(PDF_FILES_SECTION_VALIDATION.description.getMinError());
        });

        it('should return undefined for description at min length', () => {
            const minText = 'a'.repeat(PDF_FILES_SECTION_VALIDATION.description.min);
            const result = PDF_SECTION_FIELD_VALIDATORS.validateDescription(minText);

            expect(result).toBeUndefined();
        });

        it('should return max error when description is too long', () => {
            const longText = 'a'.repeat(PDF_FILES_SECTION_VALIDATION.description.max + 1);
            const result = PDF_SECTION_FIELD_VALIDATORS.validateDescription(longText);

            expect(result).toBe(PDF_FILES_SECTION_VALIDATION.description.getMaxError());
        });

        it('should return undefined for description at max length', () => {
            const maxText = 'a'.repeat(PDF_FILES_SECTION_VALIDATION.description.max);
            const result = PDF_SECTION_FIELD_VALIDATORS.validateDescription(maxText);

            expect(result).toBeUndefined();
        });
    });
});
