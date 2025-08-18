import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { RightSection } from './RightSection';
import { IN_UKRAINE_LABEL, NOT_IN_UKRAINE_LABEL } from '../../../../const/public/donate-page';

jest.mock('./alternative-support-ways/AlternativeSupportWays', () => ({
    AlternativeSupportWays: () => <div data-testid="alternative-support-ways"></div>,
}));

describe('RightSection', () => {
    it('renders location toggle and payment details', () => {
        render(<RightSection />);

        expect(screen.getByRole('checkbox')).toBeInTheDocument();

        expect(screen.getByText(IN_UKRAINE_LABEL)).toBeInTheDocument();

        expect(screen.getByTestId('alternative-support-ways')).toBeInTheDocument();
    });

    it('toggles between Ukraine and Abroad payment details', () => {
        render(<RightSection />);

        expect(screen.getByText(IN_UKRAINE_LABEL)).toBeInTheDocument();

        const toggle = screen.getByRole('checkbox');
        fireEvent.click(toggle);

        expect(screen.getByText(NOT_IN_UKRAINE_LABEL)).toBeInTheDocument();

        expect(screen.getByText('Для переказів в USD:')).toBeInTheDocument();
        expect(screen.getByText('Для переказів в EUR:')).toBeInTheDocument();

        expect(screen.queryByText('Реквізити для донатів в Україні')).not.toBeInTheDocument();
    });

    it('shows Ukraine payment details by default', () => {
        render(<RightSection />);

        expect(screen.getByText(/Реквізити для донатів в Україні/i)).toBeInTheDocument();
        expect(screen.getByText(IN_UKRAINE_LABEL)).toBeInTheDocument();
    });

    it('shows abroad payment details when toggled', () => {
        render(<RightSection />);

        const toggle = screen.getByRole('checkbox');
        fireEvent.click(toggle);

        expect(screen.getByText(/Для переказів в USD/i)).toBeInTheDocument();
        expect(screen.getByText(/Для переказів в EUR/i)).toBeInTheDocument();
        expect(screen.getByText(NOT_IN_UKRAINE_LABEL)).toBeInTheDocument();
    });
});
