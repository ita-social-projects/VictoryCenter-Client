import { render, screen } from '@testing-library/react';
import { UkrainePaymentDetails } from './UkrainePaymentDetails';

describe('UkrainePaymentDetails', () => {
    it('renders all payment labels and copy buttons', () => {
        render(<UkrainePaymentDetails />);
        expect(screen.getByText(/IBAN/i)).toBeInTheDocument();
        expect(screen.getAllByRole('button').length).toBeGreaterThan(0);
    });
});
