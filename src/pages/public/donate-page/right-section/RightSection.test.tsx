import React from 'react';
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
    const getUahTab = () => screen.getByText(/UAH/i);
    const getUsdTab = () => screen.getByText(/USD/i);
    const getEurTab = () => screen.getByText(/EUR/i);

    const queryUkrainePaymentSection = () => screen.queryByTestId('ukraine-payment');
    const queryAbroadPaymentSection = () => screen.queryByTestId('abroad-payment');
    const getUkrainePaymentSection = () => screen.getByTestId('ukraine-payment');
    const getAbroadPaymentSection = () => screen.getByTestId('abroad-payment');
    const getAlternativeSupportSection = () => screen.getByTestId('alt-support');

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders with default UAH tab and UkrainePaymentDetails', () => {
        render(<RightSection />);
        expect(getUkrainePaymentSection()).toBeInTheDocument();
        expect(getUahTab()).toHaveClass('active');
    });

    it('switches between tabs and shows appropriate content', () => {
        render(<RightSection />);
        fireEvent.click(getUsdTab());
        expect(getAbroadPaymentSection()).toBeInTheDocument();
        expect(queryUkrainePaymentSection()).not.toBeInTheDocument();

        fireEvent.click(getEurTab());
        expect(getAbroadPaymentSection()).toBeInTheDocument();
        expect(queryUkrainePaymentSection()).not.toBeInTheDocument();

        fireEvent.click(getUahTab());
        expect(getUkrainePaymentSection()).toBeInTheDocument();
        expect(queryAbroadPaymentSection()).not.toBeInTheDocument();
    });

    it('always renders AlternativeSupportWays', () => {
        render(<RightSection />);
        expect(getAlternativeSupportSection()).toBeInTheDocument();
    });

    it('has correct active class', () => {
        render(<RightSection />);
        const uahTab = getUahTab();
        const usdTab = getUsdTab();
        const eurTab = getEurTab();

        expect(uahTab).toHaveClass('active');
        expect(usdTab).not.toHaveClass('active');
        expect(eurTab).not.toHaveClass('active');

        fireEvent.click(usdTab);
        expect(uahTab).not.toHaveClass('active');
        expect(usdTab).toHaveClass('active');
        expect(eurTab).not.toHaveClass('active');

        fireEvent.click(eurTab);
        expect(uahTab).not.toHaveClass('active');
        expect(usdTab).not.toHaveClass('active');
        expect(eurTab).toHaveClass('active');
    });
});
