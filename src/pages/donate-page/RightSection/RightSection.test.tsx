import { render, screen, fireEvent } from '@testing-library/react';
import { RightSection } from './RightSection';
import '@testing-library/jest-dom';

jest.mock('./Ukraine-payment-details/UkrainePaymentDetails', () => ({
    UkrainePaymentDetails: () => <div data-testid="ukraine-payment">Ukraine Payment Details</div>,
}));

jest.mock('./abroad-payment-details/AbroadPaymentDetails', () => ({
    AbroadPaymentDetails: () => <div data-testid="abroad-payment">Abroad Payment Details</div>,
}));

jest.mock('./alternative-support-ways/AlternativeSupportWays', () => ({
    AlternativeSupportWays: () => <div data-testid="alt-support">Alternative Support</div>,
}));

describe('RightSection', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders with default UAH tab and UkrainePaymentDetails', () => {
        render(<RightSection />);
        expect(screen.getByTestId('ukraine-payment')).toBeInTheDocument();
        expect(screen.getByText(/UAH/i)).toHaveClass('active');
    });

    it('switches to USD tab and shows AbroadPaymentDetails', () => {
        render(<RightSection />);
        fireEvent.click(screen.getByText(/USD/i));
        expect(screen.getByTestId('abroad-payment')).toBeInTheDocument();
        expect(screen.queryByTestId('ukraine-payment')).not.toBeInTheDocument();
    });

    it('does not switch to EUR tab when it is disabled', () => {
        render(<RightSection />);
        const eurButton = screen.getByText(/EUR/i);
        expect(eurButton).toBeDisabled();

        // Спроба клікнути
        fireEvent.click(eurButton);

        // Має лишитися UkrainePaymentDetails
        expect(screen.getByTestId('ukraine-payment')).toBeInTheDocument();
        expect(screen.queryByTestId('abroad-payment')).not.toBeInTheDocument();
    });

    it('always renders AlternativeSupportWays', () => {
        render(<RightSection />);
        expect(screen.getByTestId('alt-support')).toBeInTheDocument();
    });
});
