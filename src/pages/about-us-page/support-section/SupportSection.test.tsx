import React from 'react';
import { render, screen } from '@testing-library/react';
import { SupportSection } from './SupportSection';
import { SUPPORT_DATA, SUPPORT_TITLE } from '../../../const/about-us-page/about-us-page';

describe('SupportSection component', () => {
    beforeEach(() => {
        render(<SupportSection />);
    });

    test('renders section title', () => {
        expect(screen.getByText(SUPPORT_TITLE)).toBeInTheDocument();
    });

    test('renders correct number of support cards', () => {
        const cards = screen.getAllByRole('img');
        expect(cards).toHaveLength(SUPPORT_DATA.length);
    });

    test('renders all descriptions', () => {
        SUPPORT_DATA.forEach(({ description }) => {
            expect(screen.getByText((content) => content.includes(description.slice(0, 10))))
                .toBeInTheDocument();
        });
    });

    test('renders all images with correct alt text', () => {
        SUPPORT_DATA.forEach(({ alt }) => {
            expect(screen.getByAltText(alt)).toBeInTheDocument();
        });
    });
});
