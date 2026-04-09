import {
    CreateHippotherapyProgramSectionDto,
    CreateProgramSectionContentDto,
    SectionTemplate,
} from '@/types/common/program-sections';
import { ContentType } from '@/types/common/programs';
import { getDescriptionAuthorPairsByGroup } from '@/utils/functions/mappers/public/program/get-grouped-program-section-content-pairs';

export const getContentByType = (
    contents: CreateProgramSectionContentDto[],
    type: ContentType,
): CreateProgramSectionContentDto | undefined => {
    return contents.find((c) => c.contentType === type);
};

export const getDescriptionsInOrder = (
    contents: CreateProgramSectionContentDto[],
): CreateProgramSectionContentDto[] => {
    return contents.filter((c) => c.contentType === ContentType.Description).sort((a, b) => a.order - b.order);
};

export const getFaqPairs = (contents: CreateProgramSectionContentDto[]) => {
    return contents
        .filter((c) => c.contentType === ContentType.FaqQuestion)
        .sort((a, b) => a.order - b.order)
        .map((c, index) => ({
            id: c.faqQuestion?.id,
            groupIndex: c.groupIndex ?? index,
            questionText: c.faqQuestion?.questionText || '',
            answerText: c.faqQuestion?.answerText || '',
        }));
};

export const getNextOrder = (contents: CreateProgramSectionContentDto[]): number => {
    return contents.length ? Math.max(...contents.map((c) => c.order)) + 1 : 0;
};

export const ensureTitleContent = (contents: CreateProgramSectionContentDto[]): CreateProgramSectionContentDto[] => {
    const hasTitleContent = contents.some((c) => c.contentType === ContentType.Title);
    if (hasTitleContent) return contents;

    return [
        ...contents,
        {
            contentType: ContentType.Title,
            order: getNextOrder(contents),
            title: '',
        } as any,
    ];
};

export const ensureDescriptionAuthorPair = (
    contents: CreateProgramSectionContentDto[],
): CreateProgramSectionContentDto[] => {
    const pairs = getDescriptionAuthorPairsByGroup(contents);
    if (pairs.length > 0) return contents;

    const nextOrder = getNextOrder(contents);
    return [
        ...contents,
        {
            contentType: ContentType.Description,
            order: nextOrder,
            groupIndex: 0,
            description: '',
        } as any,
        {
            contentType: ContentType.Author,
            order: nextOrder + 1,
            groupIndex: 0,
            author: '',
        } as any,
    ];
};

export const ensureFaqPair = (contents: CreateProgramSectionContentDto[]): CreateProgramSectionContentDto[] => {
    const existing = getFaqPairs(contents);
    if (existing.length > 0) return contents;

    return [
        ...contents,
        {
            contentType: ContentType.FaqQuestion,
            order: getNextOrder(contents),
            groupIndex: 0,
            faqQuestion: {
                questionText: '',
                answerText: '',
            },
        } as any,
    ];
};

export const PAIRED_TEMPLATES = new Set([
    SectionTemplate.SingleTitleDescriptionAuthorPairs,
    SectionTemplate.SingleTitleQuestionAnswerPairs,
]);

export const ensureTitleContentAndOnePair = (
    section: CreateHippotherapyProgramSectionDto,
): CreateHippotherapyProgramSectionDto => {
    if (!PAIRED_TEMPLATES.has(section.template)) {
        return section;
    }

    let contents = ensureTitleContent(section.contents);

    if (section.template === SectionTemplate.SingleTitleDescriptionAuthorPairs) {
        contents = ensureDescriptionAuthorPair(contents);
    } else {
        contents = ensureFaqPair(contents);
    }

    return contents === section.contents ? section : { ...section, contents };
};
