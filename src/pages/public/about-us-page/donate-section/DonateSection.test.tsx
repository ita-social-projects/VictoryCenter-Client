import { render, screen } from '@testing-library/react';
import { DonateSection } from './DonateSection';
import { ABOUT_US_DATA } from '../../../../const/public/about-us-page';

describe('DonateSection', () => {
    it('should render section with correct title', () => {
        render(<DonateSection />);
        expect(screen.getByText(ABOUT_US_DATA.DONATE_TITLE)).toBeInTheDocument();
    });

    it('should render subtitle correctly', () => {
        render(<DonateSection />);
        expect(screen.getByText(ABOUT_US_DATA.DONATE_DETAILS)).toBeInTheDocument();
    });

    it('should render donate button', () => {
        render(<DonateSection />);
        expect(screen.getByText(ABOUT_US_DATA.DONATE)).toBeInTheDocument();
        expect(screen.getByText(ABOUT_US_DATA.DONATE)).toHaveClass('donate-button');
    });

    it('should render "become-a-partner" button correctly', () => {
        render(<DonateSection />);
        expect(screen.getByText(ABOUT_US_DATA.BECOME_PARTNER)).toBeInTheDocument();
        expect(screen.getByText(ABOUT_US_DATA.BECOME_PARTNER)).toHaveClass('partner-button');
    });

    it('should render background image with correct className', () => {
        render(<DonateSection />);
        const image = screen.getByAltText('Background horses');
        expect(image).toHaveClass('donate-background');
        expect(image).toHaveAttribute('src', expect.stringContaining('donate-background'));
    });

    it('should call donate handler when donate button is clicked', () => {
        const handleDonate = jest.fn();

        render(
            <button onClick={handleDonate} className="donate-button" aria-label="Make a donation">
                Donate
            </button>,
        );

        const donateBtn = screen.getByRole('button', { name: /make a donation/i });
        donateBtn.click();
        expect(handleDonate).toHaveBeenCalled();
    });

    it('should call partner handler when partner button is clicked', () => {
        const handlePartner = jest.fn();

        render(
            <button onClick={handlePartner} className="partner-button" aria-label="Become a partner">
                Become a partner
            </button>,
        );

        const partnerBtn = screen.getByRole('button', { name: /become a partner/i });
        partnerBtn.click();
        expect(handlePartner).toHaveBeenCalled();
    });
});
