import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PartnersFouthSectionContent } from './partnersFouthSection';
import {
    PARTNERS_FOURTH_SECTION_TITLE,
    PARTNERS_FOURTH_SECTION_DESCRIPTION,
    PARTNER_FOURTH_SECTION,
} from '../../../../const/partners-page/partners-page';

jest.mock('../../../../const/partners-page/partners-page', () => ({
    PARTNERS_FOURTH_SECTION_TITLE: {
        FIRST_LINE: 'Fourth Section Title ',
        SECOND_LINE: 'Second Line'
    },
    PARTNERS_FOURTH_SECTION_DESCRIPTION: {
        FIRST_LINE: 'Fourth section description ',
        SECOND_LINE: 'continues here'
    },
    PARTNER_FOURTH_SECTION: [
        {
            id: 1,
            name: 'Fourth Partner One',
            logo: 'fourth-partner1-logo.png'
        },
        {
            id: 2,
            name: 'Fourth Partner Two',
            logo: 'fourth-partner2-logo.png'
        },
        {
            id: 3,
            name: 'Fourth Partner Three',
            logo: 'fourth-partner3-logo.png'
        }
    ]
}));

describe('PartnersFouthSectionContent', () => {
    beforeEach(() => {
        render(<PartnersFouthSectionContent />);
    });

    it('renders without crashing', () => {
        const section = document.querySelector('.partners-content-section');
        expect(section).toBeInTheDocument();
    });

    it('displays the section title from constants', () => {
        const titleElement = screen.getByRole('heading', { level: 2 });
        expect(titleElement).toBeInTheDocument();
        expect(titleElement).toHaveTextContent('Fourth Section Title Second Line');
        expect(titleElement).toHaveClass('section-title');
    });

    it('displays the section description from constants', () => {
        const descriptionElement = screen.getByText('Fourth section description continues here');
        expect(descriptionElement).toBeInTheDocument();
        expect(descriptionElement).toHaveClass('section-description');
        expect(descriptionElement.tagName).toBe('P');
    });

    it('renders all partners from the constants', () => {
        PARTNER_FOURTH_SECTION.forEach((partner) => {
            const partnerName = screen.getByText(partner.name);
            const partnerLogo = screen.getByAltText(`${partner.name} logo`);

            expect(partnerName).toBeInTheDocument();
            expect(partnerLogo).toBeInTheDocument();
        });
    });

    it('renders partner logos with correct attributes', () => {
        PARTNER_FOURTH_SECTION.forEach((partner) => {
            const logo = screen.getByAltText(`${partner.name} logo`);
            expect(logo).toHaveAttribute('src', partner.logo);
            expect(logo).toHaveClass('partner-logo');
            expect(logo.tagName).toBe('IMG');
        });
    });

    it('renders partner names with correct styling', () => {
        PARTNER_FOURTH_SECTION.forEach((partner) => {
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
        expect(partnerItems).toHaveLength(PARTNER_FOURTH_SECTION.length);

        partnerItems.forEach((item, index) => {
            const partner = PARTNER_FOURTH_SECTION[index];
            const logo = item.querySelector('.partner-logo');
            const name = item.querySelector('.partner-name');

            expect(logo).toBeInTheDocument();
            expect(name).toBeInTheDocument();
            expect(name).toHaveTextContent(partner.name);
        });
    });

    it('renders title and description in the header section', () => {
        const header = document.querySelector('.partners-header');
        const title = header?.querySelector('.section-title');
        const description = header?.querySelector('.section-description');

        expect(header).toBeInTheDocument();
        expect(title).toBeInTheDocument();
        expect(description).toBeInTheDocument();
    });

    it('uses constants for all text content', () => {
        expect(screen.getByText(`${PARTNERS_FOURTH_SECTION_TITLE.FIRST_LINE}${PARTNERS_FOURTH_SECTION_TITLE.SECOND_LINE}`)).toBeInTheDocument();
        expect(screen.getByText(`${PARTNERS_FOURTH_SECTION_DESCRIPTION.FIRST_LINE}${PARTNERS_FOURTH_SECTION_DESCRIPTION.SECOND_LINE}`)).toBeInTheDocument();

        PARTNER_FOURTH_SECTION.forEach((partner) => {
            expect(screen.getByText(partner.name)).toBeInTheDocument();
        });
    });

    it('renders logos container with correct class', () => {
        const logosContainer = document.querySelector('.partners-logos');
        expect(logosContainer).toBeInTheDocument();
        expect(logosContainer?.children).toHaveLength(PARTNER_FOURTH_SECTION.length);
    });

    it('renders all partner items within logos container', () => {
        const logosContainer = document.querySelector('.partners-logos');
        const partnerItems = logosContainer?.querySelectorAll('.partner-item');

        expect(partnerItems).toHaveLength(PARTNER_FOURTH_SECTION.length);
    });

    it('renders each partner logo with proper alt text', () => {
        PARTNER_FOURTH_SECTION.forEach((partner) => {
            const logo = screen.getByAltText(`${partner.name} logo`);
            expect(logo).toBeInTheDocument();
            expect(logo).toHaveAttribute('alt', `${partner.name} logo`);
        });
    });
});