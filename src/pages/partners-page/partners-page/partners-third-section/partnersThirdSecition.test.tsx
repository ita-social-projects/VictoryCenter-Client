import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PartnersThirdSection } from './partnersThirdSection';
import {
    PARTNERS_THIRD_SECTION_TITLE,
    PARTNERS_THIRD_SECTION_DESCRIPTION,
    PARTNER_THIRD_SECTION,
} from '../../../../const/partners-page/partners-page';

// Mock the constants
jest.mock('../../../../const/partners-page/partners-page', () => ({
    PARTNERS_THIRD_SECTION_TITLE: {
        FIRST_LINE: 'Third Section Title ',
        SECOND_LINE: 'Second Line'
    },
    PARTNERS_THIRD_SECTION_DESCRIPTION: {
        FIRST_LINE: 'Third section description ',
        SECOND_LINE: 'with more details'
    },
    PARTNER_THIRD_SECTION: [
        {
            id: 1,
            name: 'Third Partner One',
            logo: 'third-partner1-logo.png'
        },
        {
            id: 2,
            name: 'Third Partner Two',
            logo: 'third-partner2-logo.png'
        },
        {
            id: 3,
            name: 'Third Partner Three',
            logo: 'third-partner3-logo.png'
        }
    ]
}));

describe('PartnersThirdSection', () => {
    beforeEach(() => {
        render(<PartnersThirdSection />);
    });

    it('renders without crashing', () => {
        const section = document.querySelector('.partners-content-section');
        expect(section).toBeInTheDocument();
    });

    it('displays the section title from constants', () => {
        const titleElement = screen.getByRole('heading', { level: 2 });
        expect(titleElement).toBeInTheDocument();
        expect(titleElement).toHaveTextContent('Third Section Title Second Line');
        expect(titleElement).toHaveClass('section-title');
    });

    it('displays the section description from constants', () => {
        const descriptionElement = screen.getByText('Third section description with more details');
        expect(descriptionElement).toBeInTheDocument();
        expect(descriptionElement).toHaveClass('section-description');
        expect(descriptionElement.tagName).toBe('P');
    });

    it('renders all partners from the constants', () => {
        PARTNER_THIRD_SECTION.forEach((partner) => {
            const partnerName = screen.getByText(partner.name);
            const partnerLogo = screen.getByAltText(`${partner.name} logo`);

            expect(partnerName).toBeInTheDocument();
            expect(partnerLogo).toBeInTheDocument();
        });
    });

    it('renders partner logos with correct attributes', () => {
        PARTNER_THIRD_SECTION.forEach((partner) => {
            const logo = screen.getByAltText(`${partner.name} logo`);
            expect(logo).toHaveAttribute('src', partner.logo);
            expect(logo).toHaveClass('partner-logo');
            expect(logo.tagName).toBe('IMG');
        });
    });

    it('renders partner names with correct styling', () => {
        PARTNER_THIRD_SECTION.forEach((partner) => {
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
        expect(partnerItems).toHaveLength(PARTNER_THIRD_SECTION.length);

        partnerItems.forEach((item, index) => {
            const partner = PARTNER_THIRD_SECTION[index];
            const logo = item.querySelector('.partner-logo');
            const name = item.querySelector('.partner-name');

            expect(logo).toBeInTheDocument();
            expect(name).toBeInTheDocument();
            expect(name).toHaveTextContent(partner.name);
        });
    });

    it('renders header with flex layout structure', () => {
        const header = document.querySelector('.partners-header');
        const title = header?.querySelector('.section-title');
        const description = header?.querySelector('.section-description');

        expect(header).toBeInTheDocument();
        expect(title).toBeInTheDocument();
        expect(description).toBeInTheDocument();
    });

    it('renders wrap-enabled logos container', () => {
        const logosContainer = document.querySelector('.partners-logos');
        expect(logosContainer).toBeInTheDocument();
        expect(logosContainer?.children).toHaveLength(PARTNER_THIRD_SECTION.length);
    });

    it('uses constants for all text content', () => {
        expect(screen.getByText(`${PARTNERS_THIRD_SECTION_TITLE.FIRST_LINE}${PARTNERS_THIRD_SECTION_TITLE.SECOND_LINE}`)).toBeInTheDocument();
        expect(screen.getByText(`${PARTNERS_THIRD_SECTION_DESCRIPTION.FIRST_LINE}${PARTNERS_THIRD_SECTION_DESCRIPTION.SECOND_LINE}`)).toBeInTheDocument();

        PARTNER_THIRD_SECTION.forEach((partner) => {
            expect(screen.getByText(partner.name)).toBeInTheDocument();
        });
    });

    it('renders section with proper background styling', () => {
        const section = document.querySelector('.partners-content-section');
        expect(section).toBeInTheDocument();
        expect(section).toHaveClass('partners-content-section');
    });

    it('renders all partner items within logos container', () => {
        const logosContainer = document.querySelector('.partners-logos');
        const partnerItems = logosContainer?.querySelectorAll('.partner-item');

        expect(partnerItems).toHaveLength(PARTNER_THIRD_SECTION.length);
    });

    it('has proper container structure with padding', () => {
        const section = document.querySelector('.partners-content-section');
        const container = section?.querySelector('.container');

        expect(section).toBeInTheDocument();
        expect(container).toBeInTheDocument();
    });

    it('renders each partner logo with proper alt text accessibility', () => {
        PARTNER_THIRD_SECTION.forEach((partner) => {
            const logo = screen.getByAltText(`${partner.name} logo`);
            expect(logo).toBeInTheDocument();
            expect(logo).toHaveAttribute('alt', `${partner.name} logo`);
        });
    });

    it('maintains flex wrap layout for partner logos', () => {
        const logosContainer = document.querySelector('.partners-logos');
        const partnerItems = logosContainer?.querySelectorAll('.partner-item');

        expect(logosContainer).toBeInTheDocument();
        expect(partnerItems).toHaveLength(PARTNER_THIRD_SECTION.length);

        partnerItems?.forEach((item) => {
            expect(item).toHaveClass('partner-item');
        });
    });

    it('renders with bottom border separator', () => {
        const section = document.querySelector('.partners-content-section');
        expect(section).toBeInTheDocument();

        expect(section).toHaveClass('partners-content-section');
    });

    it('has proper header layout with space-between alignment', () => {
        const header = document.querySelector('.partners-header');
        const title = header?.querySelector('.section-title');
        const description = header?.querySelector('.section-description');

        expect(header).toBeInTheDocument();
        expect(title).toBeInTheDocument();
        expect(description).toBeInTheDocument();

        expect(header).toHaveClass('partners-header');
    });

    it('renders partner items with column layout', () => {
        const partnerItems = document.querySelectorAll('.partner-item');

        partnerItems.forEach((item) => {
            const logo = item.querySelector('.partner-logo');
            const name = item.querySelector('.partner-name');

            expect(logo).toBeInTheDocument();
            expect(name).toBeInTheDocument();
            expect(item).toHaveClass('partner-item');
        });
    });

    it('renders logos with correct size and styling classes', () => {
        PARTNER_THIRD_SECTION.forEach((partner) => {
            const logo = screen.getByAltText(`${partner.name} logo`);
            expect(logo).toHaveClass('partner-logo');
            expect(logo).toHaveAttribute('src', partner.logo);
        });
    });

    it('renders centered partner items with proper text alignment', () => {
        const partnerItems = document.querySelectorAll('.partner-item');

        partnerItems.forEach((item) => {
            expect(item).toHaveClass('partner-item');

            const name = item.querySelector('.partner-name');
            expect(name).toHaveClass('partner-name');
        });
    });
});