import { render, screen, waitFor } from '@testing-library/react';
import { FaqSection } from './FaqSection';
import { FaqApi } from '@api/public/faq/faq-api';

jest.mock('@api/public/faq/faq-api', () => ({
    FaqApi: {
        getBySlug: jest.fn(),
    },
}));

jest.mock('./faq-card/FaqCard', () => ({
    FaqCard: ({ faq }: any) => <div data-testid="faq-card">{faq.question}</div>,
}));

const mockQuestions = [
    { question: 'Q1', answer: 'A1' },
    { question: 'Q2', answer: 'A2' },
];

describe('FaqSection', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders nothing when there are no questions', async () => {
        (FaqApi.getBySlug as jest.Mock).mockResolvedValue([]);
        render(<FaqSection slug="test-slug" />);
        await waitFor(() => {
            expect(screen.queryByTestId('faq-card')).not.toBeInTheDocument();
        });
    });

    it('renders FAQ cards when questions are loaded', async () => {
        (FaqApi.getBySlug as jest.Mock).mockResolvedValue(mockQuestions);
        render(<FaqSection slug="test-slug" />);
        await waitFor(() => {
            expect(screen.getAllByTestId('faq-card')).toHaveLength(2);
            expect(screen.getByText('Q1')).toBeInTheDocument();
            expect(screen.getByText('Q2')).toBeInTheDocument();
        });
    });

    it('renders nothing if API throws', async () => {
        (FaqApi.getBySlug as jest.Mock).mockRejectedValue(new Error('API error'));
        render(<FaqSection slug="test-slug" />);
        await waitFor(() => {
            expect(screen.queryByTestId('faq-card')).not.toBeInTheDocument();
        });
    });
});
