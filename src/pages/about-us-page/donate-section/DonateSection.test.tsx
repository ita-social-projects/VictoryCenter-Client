import { render, screen } from '@testing-library/react';
import { DonateSection } from './DonateSection';
import {
    DONATE_TITLE,
    DONATE_DETAILS,
    DONATE,
    BECOME_PARTNER
} from '../../../const/about-us-page/about-us-page';

describe('DonateSection', () => {

    it('should render section with correct title', () => {
        render(<DonateSection />);
        expect(screen.getByText(DONATE_TITLE)).toBeInTheDocument();
    });

    it('should render subtitle correctly', () => {
        render(<DonateSection />);
        expect(screen.getByText(DONATE_DETAILS)).toBeInTheDocument();
    });

    it('should render donate button', () => {
        render(<DonateSection />);
        expect(screen.getByText(DONATE)).toBeInTheDocument();
        expect(screen.getByText(DONATE)).toHaveClass('donate-button');
    });

    it('should render "become-a-partner" button correctly', () => {
        render(<DonateSection />);
        expect(screen.getByText(BECOME_PARTNER)).toBeInTheDocument();
        expect(screen.getByText(BECOME_PARTNER)).toHaveClass('partner-button');
    });

    it('should render background image with correct className', () => {
        render(<DonateSection />);
        const image = screen.getByAltText('Background horses');
        expect(image).toHaveClass('donate-background');
        expect(image).toHaveAttribute('src', expect.stringContaining('donate-background'));
    });

    it('should call donate handler when donate button is clicked', () => {
        const consoleSpy = jest.spyOn(console, 'log');
        render(<DonateSection />);
        const donateBtn = screen.getByRole('button', { name: /make a donation/i });
        donateBtn.click();
        expect(consoleSpy).toHaveBeenCalledWith('Donate clicked');
        consoleSpy.mockRestore();
    });

    it('should call partner handler when partner button is clicked', () => {
        const consoleSpy = jest.spyOn(console, 'log');
        render(<DonateSection />);
        const partnerBtn = screen.getByRole('button', { name: /become a partner/i });
        partnerBtn.click();
        expect(consoleSpy).toHaveBeenCalledWith('Partner clicked');
        consoleSpy.mockRestore();
    });

});
