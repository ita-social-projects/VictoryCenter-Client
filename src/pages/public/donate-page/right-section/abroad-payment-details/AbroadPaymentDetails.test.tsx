import { render, screen } from '@testing-library/react';
import { AbroadPaymentDetails } from './AbroadPaymentDetails';
import { Currency } from '../../../../../types/public/donate-page';

describe('AbroadPaymentDetails', () => {
    it('renders all main payment sections', () => {
        render(<AbroadPaymentDetails currency={Currency.USD} />);
        expect(screen.getAllByText(/USD/i).length).toBeGreaterThan(0);
        const correspondentBanksElements = screen.queryAllByText((content, _) => {
            return content.includes('Кореспондентські банки');
        });
        expect(correspondentBanksElements.length).toBeGreaterThan(0);
        expect(screen.getAllByRole('button').length).toBeGreaterThan(0);
    });
});
