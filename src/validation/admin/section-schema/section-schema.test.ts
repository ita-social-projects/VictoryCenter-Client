import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { SECTION_TEMPLATE_VALIDATION } from '@/const/admin/sections';
import { ContentType } from '@/types/common/section-contents';
import { SectionTemplate } from '@/types/common/sections';
import { SECTION_VALIDATION_FUNCTIONS } from './section-schema';

const TEMPLATE = SectionTemplate.TextOnly;

const titleReq = (SECTION_TEMPLATE_VALIDATION as any)[TEMPLATE].lengths[ContentType.Title] as {
    min: number;
    max: number;
};

const descriptionReq = (SECTION_TEMPLATE_VALIDATION as any)[TEMPLATE].lengths[ContentType.Description] as {
    min: number;
    max: number;
};

describe('section-schema.ts', () => {
    describe('validateSectionTitle', () => {
        it('should return required error for an empty string', () => {
            expect(SECTION_VALIDATION_FUNCTIONS.validateSectionTitle('', true, TEMPLATE)).toBe(
                COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.FIELD_REQUIRED,
            );
        });

        it('should return required error for a whitespace-only title', () => {
            expect(SECTION_VALIDATION_FUNCTIONS.validateSectionTitle('   ', true, TEMPLATE)).toBe(
                COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.FIELD_REQUIRED,
            );
        });

        it('should return min error when title is too short', () => {
            const tooShort = 'a'.repeat(titleReq.min - 1);

            expect(SECTION_VALIDATION_FUNCTIONS.validateSectionTitle(tooShort, true, TEMPLATE)).toBe(
                COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMinError(titleReq.min),
            );
        });

        it('should return undefined for title at exact min length', () => {
            const exactMin = 'a'.repeat(titleReq.min);

            expect(SECTION_VALIDATION_FUNCTIONS.validateSectionTitle(exactMin, true, TEMPLATE)).toBeUndefined();
        });

        it('should return max error when title is too long', () => {
            const tooLong = 'a'.repeat(titleReq.max + 1);

            expect(SECTION_VALIDATION_FUNCTIONS.validateSectionTitle(tooLong, true, TEMPLATE)).toBe(
                COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMaxError(titleReq.max),
            );
        });

        it('should return undefined for title at exact max length', () => {
            const exactMax = 'a'.repeat(titleReq.max);

            expect(SECTION_VALIDATION_FUNCTIONS.validateSectionTitle(exactMax, true, TEMPLATE)).toBeUndefined();
        });

        it('should return undefined for a valid title', () => {
            const validTitle = 'a'.repeat(titleReq.min + 1);

            expect(SECTION_VALIDATION_FUNCTIONS.validateSectionTitle(validTitle, true, TEMPLATE)).toBeUndefined();
        });

        it('should skip length validation when template is not provided', () => {
            const veryLongText = 'a'.repeat(100000);

            expect(SECTION_VALIDATION_FUNCTIONS.validateSectionTitle(veryLongText, true)).toBeUndefined();
        });
    });

    describe('validateSectionDescription', () => {
        it('should return required error for an empty string', () => {
            expect(SECTION_VALIDATION_FUNCTIONS.validateSectionDescription('', true, TEMPLATE)).toBe(
                COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.FIELD_REQUIRED,
            );
        });

        it('should return required error for a whitespace-only description', () => {
            expect(SECTION_VALIDATION_FUNCTIONS.validateSectionDescription('   ', true, TEMPLATE)).toBe(
                COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.FIELD_REQUIRED,
            );
        });

        it('should return min error when description is too short', () => {
            const tooShort = 'a'.repeat(descriptionReq.min - 1);

            expect(SECTION_VALIDATION_FUNCTIONS.validateSectionDescription(tooShort, true, TEMPLATE)).toBe(
                COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMinError(descriptionReq.min),
            );
        });

        it('should return undefined for description at exact min length', () => {
            const exactMin = 'a'.repeat(descriptionReq.min);

            expect(SECTION_VALIDATION_FUNCTIONS.validateSectionDescription(exactMin, true, TEMPLATE)).toBeUndefined();
        });

        it('should return max error when description is too long', () => {
            const tooLong = 'a'.repeat(descriptionReq.max + 1);

            expect(SECTION_VALIDATION_FUNCTIONS.validateSectionDescription(tooLong, false, TEMPLATE)).toBe(
                COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMaxError(descriptionReq.max),
            );
        });

        it('should return undefined for description at exact max length', () => {
            const exactMax = 'a'.repeat(descriptionReq.max);

            expect(SECTION_VALIDATION_FUNCTIONS.validateSectionDescription(exactMax, true, TEMPLATE)).toBeUndefined();
        });

        it('should return undefined for a valid description', () => {
            const validDescription = 'a'.repeat(descriptionReq.min + 1);

            expect(
                SECTION_VALIDATION_FUNCTIONS.validateSectionDescription(validDescription, true, TEMPLATE),
            ).toBeUndefined();
        });

        it('should skip length validation when template is not provided', () => {
            const veryLongText = 'a'.repeat(100000);

            expect(SECTION_VALIDATION_FUNCTIONS.validateSectionDescription(veryLongText, true)).toBeUndefined();
        });
    });
});
