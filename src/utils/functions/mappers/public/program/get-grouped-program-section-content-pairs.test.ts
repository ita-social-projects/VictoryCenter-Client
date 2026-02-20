import { ProgramSectionContent } from '@/types/common/program-sections';
import { ContentType } from '@/types/common/programs';
import {
    getDescriptionAuthorPairsByGroup,
    getGroupedProgramSectionValuesByGroup,
} from './get-grouped-program-section-content-pairs';

const makeContent = (overrides: Partial<ProgramSectionContent>): ProgramSectionContent =>
    ({
        contentType: ContentType.Description,
        order: 0,
        title: null,
        description: null,
        author: null,
        image: null,
        ...overrides,
    }) as ProgramSectionContent;

describe('get-grouped-program-section-content-pairs', () => {
    describe('getGroupedProgramSectionValuesByGroup', () => {
        it('supports 4 content types per group and keeps sorted group order', () => {
            const unknownType = 999 as ContentType;
            const contents: ProgramSectionContent[] = [
                makeContent({ contentType: ContentType.Author, groupIndex: 2, author: 'A2' }),
                makeContent({ contentType: ContentType.Title, groupIndex: 2, title: 'T2' }),
                makeContent({ contentType: ContentType.Description, groupIndex: 2, description: 'D2' }),
                makeContent({ contentType: unknownType, groupIndex: 2 } as any),
                makeContent({ contentType: ContentType.Title, groupIndex: 0, title: 'T0' }),
                makeContent({ contentType: ContentType.Description, groupIndex: 0, description: 'D0' }),
                makeContent({ contentType: ContentType.Author, groupIndex: 0, author: null }),
                makeContent({ contentType: unknownType, groupIndex: 0 } as any),
            ];

            const result = getGroupedProgramSectionValuesByGroup(contents, [
                ContentType.Title,
                ContentType.Description,
                ContentType.Author,
                unknownType,
            ]);

            expect(result).toEqual([
                {
                    groupIndex: 0,
                    byType: {
                        [ContentType.Title]: 'T0',
                        [ContentType.Description]: 'D0',
                        [ContentType.Author]: '',
                        [unknownType]: '',
                    },
                },
                {
                    groupIndex: 2,
                    byType: {
                        [ContentType.Title]: 'T2',
                        [ContentType.Description]: 'D2',
                        [ContentType.Author]: 'A2',
                        [unknownType]: '',
                    },
                },
            ]);
        });

        it('returns empty array when requested types are empty', () => {
            const contents: ProgramSectionContent[] = [
                makeContent({ contentType: ContentType.Title, groupIndex: 0, title: 'T0' }),
            ];

            const result = getGroupedProgramSectionValuesByGroup(contents, []);

            expect(result).toEqual([]);
        });

        it('does not create group when a group contains only unrequested content types', () => {
            const contents: ProgramSectionContent[] = [
                makeContent({ contentType: ContentType.Title, groupIndex: 0, title: 'T0' }),
                makeContent({ contentType: ContentType.Author, groupIndex: 1, author: 'A1' }),
            ];

            const result = getGroupedProgramSectionValuesByGroup(contents, [ContentType.Description]);

            expect(result).toEqual([]);
        });

        it('returns an empty array when there are no grouped items for requested types', () => {
            const contents: ProgramSectionContent[] = [
                makeContent({ contentType: ContentType.Description, groupIndex: null, description: 'D' }),
                makeContent({ contentType: ContentType.Author, groupIndex: undefined, author: 'A' }),
            ];

            const result = getGroupedProgramSectionValuesByGroup(contents, [
                ContentType.Description,
                ContentType.Author,
            ]);

            expect(result).toEqual([]);
        });

        it('fills missing values with empty strings for requested types', () => {
            const contents: ProgramSectionContent[] = [
                makeContent({ contentType: ContentType.Description, groupIndex: 2, description: 'Desc 2' }),
                makeContent({ contentType: ContentType.Author, groupIndex: 2, author: 'Author 2' }),
                makeContent({ contentType: ContentType.Author, groupIndex: 1, author: 'Author 1' }),
                makeContent({ contentType: ContentType.Description, groupIndex: 1, description: null }),
                makeContent({ contentType: ContentType.Description, groupIndex: null, description: 'Ignored' }),
            ];

            const result = getGroupedProgramSectionValuesByGroup(contents, [
                ContentType.Description,
                ContentType.Author,
            ]);

            expect(result).toEqual([
                {
                    groupIndex: 1,
                    byType: {
                        [ContentType.Description]: '',
                        [ContentType.Author]: 'Author 1',
                    },
                },
                {
                    groupIndex: 2,
                    byType: {
                        [ContentType.Description]: 'Desc 2',
                        [ContentType.Author]: 'Author 2',
                    },
                },
            ]);
        });

        it('reads title and description values for requested types', () => {
            const contents: ProgramSectionContent[] = [
                makeContent({ contentType: ContentType.Title, groupIndex: 0, title: 'TITLE' }),
                makeContent({ contentType: ContentType.Description, groupIndex: 0, description: 'DESC' }),
            ];

            const result = getGroupedProgramSectionValuesByGroup(contents, [
                ContentType.Title,
                ContentType.Description,
            ]);

            expect(result).toEqual([
                {
                    groupIndex: 0,
                    byType: {
                        [ContentType.Title]: 'TITLE',
                        [ContentType.Description]: 'DESC',
                    },
                },
            ]);
        });

        it('falls back to empty string for null title and null author values', () => {
            const contents: ProgramSectionContent[] = [
                makeContent({ contentType: ContentType.Title, groupIndex: 0, title: null }),
                makeContent({ contentType: ContentType.Author, groupIndex: 0, author: null }),
            ];

            const result = getGroupedProgramSectionValuesByGroup(contents, [ContentType.Title, ContentType.Author]);

            expect(result).toEqual([
                {
                    groupIndex: 0,
                    byType: {
                        [ContentType.Title]: '',
                        [ContentType.Author]: '',
                    },
                },
            ]);
        });

        it('returns empty string for unknown text content type (default switch branch)', () => {
            const unknownType = 999 as ContentType;

            const contents: ProgramSectionContent[] = [
                makeContent({
                    contentType: unknownType,
                    groupIndex: 0,
                    title: 'TITLE',
                    description: 'DESC',
                    author: 'AUTHOR',
                } as any),
            ];

            const result = getGroupedProgramSectionValuesByGroup(contents, [unknownType, ContentType.Description]);

            expect(result).toEqual([
                {
                    groupIndex: 0,
                    byType: {
                        [unknownType]: '',
                        [ContentType.Description]: '',
                    },
                },
            ]);
        });
    });

    describe('getDescriptionAuthorPairsByGroup', () => {
        it('maps grouped text pairs into description-author shape', () => {
            const contents: ProgramSectionContent[] = [
                makeContent({ contentType: ContentType.Description, groupIndex: 1, description: 'D1' }),
                makeContent({ contentType: ContentType.Author, groupIndex: 1, author: 'A1' }),
                makeContent({ contentType: ContentType.Description, groupIndex: 0, description: 'D0' }),
                makeContent({ contentType: ContentType.Author, groupIndex: 0, author: 'A0' }),
            ];

            const result = getDescriptionAuthorPairsByGroup(contents);

            expect(result).toEqual([
                { groupIndex: 0, description: 'D0', author: 'A0' },
                { groupIndex: 1, description: 'D1', author: 'A1' },
            ]);
        });
    });
});
