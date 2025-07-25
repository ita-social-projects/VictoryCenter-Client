import { render, screen } from '@testing-library/react';
import { AbroadPaymentDetails } from './AbroadPaymentDetails';

describe('AbroadPaymentDetails', () => {
    it('renders all main payment sections', () => {
        render(<AbroadPaymentDetails />);
        expect(screen.getAllByText(/USD/i).length).toBeGreaterThan(0);
        expect(screen.getAllByText(/EUR/i).length).toBeGreaterThan(0);
        const correspondentBanksElements = screen.queryAllByText((content, _) => {
            return content.includes('Кореспондентські банки');
        });
        expect(correspondentBanksElements.length).toBeGreaterThan(0);
        expect(screen.getAllByRole('img').length).toBeGreaterThan(0);
    });
});
