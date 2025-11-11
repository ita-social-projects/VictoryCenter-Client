import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PartnersSection } from './PartnersSection';
import { PartnerSection as PartnerSectionType } from '../../../../../types/public/partners-page';

describe('PartnersSection', () => {
    const mockSection: PartnerSectionType = {
        id: 1,
        title: 'Our partners',
        description: 'description',
        partners: [
            {
                id: 1,
                description: 'Partner One',
                image: { id: 1, url: 'https://example.com/partner1-logo.png', mimeType: 'image/png' },
            },
            {
                id: 2,
                description: 'Partner Two',
                image: { id: 2, url: 'https://example.com/partner2-logo.png', mimeType: 'image/png' },
            },
        ],
    };

    it('should render nothing if the section prop is null', () => {
        const { container } = render(<PartnersSection section={null} />);

        expect(container.firstChild).toBeNull();
    });

    it('should render the section title and description', () => {
        render(<PartnersSection section={mockSection} />);

        expect(screen.getByRole('heading', { name: 'Our partners' })).toBeInTheDocument();

        expect(screen.getByText('description')).toBeInTheDocument();
    });

    it('should render all partners with their logos and descriptions', () => {
        render(<PartnersSection section={mockSection} />);

        mockSection.partners.forEach((partner) => {
            expect(screen.getByText(partner.description)).toBeInTheDocument();

            const logo = screen.getByAltText(`${partner.id} logo`);
            expect(logo).toBeInTheDocument();
            expect(logo).toHaveAttribute('src', partner.image.url);
            expect(logo).toHaveClass('partner-logo');
        });
    });

    it('should render correctly even if partners array is empty', () => {
        const sectionWithNoPartners: PartnerSectionType = {
            ...mockSection,
            partners: [],
        };

        render(<PartnersSection section={sectionWithNoPartners} />);

        expect(screen.getByRole('heading', { name: 'Our partners' })).toBeInTheDocument();
        expect(screen.getByText('description')).toBeInTheDocument();

        const logos = screen.queryAllByRole('img');
        expect(logos).toHaveLength(0);
    });
});
