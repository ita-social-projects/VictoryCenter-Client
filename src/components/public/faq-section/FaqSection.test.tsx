import { render, screen, waitFor } from '@testing-library/react';
import { FaqSection } from './FaqSection';
import { getBySlug as mockGetBySlug } from '../../../utils/mock-data/public/faq-section';
import { COMMON_QUESTIONS } from '../../../const/public/programs-page';

jest.mock('./faq-card/FaqCard', () => ({
    FaqCard: ({ faq }: any) => <div data-testid="faq-card">{faq.questionText}</div>,
}));

jest.mock('../../../utils/mock-data/public/faq-section', () => ({
    getBySlug: jest.fn(),
}));

describe('FaqSection', () => {
    const slug = 'test-slug';

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('renders nothing if no questions are returned', async () => {
        (mockGetBySlug as jest.Mock).mockReturnValue([]);

        render(<FaqSection slug={slug} />);

        await waitFor(() => {
            expect(screen.queryByTestId('faq-card')).toBeNull();
        });
    });

    it('renders questions if getBySlug returns data', async () => {
        const mockQuestions = [
            { id: 1, questionText: 'What is this?', answerText: 'A test', status: 1, createdAt: new Date() },
            { id: 2, questionText: 'How does it work?', answerText: 'Like this', status: 1, createdAt: new Date() },
        ];
        (mockGetBySlug as jest.Mock).mockReturnValue(mockQuestions);

        render(<FaqSection slug={slug} />);

        expect(await screen.findByText(COMMON_QUESTIONS)).toBeInTheDocument();

        const cards = await screen.findAllByTestId('faq-card');
        expect(cards).toHaveLength(2);
        expect(cards[0]).toHaveTextContent('What is this?');
        expect(cards[1]).toHaveTextContent('How does it work?');
    });

    it('calls getBySlug with the provided slug', async () => {
        (mockGetBySlug as jest.Mock).mockReturnValue([]);

        render(<FaqSection slug={slug} />);

        await waitFor(() => {
            expect(mockGetBySlug).toHaveBeenCalledWith(slug);
        });
    });

    it('sets empty questions array if getBySlug throws', async () => {
        (mockGetBySlug as jest.Mock).mockImplementation(() => {
            throw new Error('boom');
        });

        render(<FaqSection slug={slug} />);

        await waitFor(() => {
            expect(screen.queryByTestId('faq-card')).toBeNull();
        });
    });
});
