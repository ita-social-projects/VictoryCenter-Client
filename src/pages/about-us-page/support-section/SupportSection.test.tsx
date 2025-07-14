import React from 'react';
import { render, screen } from '@testing-library/react';
import { SupportSection } from './SupportSection';
import { SUPPORT_DATA, SUPPORT_TITLE } from '../../../const/about-us-page/about-us-page';

describe('SupportSection component', () => {
    it('renders section title', () => {
        render(<SupportSection />);
        expect(screen.getByText(SUPPORT_TITLE)).toBeInTheDocument();
    });

    it('renders correct number of support cards', () => {
        render(<SupportSection />);
        const cards = screen.getAllByRole('img');
        expect(cards).toHaveLength(SUPPORT_DATA.length);
    });

    it('renders all descriptions', () => {
        render(<SupportSection />);
        SUPPORT_DATA.forEach(({ description }) => {
            expect(screen.getByText(description)).toBeInTheDocument();
        });
    });

    it('renders all images with correct alt text', () => {
        render(<SupportSection />);
        SUPPORT_DATA.forEach(({ alt }) => {
            expect(screen.getByAltText(alt)).toBeInTheDocument();
        });
    });
});
