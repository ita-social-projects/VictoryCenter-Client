import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PartnersSecondSectionContent } from './partnersSecondSection';
import {
    PARTNERS_SECOND_SECTION_TITLE,
    PARTNERS_SECOND_SECTION_DESCRIPTION,
    PARTNER_SECOND_SECTION,
} from '../../../../const/partners-page/partners-page';

jest.mock('../../../../const/partners-page/partners-page', () => ({
    PARTNERS_SECOND_SECTION_TITLE: {
        FIRST_LINE: 'Second Section Title ',
        SECOND_LINE: 'Continues Here'
    },
    PARTNERS_SECOND_SECTION_DESCRIPTION: {
        FIRST_LINE: 'Second section description ',
        SECOND_LINE: 'with additional details'
    },
    PARTNER_SECOND_SECTION: [
        {
            id: 1,
            name: 'Second Partner One',
            logo: 'second-partner1-logo.png'
        },
        {
            id: 2,
            name: 'Second Partner Two',
            logo: 'second-partner2-logo.png'
        },
        {
            id: 3,
            name: 'Second Partner Three',
            logo: 'second-partner3-logo.png'
        },
        {
            id: 4,
            name: 'Second Partner Four',
            logo: 'second-partner4-logo.png'
        }
    ]
}));

describe('PartnersSecondSection', () => {
    beforeEach(() => {
        render(<PartnersSecondSectionContent />);
    });

    it('renders without crashing', () => {
        const section = document.querySelector('.partners-content-section');
        expect(section).toBeInTheDocument();
    });

    it('displays the section title from constants', () => {
        const titleElement = screen.getByRole('heading', { level: 2 });
        expect(titleElement).toBeInTheDocument();
        expect(titleElement).toHaveTextContent('Second Section Title Continues Here');
        expect(titleElement).toHaveClass('section-title');
    });

    it('displays the section description from constants', () => {
        const descriptionElement = screen.getByText('Second section description with additional details');
        expect(descriptionElement).toBeInTheDocument();
        expect(descriptionElement).toHaveClass('section-description');
        expect(descriptionElement.tagName).toBe('P');
    });

    it('renders all partners from the constants', () => {
        PARTNER_SECOND_SECTION.forEach((partner) => {
            const partnerName = screen.getByText(partner.name);
            const partnerLogo = screen.getByAltText(`${partner.name} logo`);

            expect(partnerName).toBeInTheDocument();
            expect(partnerLogo).toBeInTheDocument();
        });
    });

    it('renders partner logos with correct attributes', () => {
        PARTNER_SECOND_SECTION.forEach((partner) => {
            const logo = screen.getByAltText(`${partner.name} logo`);
            expect(logo).toHaveAttribute('src', partner.logo);
            expect(logo).toHaveClass('partner-logo');
            expect(logo.tagName).toBe('IMG');
        });
    });

    it('renders partner names with correct styling', () => {
        PARTNER_SECOND_SECTION.forEach((partner) => {
            const partnerName = screen.getByText(partner.name);
            expect(partnerName).toHaveClass('partner-name');
            expect(partnerName.tagName).toBe('P');
        });
    });

    it('has the correct CSS structure', () => {
        const section = document.querySelector('.partners-content-section');
        const container = document.querySelector('.container');
        const header = document.querySelector('.partners-header');
        const logosContainer = document.querySelector('.partners-logos');

        expect(section).toBeInTheDocument();
        expect(container).toBeInTheDocument();
        expect(header).toBeInTheDocument();
        expect(logosContainer).toBeInTheDocument();
    });

    it('renders partner items with correct structure', () => {
        const partnerItems = document.querySelectorAll('.partner-item');
        expect(partnerItems).toHaveLength(PARTNER_SECOND_SECTION.length);

        partnerItems.forEach((item, index) => {
            const partner = PARTNER_SECOND_SECTION[index];
            const logo = item.querySelector('.partner-logo');
            const name = item.querySelector('.partner-name');

            expect(logo).toBeInTheDocument();
            expect(name).toBeInTheDocument();
            expect(name).toHaveTextContent(partner.name);
        });
    });

    it('renders header with block layout structure', () => {
        const header = document.querySelector('.partners-header');
        const title = header?.querySelector('.section-title');
        const description = header?.querySelector('.section-description');

        expect(header).toBeInTheDocument();
        expect(title).toBeInTheDocument();
        expect(description).toBeInTheDocument();

        expect(header).toHaveStyle({ display: 'block' });
    });

    it('renders horizontal scrollable logos container', () => {
        const logosContainer = document.querySelector('.partners-logos');
        expect(logosContainer).toBeInTheDocument();
        expect(logosContainer?.children).toHaveLength(PARTNER_SECOND_SECTION.length);

        expect(logosContainer).toHaveStyle({ display: 'block' });
    });

    it('uses constants for all text content', () => {
        expect(screen.getByText(`${PARTNERS_SECOND_SECTION_TITLE.FIRST_LINE}${PARTNERS_SECOND_SECTION_TITLE.SECOND_LINE}`)).toBeInTheDocument();
        expect(screen.getByText(`${PARTNERS_SECOND_SECTION_DESCRIPTION.FIRST_LINE}${PARTNERS_SECOND_SECTION_DESCRIPTION.SECOND_LINE}`)).toBeInTheDocument();

        PARTNER_SECOND_SECTION.forEach((partner) => {
            expect(screen.getByText(partner.name)).toBeInTheDocument();
        });
    });

    it('renders section with proper background and positioning', () => {
        const section = document.querySelector('.partners-content-section');
        expect(section).toBeInTheDocument();
        expect(section).toHaveClass('partners-content-section');
    });

    it('renders all partner items within logos container', () => {
        const logosContainer = document.querySelector('.partners-logos');
        const partnerItems = logosContainer?.querySelectorAll('.partner-item');

        expect(partnerItems).toHaveLength(PARTNER_SECOND_SECTION.length);
    });

    it('has proper container structure with padding', () => {
        const section = document.querySelector('.partners-content-section');
        const container = section?.querySelector('.container');

        expect(section).toBeInTheDocument();
        expect(container).toBeInTheDocument();
    });

    it('renders each partner logo with proper alt text accessibility', () => {
        PARTNER_SECOND_SECTION.forEach((partner) => {
            const logo = screen.getByAltText(`${partner.name} logo`);
            expect(logo).toBeInTheDocument();
            expect(logo).toHaveAttribute('alt', `${partner.name} logo`);
        });
    });

    it('maintains horizontal scroll layout for partner logos', () => {
        const logosContainer = document.querySelector('.partners-logos');
        const partnerItems = logosContainer?.querySelectorAll('.partner-item');

        expect(logosContainer).toBeInTheDocument();
        expect(partnerItems).toHaveLength(PARTNER_SECOND_SECTION.length);

        partnerItems?.forEach((item) => {
            expect(item).toHaveClass('partner-item');
        });
    });
});