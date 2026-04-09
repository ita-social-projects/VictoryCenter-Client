import { PROGRAM_SECTION_TEMPLATE_VALIDATION } from '@/const/admin/programs';
import { CreateProgramSectionContentDto } from '@/types/common/program-sections';
import { SectionTemplate } from '@/types/common/sections';
import { ContentType } from '@/types/common/section-contents';

type Range = { min: number; max: number };

type TemplateRules = {
    lengths?: Partial<Record<ContentType, Range>>;
    grouping?: {
        groupCount: Range;
        perGroupCounts?: Partial<Record<ContentType, Range>>;
    };
};

const getTemplateRules = (template: SectionTemplate): TemplateRules | undefined =>
    (PROGRAM_SECTION_TEMPLATE_VALIDATION as any)[template] as TemplateRules | undefined;

const getLengthRule = (template: SectionTemplate, type: ContentType): Range | undefined => {
    const rules = getTemplateRules(template);
    return rules?.lengths?.[type];
};

export const getProgramSectionTemplateMaxLength = (template: SectionTemplate, type: ContentType): number =>
    getLengthRule(template, type)?.max ?? 0;

export const getProgramSectionTemplateMinLength = (template: SectionTemplate, type: ContentType): number =>
    getLengthRule(template, type)?.min ?? 0;

export const getProgramSectionTemplateMaxGroupCount = (template: SectionTemplate): number =>
    getTemplateRules(template)?.grouping?.groupCount?.max ?? 0;

export const getProgramSectionTemplateMinGroupCount = (template: SectionTemplate): number =>
    getTemplateRules(template)?.grouping?.groupCount?.min ?? 0;

export const normalizeGroupedContentsGroupIndexes = (
    contents: CreateProgramSectionContentDto[],
    groupedTypes: ContentType[],
): CreateProgramSectionContentDto[] => {
    const relevant = contents.filter(
        (c) => groupedTypes.includes(c.contentType) && c.groupIndex !== null && c.groupIndex !== undefined,
    );

    const uniqueSorted = Array.from(new Set(relevant.map((c) => c.groupIndex as number))).sort((a, b) => a - b);

    if (uniqueSorted.length === 0) return contents;

    const map = new Map<number, number>();
    uniqueSorted.forEach((oldIdx, newIdx) => {
        map.set(oldIdx, newIdx);
    });

    return contents.map((c) => {
        const gi = c.groupIndex;
        if (gi === null || gi === undefined) return c;

        const next = map.get(gi);
        if (next === undefined || next === gi) return c;

        return { ...c, groupIndex: next } as any;
    });
};
