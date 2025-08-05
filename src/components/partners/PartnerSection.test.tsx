import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PartnerSection } from './PartnerSection';

const mockTitle = {
    FIRST_LINE: 'Test Section Title ',
    SECOND_LINE: 'Second Line'
};

const mockDescription = {
    FIRST_LINE: 'Test section description ',
    SECOND_LINE: 'with more details'
};

const mockPartners = [
    {
        id: 1,
        name: 'Partner One',
        logo: 'partner1-logo.png'
    },
    {
        id: 2,
        name: 'Partner Two',
        logo: 'partner2-logo.png'
    },
    {
        id: 3,
        name: 'Partner Three',
        logo: 'partner3-logo.png'
    }
];

describe('PartnerSection', () => {
    beforeEach(() => {
        render(
            <PartnerSection
                title={mockTitle}
                description={mockDescription}
                partners={mockPartners}
            />
        );
    });

    it('renders the component with correct structure', () => {
        const section = document.querySelector('.partners-content-section');
        const container = document.querySelector('.container');
        const header = document.querySelector('.partners-header');
        const logosContainer = document.querySelector('.partners-logos');

        expect(section).toBeInTheDocument();
        expect(container).toBeInTheDocument();
        expect(header).toBeInTheDocument();
        expect(logosContainer).toBeInTheDocument();
    });

    it('displays the section title correctly', () => {
        const titleElement = screen.getByRole('heading', { level: 2 });
        expect(titleElement).toBeInTheDocument();
        expect(titleElement).toHaveTextContent('Test Section Title Second Line');
        expect(titleElement).toHaveClass('section-title');
    });

    it('displays the section description correctly', () => {
        const descriptionElement = screen.getByText('Test section description with more details');
        expect(descriptionElement).toBeInTheDocument();
        expect(descriptionElement).toHaveClass('section-description');
        expect(descriptionElement.tagName).toBe('P');
    });

    it('renders all partners with correct data', () => {
        mockPartners.forEach((partner) => {
            const partnerName = screen.getByText(partner.name);
            const partnerLogo = screen.getByAltText(`${partner.name} logo`);

            expect(partnerName).toBeInTheDocument();
            expect(partnerLogo).toBeInTheDocument();
            expect(partnerLogo).toHaveAttribute('src', partner.logo);
            expect(partnerLogo).toHaveClass('partner-logo');
        });
    });

    it('renders partner items with correct structure and classes', () => {
        const partnerItems = document.querySelectorAll('.partner-item');
        expect(partnerItems).toHaveLength(mockPartners.length);

        partnerItems.forEach((item, index) => {
            const partner = mockPartners[index];
            const logo = item.querySelector('.partner-logo');
            const name = item.querySelector('.partner-name');

            expect(logo).toBeInTheDocument();
            expect(name).toBeInTheDocument();
            expect(name).toHaveTextContent(partner.name);
            expect(name).toHaveClass('partner-name');
        });
    });

    it('has proper accessibility attributes', () => {
        mockPartners.forEach((partner) => {
            const logo = screen.getByAltText(`${partner.name} logo`);
            expect(logo).toHaveAttribute('alt', `${partner.name} logo`);
        });
    });
});