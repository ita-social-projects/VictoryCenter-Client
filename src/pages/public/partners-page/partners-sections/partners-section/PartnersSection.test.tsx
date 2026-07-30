import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useLocation, useNavigate } from 'react-router-dom';
import { PartnersSection } from './PartnersSection';
import {
    PartnerSection as PartnerSectionType,
    PartnerSectionLocalizationDto,
    PartnerLocalizationDto,
} from '@/types/public/partners-page';

jest.mock('react-router-dom', () => ({
    useLocation: jest.fn(),
    useNavigate: jest.fn(),
}));

describe('PartnersSection', () => {
    beforeEach(() => {
        (useLocation as jest.Mock).mockReturnValue({ pathname: '/', search: '' });
        (useNavigate as jest.Mock).mockReturnValue(jest.fn());
    });

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

    it('should render the localized title, description and partner descriptions when a localization matches the current language', () => {
        const sectionLocalization: PartnerSectionLocalizationDto = {
            entityId: 1,
            title: 'Localized title',
            description: 'Localized description',
            translationStatus: 1,
            localizationInfoDto: { id: 2, code: 'uk' },
        };

        const partnerLocalization: PartnerLocalizationDto = {
            entityId: 1,
            description: 'Localized Partner One',
            translationStatus: 1,
            localizationInfoDto: { id: 2, code: 'uk' },
        };

        const sectionWithLocalization: PartnerSectionType = {
            ...mockSection,
            localizations: [sectionLocalization],
            partners: mockSection.partners.map((partner) =>
                partner.id === 1 ? { ...partner, localizations: [partnerLocalization] } : partner,
            ),
        };

        render(<PartnersSection section={sectionWithLocalization} />);

        expect(screen.getByRole('heading', { name: 'Localized title' })).toBeInTheDocument();
        expect(screen.getByText('Localized description')).toBeInTheDocument();
        expect(screen.getByText('Localized Partner One')).toBeInTheDocument();

        expect(screen.getByText('Partner Two')).toBeInTheDocument();

        expect(screen.queryByText('Our partners')).not.toBeInTheDocument();
        expect(screen.queryByText('Partner One')).not.toBeInTheDocument();
    });
});
