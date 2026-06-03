import { HippotherapyProgramSectionContentDto } from '@/types/common/program-sections';
import { ContentType } from '@/types/common/section-contents';

type ContentTextData = Pick<
    HippotherapyProgramSectionContentDto,
    'contentType' | 'groupIndex' | 'title' | 'description' | 'author'
>;

export interface GroupedProgramSectionValuesByType {
    groupIndex: number;
    byType: Partial<Record<ContentType, string>>;
}

export interface DescriptionAuthorPairGroup {
    groupIndex: number;
    description: string;
    author: string;
}

const getContentTextValueByType = (content: ContentTextData): string => {
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
    contents: ContentTextData[],
    types: ContentType[],
): GroupedProgramSectionValuesByType[] => {
    const requestedTypes = Array.from(new Set(types));
    if (requestedTypes.length === 0) return [];

    const requestedTypesSet = new Set<ContentType>(requestedTypes);
    const groupValuesByTypeMap = new Map<number, Partial<Record<ContentType, string>>>();

    for (const content of contents) {
        if (
            content.groupIndex === null ||
            content.groupIndex === undefined ||
            !requestedTypesSet.has(content.contentType)
        ) {
            continue;
        }

        const groupIndex = content.groupIndex;

        let entry = groupValuesByTypeMap.get(groupIndex);

        if (!entry) {
            const initial: Partial<Record<ContentType, string>> = {};
            for (const type of requestedTypes) {
                initial[type] = '';
            }
            groupValuesByTypeMap.set(groupIndex, initial);
            entry = initial;
        }

        entry[content.contentType] = getContentTextValueByType(content);
    }

    return Array.from(groupValuesByTypeMap.entries())
        .sort((a, b) => a[0] - b[0])
        .map(([groupIndex, byType]) => ({
            groupIndex,
            byType,
        }));
};

export const getDescriptionAuthorPairsByGroup = (contents: ContentTextData[]): DescriptionAuthorPairGroup[] => {
    return getGroupedProgramSectionValuesByGroup(contents, [ContentType.Description, ContentType.Author]).map(
        (group) => ({
            groupIndex: group.groupIndex,
            description: group.byType[ContentType.Description] || '',
            author: group.byType[ContentType.Author] || '',
        }),
    );
};
