import { render, screen } from '@testing-library/react';
import { DonatePage } from './DonatePage';

jest.mock('./right-section/RightSection', () => ({
    RightSection: () => <div data-testid="right-section"></div>,
}));

describe('DonatePage', () => {
    it('renders DonatePageIntro, DonateSection, and RightSection', () => {
        render(<DonatePage />);

        const headings = screen.getAllByRole('heading');
        expect(headings.length).toBeGreaterThan(0);
        expect(headings[0]).toHaveTextContent(/МИ ВДЯЧНІ/i);

        expect(screen.getByTestId('donate-section-form')).toBeInTheDocument();

        expect(screen.getByText('Разовий донат')).toBeInTheDocument();
        expect(screen.getByText(/Підписка/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Донатити/i })).toBeInTheDocument();

        expect(screen.getByTestId('right-section')).toBeInTheDocument();
    });
});
