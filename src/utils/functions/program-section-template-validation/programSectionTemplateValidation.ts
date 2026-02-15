import { PROGRAM_SECTION_TEMPLATE_VALIDATION } from '@/const/admin/programs';
import { ProgramSectionTemplate } from '@/types/common/program-sections';
import { ContentType } from '@/types/common/programs';

type Range = { min: number; max: number };

const getLengthRule = (template: ProgramSectionTemplate, type: ContentType): Range | undefined => {
    const rules = (PROGRAM_SECTION_TEMPLATE_VALIDATION as any)[template] as
        | { lengths?: Partial<Record<ContentType, Range>> }
        | undefined;
    return rules?.lengths?.[type];
};

export const getProgramSectionTemplateMaxLength = (template: ProgramSectionTemplate, type: ContentType): number =>
    getLengthRule(template, type)?.max ?? 0;

export const getProgramSectionTemplateMinLength = (template: ProgramSectionTemplate, type: ContentType): number =>
    getLengthRule(template, type)?.min ?? 0;
