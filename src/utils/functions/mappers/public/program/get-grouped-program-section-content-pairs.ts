import { ProgramSectionContent } from '@/types/common/program-sections';
import { ContentType } from '@/types/common/programs';

export interface GroupedProgramSectionValuesByType {
    groupIndex: number;
    byType: Partial<Record<ContentType, string>>;
}

export interface DescriptionAuthorPairGroup {
    groupIndex: number;
    description: string;
    author: string;
}

const getContentTextValueByType = (content: ProgramSectionContent): string => {
    switch (content.contentType) {
        case ContentType.Title:
            return content.title ?? '';
        case ContentType.Description:
            return content.description ?? '';
        case ContentType.Author:
            return content.author ?? '';
        default:
            return '';
    }
};

export const getGroupedProgramSectionValuesByGroup = (
    contents: ProgramSectionContent[],
    types: ContentType[],
): GroupedProgramSectionValuesByType[] => {
    const requestedTypes = Array.from(new Set(types));
    if (requestedTypes.length === 0) return [];

    const requestedTypesSet = new Set<ContentType>(requestedTypes);
    const map = new Map<number, Partial<Record<ContentType, string>>>();

    for (const content of contents) {
        if (
            content.groupIndex === null ||
            content.groupIndex === undefined ||
            !requestedTypesSet.has(content.contentType)
        ) {
            continue;
        }

        const groupIndex = content.groupIndex;

        let entry = map.get(groupIndex);

        if (!entry) {
            const initial: Partial<Record<ContentType, string>> = {};
            for (const type of requestedTypes) {
                initial[type] = '';
            }
            map.set(groupIndex, initial);
            entry = initial;
        }

        entry[content.contentType] = getContentTextValueByType(content);
    }

    return Array.from(map.entries())
        .sort((a, b) => a[0] - b[0])
        .map(([groupIndex, byType]) => ({
            groupIndex,
            byType,
        }));
};

export const getDescriptionAuthorPairsByGroup = (contents: ProgramSectionContent[]): DescriptionAuthorPairGroup[] => {
    return getGroupedProgramSectionValuesByGroup(contents, [ContentType.Description, ContentType.Author]).map(
        (group) => ({
            groupIndex: group.groupIndex,
            description: group.byType[ContentType.Description] || '',
            author: group.byType[ContentType.Author] || '',
        }),
    );
};
