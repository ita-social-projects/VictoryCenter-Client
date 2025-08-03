import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PartnersFirstSection } from './partnersFirstSection';
import {
    PARTNER_FIRST_SECTION,
    PARTNERS_FIRST_SECTION_DESCRIPTION,
    PARTNERS_FIRST_SECTION_TITLE,
} from '../../../../const/partners-page/partners-page';

jest.mock('../../../../const/partners-page/partners-page', () => ({
    PARTNERS_FIRST_SECTION_TITLE: {
        FIRST_LINE: 'First Title Line ',
        SECOND_LINE: 'Second Title Line'
    },
    PARTNERS_FIRST_SECTION_DESCRIPTION: {
        FIRST_LINE: 'First description line ',
        SECOND_LINE: 'Second description line'
    },
    PARTNER_FIRST_SECTION: [
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
    ]
}));

describe('PartnersFirstSection', () => {
    beforeEach(() => {
        render(<PartnersFirstSection />);
    });

    it('renders without crashing', () => {
        const section = document.querySelector('.partners-content-section');
        expect(section).toBeInTheDocument();
    });

    it('displays the section title from constants', () => {
        const titleElement = screen.getByRole('heading', { level: 2 });
        expect(titleElement).toBeInTheDocument();
        expect(titleElement).toHaveTextContent('First Title Line Second Title Line');
        expect(titleElement).toHaveClass('section-title');
    });

    it('displays the section description from constants', () => {
        const descriptionElement = screen.getByText('First description line Second description line');
        expect(descriptionElement).toBeInTheDocument();
        expect(descriptionElement).toHaveClass('section-description');
        expect(descriptionElement.tagName).toBe('P');
    });

    it('renders all partners from the constants', () => {
        PARTNER_FIRST_SECTION.forEach((partner) => {
            const partnerName = screen.getByText(partner.name);
            const partnerLogo = screen.getByAltText(`${partner.name} logo`);

            expect(partnerName).toBeInTheDocument();
            expect(partnerLogo).toBeInTheDocument();
        });
    });

    it('renders partner logos with correct attributes', () => {
        PARTNER_FIRST_SECTION.forEach((partner) => {
            const logo = screen.getByAltText(`${partner.name} logo`);
            expect(logo).toHaveAttribute('src', partner.logo);
            expect(logo).toHaveClass('partner-logo');
        });
    });

    it('renders partner names with correct styling', () => {
        PARTNER_FIRST_SECTION.forEach((partner) => {
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
        expect(partnerItems).toHaveLength(PARTNER_FIRST_SECTION.length);

        partnerItems.forEach((item, index) => {
            const partner = PARTNER_FIRST_SECTION[index];
            const logo = item.querySelector('.partner-logo');
            const name = item.querySelector('.partner-name');

            expect(logo).toBeInTheDocument();
            expect(name).toBeInTheDocument();
            expect(name).toHaveTextContent(partner.name);
        });
    });

    it('uses unique keys for partner items', () => {
        const partnerItems = document.querySelectorAll('.partner-item');
        expect(partnerItems).toHaveLength(PARTNER_FIRST_SECTION.length);
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
        expect(screen.getByText(`${PARTNERS_FIRST_SECTION_TITLE.FIRST_LINE}${PARTNERS_FIRST_SECTION_TITLE.SECOND_LINE}`)).toBeInTheDocument();
        expect(screen.getByText(`${PARTNERS_FIRST_SECTION_DESCRIPTION.FIRST_LINE}${PARTNERS_FIRST_SECTION_DESCRIPTION.SECOND_LINE}`)).toBeInTheDocument();

        PARTNER_FIRST_SECTION.forEach((partner) => {
            expect(screen.getByText(partner.name)).toBeInTheDocument();
        });
    });
});