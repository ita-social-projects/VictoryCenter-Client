import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { SECTION_TEMPLATE_VALIDATION } from '@/const/admin/sections';
import { ContentType } from '@/types/common/section-contents';
import { SectionTemplate } from '@/types/common/sections';
import { sectionValidationSchema, SECTION_VALIDATION_FUNCTIONS } from './section-schema';

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
    describe('SECTION_VALIDATION_FUNCTIONS: validateSectionTitle', () => {
        it('returns required error if value is empty and publishing', () => {
            expect(SECTION_VALIDATION_FUNCTIONS.validateSectionTitle('', true, TEMPLATE)).toBe(
                COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.FIELD_REQUIRED,
            );
        });

        it('returns undefined if no template is provided', () => {
            expect(SECTION_VALIDATION_FUNCTIONS.validateSectionTitle('abc', true, undefined)).toBeUndefined();
        });

        it('returns min error if value is too short', () => {
            const tooShort = 'a'.repeat(titleReq.min - 1);
            expect(SECTION_VALIDATION_FUNCTIONS.validateSectionTitle(tooShort, true, TEMPLATE)).toBe(
                COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMinError(titleReq.min),
            );
        });

        it('returns undefined if value is within bounds', () => {
            const validText = 'a'.repeat(titleReq.min);
            expect(SECTION_VALIDATION_FUNCTIONS.validateSectionTitle(validText, true, TEMPLATE)).toBeUndefined();
        });

        it('returns max error if value is too long', () => {
            const tooLong = 'a'.repeat(titleReq.max + 1);
            expect(SECTION_VALIDATION_FUNCTIONS.validateSectionTitle(tooLong, true, TEMPLATE)).toBe(
                COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMaxError(titleReq.max),
            );
        });

        it('returns undefined if no rules exist for a template', () => {
            // Using a template that might not exist or casting a fake template name
            expect(
                SECTION_VALIDATION_FUNCTIONS.validateSectionTitle('some text', true, 'INVALID_TEMPLATE' as any),
            ).toBeUndefined();
        });
    });

    describe('SECTION_VALIDATION_FUNCTIONS: validateSectionDescription', () => {
        it('returns min error if value is too short', () => {
            const tooShort = 'a'.repeat(descriptionReq.min - 1);
            expect(SECTION_VALIDATION_FUNCTIONS.validateSectionDescription(tooShort, false, TEMPLATE)).toBe(
                COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMinError(descriptionReq.min),
            );
        });

        it('returns max error if value is too long', () => {
            const tooLong = 'a'.repeat(descriptionReq.max + 1);
            expect(SECTION_VALIDATION_FUNCTIONS.validateSectionDescription(tooLong, false, TEMPLATE)).toBe(
                COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMaxError(descriptionReq.max),
            );
        });

        it('returns undefined if value is within bounds', () => {
            const validText = 'a'.repeat(descriptionReq.min);
            expect(SECTION_VALIDATION_FUNCTIONS.validateSectionDescription(validText, false, TEMPLATE)).toBeUndefined();
        });
    });

    describe('sectionValidationSchema', () => {
        it('should validate valid data sync', async () => {
            await expect(
                sectionValidationSchema.validate(
                    {
                        sectionTitle: 'a'.repeat(titleReq.min),
                        sectionDescription: 'b'.repeat(descriptionReq.min),
                    },
                    { context: { isPublishing: true, template: TEMPLATE } },
                ),
            ).resolves.toBeDefined();
        });
    });
});
