import { ProgramSectionContent } from '@/types/common/program-sections';
import { ContentType } from '@/types/common/programs';
import {
    getDescriptionAuthorPairsByGroup,
    getGroupedProgramSectionTextPairs,
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
    describe('getGroupedProgramSectionTextPairs', () => {
        it('returns an empty array when there are no grouped items', () => {
            const contents: ProgramSectionContent[] = [
                makeContent({ contentType: ContentType.Description, groupIndex: null, description: 'D' }),
                makeContent({ contentType: ContentType.Author, groupIndex: undefined, author: 'A' }),
            ];

            const result = getGroupedProgramSectionTextPairs(contents, ContentType.Description, ContentType.Author);

            expect(result).toEqual([]);
        });

        it('groups by groupIndex, sorts groups, and fills missing values with empty strings', () => {
            const contents: ProgramSectionContent[] = [
                makeContent({ contentType: ContentType.Description, groupIndex: 2, description: 'Desc 2' }),
                makeContent({ contentType: ContentType.Author, groupIndex: 2, author: 'Author 2' }),
                makeContent({ contentType: ContentType.Author, groupIndex: 1, author: 'Author 1' }),
                makeContent({ contentType: ContentType.Description, groupIndex: 1, description: null }),
                makeContent({ contentType: ContentType.Description, groupIndex: null, description: 'Ignored' }),
            ];

            const result = getGroupedProgramSectionTextPairs(contents, ContentType.Description, ContentType.Author);

            expect(result).toEqual([
                { groupIndex: 1, left: '', right: 'Author 1' },
                { groupIndex: 2, left: 'Desc 2', right: 'Author 2' },
            ]);
        });

        it('reads title values when Title is requested as leftType', () => {
            const contents: ProgramSectionContent[] = [
                makeContent({ contentType: ContentType.Title, groupIndex: 0, title: 'TITLE' }),
                makeContent({ contentType: ContentType.Description, groupIndex: 0, description: 'DESC' }),
            ];

            const result = getGroupedProgramSectionTextPairs(contents, ContentType.Title, ContentType.Description);

            expect(result).toEqual([{ groupIndex: 0, left: 'TITLE', right: 'DESC' }]);
        });

        it('falls back to empty string for null title and null author values', () => {
            const contents: ProgramSectionContent[] = [
                makeContent({ contentType: ContentType.Title, groupIndex: 0, title: null }),
                makeContent({ contentType: ContentType.Author, groupIndex: 0, author: null }),
            ];

            const result = getGroupedProgramSectionTextPairs(contents, ContentType.Title, ContentType.Author);

            expect(result).toEqual([{ groupIndex: 0, left: '', right: '' }]);
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

            const result = getGroupedProgramSectionTextPairs(contents, unknownType, ContentType.Description);

            expect(result).toEqual([{ groupIndex: 0, left: '', right: '' }]);
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
