import { render, screen } from '@testing-library/react';
import { SupportSection } from './SupportSection';
import aboutUsPageUk from '../../../../locales/uk/about-us.json';

describe('SupportSection component', () => {
    it('renders section title', () => {
        render(<SupportSection />);
        expect(screen.getByText(aboutUsPageUk.SUPPORT_TITLE)).toBeInTheDocument();
    });

    it('renders correct number of support cards', () => {
        render(<SupportSection />);
        const cards = screen.getAllByRole('img');
        expect(cards).toHaveLength(aboutUsPageUk.SUPPORT_DATA.length);
    });

    it('renders all descriptions', () => {
        render(<SupportSection />);
        aboutUsPageUk.SUPPORT_DATA.forEach(({ DESCRIPTION }) => {
            expect(screen.getByText(DESCRIPTION)).toBeInTheDocument();
        });
    });

    it('renders all images with correct alt text', () => {
        render(<SupportSection />);
        aboutUsPageUk.SUPPORT_DATA.forEach(({ ALT }) => {
            expect(screen.getByAltText(ALT)).toBeInTheDocument();
        });
    });
});
