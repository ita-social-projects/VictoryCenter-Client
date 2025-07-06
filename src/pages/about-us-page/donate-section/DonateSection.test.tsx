import { render, screen } from '@testing-library/react';
import { DonateSection } from './DonateSection';
import {
    DONATE_TITLE,
    DONATE_DETAILS,
    DONATE,
    BECOME_PARTNER
} from '../../../const/about-us-page/about-us-page';

describe('DonateSection', () => {

    test('should render section with correct title', () => {
        render(<DonateSection />);
        expect(screen.getByText(DONATE_TITLE)).toBeInTheDocument();
    });

    test('should render subtitle correctly', () => {
        render(<DonateSection />);
        expect(screen.getByText(DONATE_DETAILS)).toBeInTheDocument();
    });

    test('should render donate button', () => {
        render(<DonateSection />);
        expect(screen.getByText(DONATE)).toBeInTheDocument();
        expect(screen.getByText(DONATE)).toHaveClass('donate-button');
    });

    test('should render "become-a-partner" button correctly', () => {
        render(<DonateSection />);
        expect(screen.getByText(BECOME_PARTNER)).toBeInTheDocument();
        expect(screen.getByText(BECOME_PARTNER)).toHaveClass('partner-button');
    });

    test('should render background image with correct className', () => {
        render(<DonateSection />);
        const image = screen.getByAltText('Background horses');
        expect(image).toHaveClass('donate-background');
        expect(image).toHaveAttribute('src', expect.stringContaining('donate-background'));
    });
});
