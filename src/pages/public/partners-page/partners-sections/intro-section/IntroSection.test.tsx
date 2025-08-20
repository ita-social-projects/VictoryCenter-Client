import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { IntroSection } from './IntroSection';

jest.mock('../../../../../assets/partners-page-images/horses.png', () => 'mocked-horses-image');

jest.mock('../../../../../const/public/partners-page.ts', () => ({
    PARTNERS_PAGE_SUBTITLE: 'Mocked subtitle text',
    PARTNERS_PAGE_TITLE: {
        FIRST_LINE: {
            REGULAR: 'МИ',
            BOLD: ' НЕ ОДНІ.',
        },
        SECOND_LINE: {
            BOLD_START: 'І ЦЕ',
            REGULAR: ' НАША ',
            BOLD_END: ' СИЛА ',
        },
    },
}));

const renderComponent = () => {
    return render(<IntroSection />);
};

describe('IntroSection', () => {
    it('renders without crashing', () => {
        renderComponent();
        const introBlock = screen.getByRole('img', { name: /horses/i });
        expect(introBlock).toBeInTheDocument();
    });

    it('displays the correct main title text', () => {
        renderComponent();
        expect(screen.getByText('МИ')).toBeInTheDocument();
        expect(screen.getByText('НЕ ОДНІ.')).toBeInTheDocument();
        expect(screen.getByText('І ЦЕ')).toBeInTheDocument();
        expect(screen.getByText('НАША')).toBeInTheDocument();
        expect(screen.getByText('СИЛА')).toBeInTheDocument();
    });

    it('displays the subtitle from constants', () => {
        renderComponent();
        expect(screen.getByText('Mocked subtitle text')).toBeInTheDocument();
    });

    it('renders the background image with correct attributes', () => {
        renderComponent();
        const backgroundImage = screen.getByRole('img', { name: /horses/i });
        expect(backgroundImage).toHaveAttribute('src', 'mocked-horses-image');
        expect(backgroundImage).toHaveClass('background-img-partners');
    });

    it('has the correct structure with required CSS classes', () => {
        renderComponent();
        const container = document.querySelector('.partners-intro-block');
        expect(container).toBeInTheDocument();

        const mainTitle = document.querySelector('.main-title');
        expect(mainTitle).toBeInTheDocument();

        const subtitle = document.querySelector('.subtitle');
        expect(subtitle).toBeInTheDocument();
    });

    it('has bold text styling applied correctly', () => {
        renderComponent();
        const boldElements = document.querySelectorAll('.bold-text');
        expect(boldElements).toHaveLength(3);
        expect(boldElements[0]).toHaveTextContent('НЕ ОДНІ.');
        expect(boldElements[1]).toHaveTextContent('І ЦЕ');
        expect(boldElements[2]).toHaveTextContent('СИЛА');
    });

    it('has title lines with correct structure', () => {
        renderComponent();
        const titleLines = document.querySelectorAll('.title-line');
        expect(titleLines).toHaveLength(2);
    });

    it('renders subtitle with correct content', () => {
        renderComponent();
        const subtitle = screen.getByText('Mocked subtitle text');
        expect(subtitle).toHaveClass('subtitle');
        expect(subtitle.tagName).toBe('P');
    });
});
