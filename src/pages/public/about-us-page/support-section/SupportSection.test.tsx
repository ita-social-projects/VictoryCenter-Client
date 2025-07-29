import React from 'react';
import { render, screen } from '@testing-library/react';
import { SupportSection } from './SupportSection';
import { ABOUT_US_DATA } from '../../../../const/public/about-us-page';

describe('SupportSection component', () => {
    it('renders section title', () => {
        render(<SupportSection />);
        expect(screen.getByText(ABOUT_US_DATA.SUPPORT_TITLE)).toBeInTheDocument();
    });

    it('renders correct number of support cards', () => {
        render(<SupportSection />);
        const cards = screen.getAllByRole('img');
        expect(cards).toHaveLength(ABOUT_US_DATA.SUPPORT_DATA.length);
    });

    it('renders all descriptions', () => {
        render(<SupportSection />);
        ABOUT_US_DATA.SUPPORT_DATA.forEach(({ DESCRIPTION }) => {
            expect(screen.getByText(DESCRIPTION)).toBeInTheDocument();
        });
    });

    it('renders all images with correct alt text', () => {
        render(<SupportSection />);
        ABOUT_US_DATA.SUPPORT_DATA.forEach(({ ALT }) => {
            expect(screen.getByAltText(ALT)).toBeInTheDocument();
        });
    });
});
