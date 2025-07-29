import React from 'react';
import { FaqQuestion } from '../../../types/public/Faq';
import { FaqSection } from './FaqSection';

const spyQuestionDataFetch = jest.spyOn(ProgramPageFetchModule, 'questionDataFetch');
const mockQuestions: FaqQuestion[] = [
    {
        id: 1,
        question: 'question1',
        answer: 'answer1',
    },
    {
        id: 2,
        question: 'question2',
        answer: 'answer2',
    },
];
jest.mock('./question-card/QuestionCard', () => ({
    QuestionCard: ({ questionCard }: any) => (
        <div data-testid="test-question-block">
            <h3 className="test-question">{questionCard.question}</h3>
            <p className="test-answer">{questionCard.answer}</p>
        </div>
    ),
}));
describe('test question section', () => {
    afterEach(() => {
        jest.resetAllMocks();
    });
    test('should render correctly', async () => {
        spyQuestionDataFetch.mockResolvedValue({ questions: mockQuestions });
        render(<FaqSection slug={''} />);

        await waitFor(() => {
            expect(spyQuestionDataFetch).toHaveBeenCalledTimes(1);

            expect(screen.getByRole('heading', { name: 'question1' })).toBeInTheDocument();
            expect(screen.getByText('answer1')).toBeInTheDocument();

            expect(screen.getByRole('heading', { name: 'question2' })).toBeInTheDocument();
            expect(screen.getByText('answer2')).toBeInTheDocument();

            const allQuestions = screen.queryAllByTestId('test-question-block');
            expect(allQuestions.length).toEqual(2);
        });
    });
    test('should render with no cards', async () => {
        spyQuestionDataFetch.mockResolvedValue({ questions: [] });
        render(<FaqSection />);

        await waitFor(() => {
            expect(spyQuestionDataFetch).toHaveBeenCalledTimes(1);
            const allQuestions = screen.queryAllByTestId('test-question-block');
            expect(allQuestions.length).toEqual(0);
        });
    });
    test('should render without crashing', async () => {
        spyQuestionDataFetch.mockRejectedValueOnce(new Error('Fetch error'));
        render(<FaqSection />);

        await waitFor(() => {
            expect(spyQuestionDataFetch).toHaveBeenCalledTimes(1);
            const allQuestions = screen.queryAllByTestId('test-question-block');
            expect(allQuestions.length).toEqual(0);

            const errorMessage = document.querySelector('.error-message');
            expect(errorMessage).toBeInTheDocument();
        });
    });
});
