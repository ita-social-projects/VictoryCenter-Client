import { ProgramSectionContent } from '@/types/common/program-sections';
import { ContentType } from '@/types/common/programs';

export interface GroupedProgramSectionTextPair {
    groupIndex: number;
    left: string;
    right: string;
}

export interface DescriptionAuthorPairGroup {
    groupIndex: number;
    description: string;
    author: string;
}

const getContentTextValueByType = (content: ProgramSectionContent, type: ContentType): string => {
    switch (type) {
        case ContentType.Title:
            return content.title || '';
        case ContentType.Description:
            return content.description || '';
        case ContentType.Author:
            return content.author || '';
        default:
            return '';
    }
};

export const getGroupedProgramSectionTextPairs = (
    contents: ProgramSectionContent[],
    leftType: ContentType,
    rightType: ContentType,
): GroupedProgramSectionTextPair[] => {
    const map = new Map<number, { left: string; right: string }>();

    for (const content of contents) {
        if (content.groupIndex === null || content.groupIndex === undefined) continue;

        const groupIndex = content.groupIndex;

        if (!map.has(groupIndex)) {
            map.set(groupIndex, { left: '', right: '' });
        }

        const entry = map.get(groupIndex)!;

        if (content.contentType === leftType) {
            entry.left = getContentTextValueByType(content, leftType);
        }

        if (content.contentType === rightType) {
            entry.right = getContentTextValueByType(content, rightType);
        }
    }

    return Array.from(map.entries())
        .sort((a, b) => a[0] - b[0])
        .map(([groupIndex, value]) => ({
            groupIndex,
            left: value.left,
            right: value.right,
        }));
};

export const getDescriptionAuthorPairsByGroup = (contents: ProgramSectionContent[]): DescriptionAuthorPairGroup[] => {
    return getGroupedProgramSectionTextPairs(contents, ContentType.Description, ContentType.Author).map((pair) => ({
        groupIndex: pair.groupIndex,
        description: pair.left,
        author: pair.right,
    }));
};
