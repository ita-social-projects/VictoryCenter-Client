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
    it('SECTION_VALIDATION_FUNCTIONS: validateSectionTitle returns required', () => {
        expect(SECTION_VALIDATION_FUNCTIONS.validateSectionTitle('', true, TEMPLATE)).toBe(
            COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.FIELD_REQUIRED,
        );
    });

    it('SECTION_VALIDATION_FUNCTIONS: validateSectionDescription returns max error', () => {
        const tooLong = 'a'.repeat(descriptionReq.max + 1);

        expect(SECTION_VALIDATION_FUNCTIONS.validateSectionDescription(tooLong, false, TEMPLATE)).toBe(
            COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMaxError(descriptionReq.max),
        );
    });

    it('sectionValidationSchema is executed', async () => {
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
