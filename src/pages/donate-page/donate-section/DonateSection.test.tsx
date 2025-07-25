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
    });
});
