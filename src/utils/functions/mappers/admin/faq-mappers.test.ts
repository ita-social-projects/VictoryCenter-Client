import { mapFaqQuestionDtoToModel } from './faq-mappers';
import { FaqQuestionDto, VisitorPage } from '../../../../types/admin/faq';
import { VisibilityStatus } from '../../../../types/admin/common';

describe('mapFaqQuestionDtoToModel', () => {
    const pages: VisitorPage[] = [
        { id: 1, title: 'Home', slug: 'home' },
        { id: 2, title: 'About', slug: 'about' },
        { id: 3, title: 'Contact', slug: 'contact' },
    ];

    it('maps dto to model with correct pages', () => {
        const dto: FaqQuestionDto = {
            id: 10,
            questionText: 'What is this?',
            answerText: 'This is a test.',
            status: VisibilityStatus.Published,
            pageIds: [1, 3],
        };

        const result = mapFaqQuestionDtoToModel(dto, pages);

        expect(result).toEqual({
            id: 10,
            questionText: 'What is this?',
            answerText: 'This is a test.',
            status: VisibilityStatus.Published,
            pages: [
                { id: 1, title: 'Home', slug: 'home' },
                { id: 3, title: 'Contact', slug: 'contact' },
            ],
        });
    });

    it('returns empty pages array if no pageIds match', () => {
        const dto: FaqQuestionDto = {
            id: 11,
            questionText: 'No match?',
            answerText: 'No pages should match.',
            status: VisibilityStatus.Draft,
            pageIds: [99],
        };

        const result = mapFaqQuestionDtoToModel(dto, pages);

        expect(result.pages).toEqual([]);
    });

    it('returns empty pages array if pageIds is empty', () => {
        const dto: FaqQuestionDto = {
            id: 12,
            questionText: 'Empty?',
            answerText: 'No pages.',
            status: VisibilityStatus.Draft,
            pageIds: [],
        };

        const result = mapFaqQuestionDtoToModel(dto, pages);

        expect(result.pages).toEqual([]);
    });
});
