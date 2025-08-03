import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PartnersPage } from './PartnersPage';

// Mock all child components
jest.mock('./partners-page/intro-section/introSection', () => ({
    IntroSection: () => <div data-testid="intro-section">IntroSection</div>
}));

jest.mock('./partners-page/partners-content/partnersFirstSection', () => ({
    PartnersFirstSection: () => <div data-testid="partners-first-section">PartnersFirstSection</div>
}));

jest.mock('./partners-page/partners-second-section/partnersSecondSection', () => ({
    PartnersSecondSectionContent: () => <div data-testid="partners-second-section">PartnersSecondSectionContent</div>
}));

jest.mock('./partners-page/partners-third-section/partnersThirdSection', () => ({
    PartnersThirdSection: () => <div data-testid="partners-third-section">PartnersThirdSection</div>
}));

jest.mock('./partners-page/partners-fouth-section/partnersFouthSection', () => ({
    PartnersFouthSectionContent: () => <div data-testid="partners-fourth-section">PartnersFouthSectionContent</div>
}));

jest.mock('./partners-page/outro-section/outroSection', () => ({
    OutroSection: () => <div data-testid="outro-section">OutroSection</div>
}));

describe('PartnersPage', () => {
    beforeEach(() => {
        render(<PartnersPage />);
    });

    it('renders without crashing', () => {
        expect(screen.getByTestId('intro-section')).toBeInTheDocument();
    });

    it('renders all required sections in correct order', () => {
        const introSection = screen.getByTestId('intro-section');
        const firstSection = screen.getByTestId('partners-first-section');
        const secondSection = screen.getByTestId('partners-second-section');
        const thirdSection = screen.getByTestId('partners-third-section');
        const fourthSection = screen.getByTestId('partners-fourth-section');
        const outroSection = screen.getByTestId('outro-section');

        expect(introSection).toBeInTheDocument();
        expect(firstSection).toBeInTheDocument();
        expect(secondSection).toBeInTheDocument();
        expect(thirdSection).toBeInTheDocument();
        expect(fourthSection).toBeInTheDocument();
        expect(outroSection).toBeInTheDocument();
    });

    it('renders IntroSection component', () => {
        expect(screen.getByTestId('intro-section')).toBeInTheDocument();
        expect(screen.getByText('IntroSection')).toBeInTheDocument();
    });

    it('renders PartnersFirstSection component', () => {
        expect(screen.getByTestId('partners-first-section')).toBeInTheDocument();
        expect(screen.getByText('PartnersFirstSection')).toBeInTheDocument();
    });

    it('renders PartnersSecondSectionContent component', () => {
        expect(screen.getByTestId('partners-second-section')).toBeInTheDocument();
        expect(screen.getByText('PartnersSecondSectionContent')).toBeInTheDocument();
    });

    it('renders PartnersThirdSection component', () => {
        expect(screen.getByTestId('partners-third-section')).toBeInTheDocument();
        expect(screen.getByText('PartnersThirdSection')).toBeInTheDocument();
    });

    it('renders PartnersFouthSectionContent component', () => {
        expect(screen.getByTestId('partners-fourth-section')).toBeInTheDocument();
        expect(screen.getByText('PartnersFouthSectionContent')).toBeInTheDocument();
    });

    it('renders OutroSection component', () => {
        expect(screen.getByTestId('outro-section')).toBeInTheDocument();
        expect(screen.getByText('OutroSection')).toBeInTheDocument();
    });

    it('maintains correct section order in DOM', () => {
        const container = document.body;
        const sections = [
            'intro-section',
            'partners-first-section',
            'partners-second-section',
            'partners-third-section',
            'partners-fourth-section',
            'outro-section'
        ];

        sections.forEach((sectionId, index) => {
            const section = screen.getByTestId(sectionId);
            expect(section).toBeInTheDocument();

            if (index > 0) {
                const previousSectionId = sections[index - 1];
                const previousSection = screen.getByTestId(previousSectionId);
                expect(section.compareDocumentPosition(previousSection)).toBe(
                    Node.DOCUMENT_POSITION_PRECEDING
                );
            }
        });
    });

    it('renders exactly 6 sections', () => {
        const sections = document.querySelectorAll('[data-testid]');
        expect(sections).toHaveLength(6);
    });

    it('renders all sections without errors', () => {
        const sections = [
            'intro-section',
            'partners-first-section',
            'partners-second-section',
            'partners-third-section',
            'partners-fourth-section',
            'outro-section'
        ];

        sections.forEach(sectionId => {
            expect(screen.getByTestId(sectionId)).toBeInTheDocument();
        });
    });

    it('has correct component structure', () => {
        expect(screen.getByTestId('intro-section')).toBeInTheDocument();
        expect(screen.getByTestId('partners-first-section')).toBeInTheDocument();
        expect(screen.getByTestId('partners-second-section')).toBeInTheDocument();
        expect(screen.getByTestId('partners-third-section')).toBeInTheDocument();
        expect(screen.getByTestId('partners-fourth-section')).toBeInTheDocument();
        expect(screen.getByTestId('outro-section')).toBeInTheDocument();
    });

    it('imports and renders all required components', () => {
        const expectedComponents = [
            'IntroSection',
            'PartnersFirstSection',
            'PartnersSecondSectionContent',
            'PartnersThirdSection',
            'PartnersFouthSectionContent',
            'OutroSection'
        ];

        expectedComponents.forEach(componentName => {
            expect(screen.getByText(componentName)).toBeInTheDocument();
        });
    });

    it('renders partners content sections in sequence', () => {
        const partnersContentSections = [
            'partners-first-section',
            'partners-second-section',
            'partners-third-section',
            'partners-fourth-section'
        ];

        partnersContentSections.forEach(sectionId => {
            expect(screen.getByTestId(sectionId)).toBeInTheDocument();
        });
    });

    it('has intro section at the beginning', () => {
        const introSection = screen.getByTestId('intro-section');
        const allSections = document.querySelectorAll('[data-testid]');
        expect(allSections[0]).toBe(introSection);
    });

    it('has outro section at the end', () => {
        const outroSection = screen.getByTestId('outro-section');
        const allSections = document.querySelectorAll('[data-testid]');
        expect(allSections[allSections.length - 1]).toBe(outroSection);
    });

    it('renders all partner sections between intro and outro', () => {
        const allSections = document.querySelectorAll('[data-testid]');
        const partnerSectionIds = [
            'partners-first-section',
            'partners-second-section',
            'partners-third-section',
            'partners-fourth-section'
        ];

        partnerSectionIds.forEach((sectionId, index) => {
            const section = screen.getByTestId(sectionId);
            expect(allSections[index + 1]).toBe(section);
        });
    });

    it('renders functional component correctly', () => {
        expect(PartnersPage).toBeInstanceOf(Function);
        expect(screen.getByTestId('intro-section')).toBeInTheDocument();
    });
});