import {
    getSectionTemplateMaxGroupCount,
    getSectionTemplateMaxLength,
    getSectionTemplateMinGroupCount,
    getSectionTemplateMinLength,
    normalizeGroupedContentsGroupIndexes,
} from './programSectionTemplateValidation';
import { SectionTemplate } from '@/types/common/sections';
import { ContentType } from '@/types/common/section-contents';

jest.mock('@/const/admin/programs', () => {
    const { SectionTemplate } = require('@/types/common/program-sections');
    const { ContentType } = require('@/types/common/programs');

    return {
        PROGRAM_SECTION_TEMPLATE_VALIDATION: {
            [SectionTemplate.SingleTitleDescriptionAuthorPairs]: {
                lengths: {
                    [ContentType.Title]: { min: 3, max: 10 },
                },
                grouping: {
                    groupCount: { min: 1, max: 4 },
                },
            },
        },
    };
});

const TEMPLATE_WITH_RULES = SectionTemplate.SingleTitleDescriptionAuthorPairs;
const MISSING_TEMPLATE = 'MISSING_TEMPLATE' as any as SectionTemplate;
const MISSING_TYPE = 'MISSING_TYPE' as any as ContentType;

const content = (contentType: ContentType, groupIndex: number | null | undefined) =>
    ({ contentType, groupIndex }) as any;

const buildGappedFixture = () => {
    const c0 = content(ContentType.Description, 2);
    const c1 = content(ContentType.Description, 5);
    const c2 = content(ContentType.Title, 5);
    const c3 = content(ContentType.Title, 999);
    const c4 = content(ContentType.Description, null);
    const c5 = content(ContentType.Title, undefined);

    return {
        contents: [c0, c1, c2, c3, c4, c5],
        groupedTypes: [ContentType.Description],
        refs: { c0, c1, c2, c3, c4, c5 },
    };
};

describe('programSectionTemplateValidation', () => {
    describe('length rules', () => {
        it('returns max length from rules', () => {
            expect(getSectionTemplateMaxLength(TEMPLATE_WITH_RULES, ContentType.Title)).toBe(10);
        });

        it('returns min length from rules', () => {
            expect(getSectionTemplateMinLength(TEMPLATE_WITH_RULES, ContentType.Title)).toBe(3);
        });

        it('returns 0 when type has no rule', () => {
            expect(getSectionTemplateMaxLength(TEMPLATE_WITH_RULES, MISSING_TYPE)).toBe(0);
        });

        it('returns 0 when template has no rules', () => {
            expect(getSectionTemplateMinLength(MISSING_TEMPLATE, ContentType.Title)).toBe(0);
        });
    });

    describe('group count rules', () => {
        it('returns max group count from rules', () => {
            expect(getSectionTemplateMaxGroupCount(TEMPLATE_WITH_RULES)).toBe(4);
        });

        it('returns min group count from rules', () => {
            expect(getSectionTemplateMinGroupCount(TEMPLATE_WITH_RULES)).toBe(1);
        });

        it('returns 0 when template has no grouping rules', () => {
            expect(getSectionTemplateMaxGroupCount(MISSING_TEMPLATE)).toBe(0);
        });
    });

    describe('normalizeGroupedContentsGroupIndexes', () => {
        it('returns the same array reference when there are no relevant grouped items', () => {
            const contents = [content(ContentType.Title, 0)];
            const res = normalizeGroupedContentsGroupIndexes(contents, [ContentType.Description]);
            expect(res).toBe(contents);
        });

        it('keeps item references when indexes are already normalized', () => {
            const c0 = content(ContentType.Description, 0);
            const c1 = content(ContentType.Description, 1);
            const c2 = content(ContentType.Title, 0);

            const contents = [c0, c1, c2];
            const res = normalizeGroupedContentsGroupIndexes(contents, [ContentType.Description]);

            expect(res[0]).toBe(c0);
            expect(res).not.toBe(contents);
        });

        it('renumbers grouped items with gaps', () => {
            const { contents, groupedTypes, refs } = buildGappedFixture();
            const res = normalizeGroupedContentsGroupIndexes(contents, groupedTypes);

            expect(res[0].groupIndex).toBe(0);
            expect(res[0]).not.toBe(refs.c0);
        });

        it('renumbers non-grouped items if their groupIndex exists in the map', () => {
            const { contents, groupedTypes, refs } = buildGappedFixture();
            const res = normalizeGroupedContentsGroupIndexes(contents, groupedTypes);

            expect(res[2].groupIndex).toBe(1);
            expect(res[2]).not.toBe(refs.c2);
        });

        it('does not change items when groupIndex is not present in the map', () => {
            const { contents, groupedTypes, refs } = buildGappedFixture();
            const res = normalizeGroupedContentsGroupIndexes(contents, groupedTypes);

            expect(res[3]).toBe(refs.c3);
        });

        it('does not change items with null or undefined groupIndex', () => {
            const { contents, groupedTypes, refs } = buildGappedFixture();
            const res = normalizeGroupedContentsGroupIndexes(contents, groupedTypes);

            expect(res[4]).toBe(refs.c4);
            expect(res[5]).toBe(refs.c5);
        });
    });
});
