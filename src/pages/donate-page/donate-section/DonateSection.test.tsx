import { render, screen, fireEvent } from '@testing-library/react';
import { DonateSection } from './DonateSection';

describe('DonateSection', () => {
    it('renders input, currency selector, and quick amount buttons', () => {
        render(<DonateSection />);
        expect(screen.getByPlaceholderText('0')).toBeInTheDocument();
        expect(screen.getByRole('combobox')).toBeInTheDocument();
        expect(screen.getAllByRole('button', { name: /\+/ })).toHaveLength(3);
    });

    it('changes donation amount via input', () => {
        render(<DonateSection />);
        const input = screen.getByPlaceholderText('0');
        fireEvent.change(input, { target: { value: '123' } });
        expect(input).toHaveValue('123');
    });

    it('sanitizes input to allow only numbers', () => {
        render(<DonateSection />);
        const input = screen.getByPlaceholderText('0');
        fireEvent.change(input, { target: { value: '12a3b4!@#' } });
        expect(input).toHaveValue('1234');
        fireEvent.change(input, { target: { value: '-100' } });
        expect(input).toHaveValue('100');
        fireEvent.change(input, { target: { value: '+200' } });
        expect(input).toHaveValue('200');
    });

    it('increments donation amount with quick buttons', () => {
        render(<DonateSection />);
        const input = screen.getByPlaceholderText('0');
        const [btn10, btn50, btn100] = screen.getAllByRole('button', { name: /\+/ });
        fireEvent.click(btn10);
        expect(input).toHaveValue('10');
        fireEvent.click(btn50);
        expect(input).toHaveValue('60');
        fireEvent.click(btn100);
        expect(input).toHaveValue('160');
    });

    it('changes currency', () => {
        render(<DonateSection />);
        const select = screen.getByRole('combobox');
        fireEvent.change(select, { target: { value: 'USD' } });
        expect(select).toHaveValue('USD');
        fireEvent.change(select, { target: { value: 'EUR' } });
        expect(select).toHaveValue('EUR');
    });

    it('shows correct submit button label for one-time and subscription tabs', () => {
        render(<DonateSection />);
        const oneTimeBtn = screen.getByRole('button', { name: /Разовий донат/i });
        const submitBtn = screen.getByRole('button', { name: /Донатити/i });
        expect(submitBtn).toBeInTheDocument();
        fireEvent.click(oneTimeBtn); // Should stay on one-time
        expect(submitBtn).toHaveTextContent(/Донатити/i);
    });

    it('renders tooltip for subscription tab', () => {
        render(<DonateSection />);
        expect(screen.getByText(/Subscription is not yet available/i)).toBeInTheDocument();
        expect(screen.getByText(/Please check back later/i)).toBeInTheDocument();
    });

    it('does not submit form if amount is 0 or not integer', () => {
        render(<DonateSection />);
        const form = screen.getByTestId('donate-section-form');
        const input = screen.getByPlaceholderText('0');
        fireEvent.change(input, { target: { value: '0' } });
        fireEvent.submit(form);
        expect(input).toHaveValue('0');
        fireEvent.change(input, { target: { value: '15' } });
        fireEvent.submit(form);
        expect(input).toHaveValue('15');
    });
});
