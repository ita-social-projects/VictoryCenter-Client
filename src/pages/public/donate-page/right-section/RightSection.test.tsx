import { render, screen, fireEvent } from '@testing-library/react';
import { RightSection } from './RightSection';
import '@testing-library/jest-dom';

jest.mock('./ukraine-payment-details/UkrainePaymentDetails.tsx', () => ({
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

    it('switches to EUR tab and shows AbroadPaymentDetails', () => {
        render(<RightSection />);
        fireEvent.click(screen.getByText(/EUR/i));
        expect(screen.getByTestId('abroad-payment')).toBeInTheDocument();
        expect(screen.queryByTestId('ukraine-payment')).not.toBeInTheDocument();
    });

    it('always renders AlternativeSupportWays', () => {
        render(<RightSection />);
        expect(screen.getByTestId('alt-support')).toBeInTheDocument();
    });
});
