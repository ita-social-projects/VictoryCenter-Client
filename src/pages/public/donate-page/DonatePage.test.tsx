import { render, screen } from '@testing-library/react';
import { DonatePage } from './DonatePage';

describe('DonatePage', () => {
    it('renders DonatePageIntro, DonateSection, and RightSection', () => {
        render(<DonatePage />);

        const headings = screen.getAllByRole('heading');
        expect(headings.length).toBeGreaterThan(0);
        expect(headings[0]).toHaveTextContent(/МИ ВДЯЧНІ/i);

        expect(screen.getByTestId('donate-section-form')).toBeInTheDocument();

        expect(screen.getByText('Разовий донат')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Донатити/i })).toBeInTheDocument();

        expect(screen.getByRole('checkbox')).toBeInTheDocument();
    });

    it('renders all main sections with correct content', () => {
        render(<DonatePage />);

        expect(screen.getByText(/МИ ВДЯЧНІ/i)).toBeInTheDocument();
        expect(screen.getByText(/ЗА КОЖЕН ДОНАТ/i)).toBeInTheDocument();

        expect(screen.getByText(/Разовий донат/i)).toBeInTheDocument();
        expect(screen.getByText(/Підписка/i)).toBeInTheDocument();

        expect(screen.getByText(/Реквізити для донатів в Україні/i)).toBeInTheDocument();
        expect(screen.getByText(/Я в Україні/i)).toBeInTheDocument();

        expect(screen.getByText(/Інші варіанти підтримки/i)).toBeInTheDocument();
    });
});
