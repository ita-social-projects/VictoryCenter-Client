import { render, screen } from '@testing-library/react';
import { SupportSectionTablet } from './SupportSectionTablet';
import aboutUsPageUk from '../../../../../../locales/uk/about-us.json';

describe('SupportSectionTablet component', () => {
    it('should render main support title', () => {
        render(<SupportSectionTablet />);
        expect(screen.getByText(aboutUsPageUk.SUPPORT_TITLE)).toBeInTheDocument();
    });

    it('renders all descriptions', () => {
        render(<SupportSectionTablet />);
        aboutUsPageUk.SUPPORT_DATA.forEach(({ DESCRIPTION }) => {
            expect(screen.getByText(DESCRIPTION)).toBeInTheDocument();
        });
    });

    it('renders all images with correct alt text', () => {
        render(<SupportSectionTablet />);
        aboutUsPageUk.SUPPORT_DATA.forEach(({ ALT }) => {
            expect(screen.getByAltText(ALT)).toBeInTheDocument();
        });
    });
});
