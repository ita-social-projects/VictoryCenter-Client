import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { SECTION_TEMPLATE_VALIDATION } from '@/const/admin/sections';
import { ContentType } from '@/types/common/section-contents';
import { SectionTemplate } from '@/types/common/sections';
import * as Yup from 'yup';

export interface SectionValidationContext {
    isPublishing: boolean;
    template?: SectionTemplate;
}

type Range = { min: number; max: number };

type TemplateRules = {
    lengths?: Record<string | number, Range>;
};

const TEMPLATE_RULES = SECTION_TEMPLATE_VALIDATION as unknown as Partial<Record<SectionTemplate, TemplateRules>>;

const getTemplateRules = (template: SectionTemplate): TemplateRules | undefined => TEMPLATE_RULES[template];

const getRuleEntry = <T>(map: Record<string | number, T> | undefined, key: number): T | undefined =>
    map?.[key] ?? map?.[String(key)];

const createTemplateTextSchema = (type: ContentType) =>
    Yup.string()
        .trim()
        .required(COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.FIELD_REQUIRED)
        .test('template-length', function (value) {
            const ctx = (this.options.context ?? {}) as SectionValidationContext;
            const template = ctx.template;
            if (!template) return true;

            const rules = getTemplateRules(template);
            const req = getRuleEntry(rules?.lengths, type);

            if (!req) return true;

            const text = (value ?? '').trim();
            if (!text) return true;

            if (text.length > req.max) {
                return this.createError({ message: COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMaxError(req.max) });
            }

            if (text.length < req.min) {
                return this.createError({ message: COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMinError(req.min) });
            }

            return true;
        });

export const sectionValidationSchema = Yup.object({
    sectionTitle: createTemplateTextSchema(ContentType.Title),
    sectionDescription: createTemplateTextSchema(ContentType.Description),
});

export const SECTION_VALIDATION_FUNCTIONS = {
    validateSectionTitle: (value: string, isPublishing: boolean, template?: SectionTemplate): string | undefined => {
        const context: SectionValidationContext = { isPublishing, template };

        try {
            sectionValidationSchema.validateSyncAt('sectionTitle', { sectionTitle: value }, { context });
            return undefined;
        } catch (error: any) {
            return error.message;
        }
    },

    validateSectionDescription: (
        value: string,
        isPublishing: boolean,
        template?: SectionTemplate,
    ): string | undefined => {
        const context: SectionValidationContext = { isPublishing, template };

        try {
            sectionValidationSchema.validateSyncAt('sectionDescription', { sectionDescription: value }, { context });
            return undefined;
        } catch (error: any) {
            return error.message;
        }
    },
};
