import { render, screen } from '@testing-library/react';
import { SupportSection } from './SupportSection';
import aboutUsUk from '../../../../locales/uk/about-us.json';

describe('SupportSection component', () => {
    it('renders section title', () => {
        render(<SupportSection />);
        expect(screen.getByText(aboutUsUk.SUPPORT_TITLE)).toBeInTheDocument();
    });

    it('renders correct number of support cards', () => {
        render(<SupportSection />);
        const cards = screen.getAllByRole('img');
        expect(cards).toHaveLength(aboutUsUk.SUPPORT_DATA.length);
    });

    it('renders all descriptions', () => {
        render(<SupportSection />);
        aboutUsUk.SUPPORT_DATA.forEach(({ DESCRIPTION }) => {
            expect(screen.getByText(DESCRIPTION)).toBeInTheDocument();
        });
    });

    it('renders all images with correct alt text', () => {
        render(<SupportSection />);
        aboutUsUk.SUPPORT_DATA.forEach(({ ALT }) => {
            expect(screen.getByAltText(ALT)).toBeInTheDocument();
        });
    });
});
