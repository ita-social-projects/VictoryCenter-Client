import { PROGRAM_SECTION_TEMPLATE_VALIDATION } from '@/const/admin/programs';
import { ProgramSectionContent, ProgramSectionTemplate } from '@/types/common/program-sections';
import { ContentType } from '@/types/common/programs';

type Range = { min: number; max: number };

type TemplateRules = {
    lengths?: Partial<Record<ContentType, Range>>;
    grouping?: {
        groupCount: Range;
        perGroupCounts?: Partial<Record<ContentType, Range>>;
    };
};

const getTemplateRules = (template: ProgramSectionTemplate): TemplateRules | undefined =>
    (PROGRAM_SECTION_TEMPLATE_VALIDATION as any)[template] as TemplateRules | undefined;

const getLengthRule = (template: ProgramSectionTemplate, type: ContentType): Range | undefined => {
    const rules = getTemplateRules(template);
    return rules?.lengths?.[type];
};

export const getProgramSectionTemplateMaxLength = (template: ProgramSectionTemplate, type: ContentType): number =>
    getLengthRule(template, type)?.max ?? 0;

export const getProgramSectionTemplateMinLength = (template: ProgramSectionTemplate, type: ContentType): number =>
    getLengthRule(template, type)?.min ?? 0;

export const getProgramSectionTemplateMaxGroupCount = (template: ProgramSectionTemplate): number =>
    getTemplateRules(template)?.grouping?.groupCount?.max ?? 0;

export const getProgramSectionTemplateMinGroupCount = (template: ProgramSectionTemplate): number =>
    getTemplateRules(template)?.grouping?.groupCount?.min ?? 0;

export const normalizeGroupedContentsGroupIndexes = (
    contents: ProgramSectionContent[],
    groupedTypes: ContentType[],
): ProgramSectionContent[] => {
    const relevant = contents.filter(
        (c) => groupedTypes.includes(c.contentType) && c.groupIndex !== null && c.groupIndex !== undefined,
    );

    const uniqueSorted = Array.from(new Set(relevant.map((c) => c.groupIndex as number))).sort((a, b) => a - b);

    if (uniqueSorted.length === 0) return contents;

    const map = new Map<number, number>();
    uniqueSorted.forEach((oldIdx, newIdx) => map.set(oldIdx, newIdx));

    return contents.map((c) => {
        const gi = c.groupIndex;
        if (gi === null || gi === undefined) return c;

        const next = map.get(gi);
        if (next === undefined || next === gi) return c;

        return { ...c, groupIndex: next } as any;
    });
};
