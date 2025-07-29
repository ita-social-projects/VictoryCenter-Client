import { AxiosInstance } from 'axios';
import { FaqQuestion, PublicFaqQuestionDto } from '../../../../types/public/faq';
import { FaqApi, mapFaqQuestionDtoToFaqQuestion } from './faq-api';

describe('mapFaqQuestionDtoToFaqQuestion', () => {
    it('should correctly map PublicFaqQuestionDto to FaqQuestion', () => {
        const dto: PublicFaqQuestionDto = {
            id: 1,
            question: 'What is this?',
            answer: 'This is a test answer.',
        };

        const expected: FaqQuestion = {
            id: 1,
            question: 'What is this?',
            answer: 'This is a test answer.',
        };

        const result = mapFaqQuestionDtoToFaqQuestion(dto);
        expect(result).toEqual(expected);
    });
});

describe('TeamCategoriesApi.getBySlug', () => {
    it('should fetch and map FAQ questions by slug', async () => {
        const slug = 'team-slug';

        const mockData: PublicFaqQuestionDto[] = [
            { id: 1, question: 'Q1', answer: 'A1' },
            { id: 2, question: 'Q2', answer: 'A2' },
        ];

        const mockClient = {
            get: jest.fn().mockResolvedValue({
                data: mockData,
            }),
        } as unknown as AxiosInstance;

        const result = FaqApi.getBySlug(mockClient, slug);

        expect(mockClient.get).toHaveBeenCalledWith(`/published/${slug}`);
        expect(result).toEqual([
            { id: 1, question: 'Q1', answer: 'A1' },
            { id: 2, question: 'Q2', answer: 'A2' },
        ]);
    });
});
