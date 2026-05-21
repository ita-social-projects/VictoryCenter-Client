import { render, screen } from '@testing-library/react';
import { HistoryHero } from './HistoryHero';

jest.mock('../history-timeline/HistoryTimeline', () => ({
    HistoryTimeline: () => <div data-testid="history-timeline" />,
}));

describe('HistoryHero', () => {
    it('should render as a section element', () => {
        const { container } = render(<HistoryHero />);

        expect(container.querySelector('section')).toBeInTheDocument();
    });

    it('should render an h1 heading with translated content', () => {
        render(<HistoryHero />);

        const heading = screen.getByRole('heading', { level: 1 });
        expect(heading).toBeInTheDocument();
        expect(heading).toHaveTextContent('більше, ніж');
        expect(heading).toHaveTextContent('хронологія');
    });

    it('should render the HistoryTimeline component', () => {
        render(<HistoryHero />);

        expect(screen.getByTestId('history-timeline')).toBeInTheDocument();
    });

    it('should render the hero description paragraph', () => {
        render(<HistoryHero />);

        expect(screen.getByText(/Спочатку це були лише ідеї/)).toBeInTheDocument();
    });
});
