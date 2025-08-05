import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { IntroSection } from './introSection';
import { PARTNERS_PAGE_SUBTITLE } from '../../../../const/partners-page/partners-page';

jest.mock('../../../../assets/partners-page-images/horses.png', () => 'mocked-horses-image');

jest.mock('../../../../const/partners-page/partners-page', () => ({
    PARTNERS_PAGE_SUBTITLE: 'Mocked subtitle text'
}));

describe('IntroSection', () => {
    beforeEach(() => {
        render(<IntroSection />);
    });

    it('renders without crashing', () => {
        const introBlock = screen.getByRole('img', { name: /horses/i });
        expect(introBlock).toBeInTheDocument();
    });

    it('displays the correct main title text', () => {
        expect(screen.getByText('МИ')).toBeInTheDocument();
        expect(screen.getByText('НЕ ОДНІ.')).toBeInTheDocument();
        expect(screen.getByText('І ЦЕ')).toBeInTheDocument();
        expect(screen.getByText('НАША')).toBeInTheDocument();
        expect(screen.getByText('СИЛА')).toBeInTheDocument();
    });

    it('displays the subtitle from constants', () => {
        expect(screen.getByText('Mocked subtitle text')).toBeInTheDocument();
    });

    it('renders the background image with correct attributes', () => {
        const backgroundImage = screen.getByRole('img', { name: /horses/i });
        expect(backgroundImage).toHaveAttribute('src', 'mocked-horses-image');
        expect(backgroundImage).toHaveClass('background-img');
    });

    it('has the correct structure with required CSS classes', () => {
        const container = document.querySelector('.partners-intro-block');
        expect(container).toBeInTheDocument();

        const overlay = document.querySelector('.content-overlay');
        expect(overlay).toBeInTheDocument();

        const mainTitle = document.querySelector('.main-title');
        expect(mainTitle).toBeInTheDocument();

        const subtitle = document.querySelector('.subtitle');
        expect(subtitle).toBeInTheDocument();
    });

    it('has bold text styling applied correctly', () => {
        const boldElements = document.querySelectorAll('.bold-text');
        expect(boldElements).toHaveLength(3);
        expect(boldElements[0]).toHaveTextContent('НЕ ОДНІ.');
        expect(boldElements[1]).toHaveTextContent('І ЦЕ');
        expect(boldElements[2]).toHaveTextContent('СИЛА');
    });

    it('has title lines with correct structure', () => {
        const titleLines = document.querySelectorAll('.title-line');
        expect(titleLines).toHaveLength(2);
    });

    it('renders subtitle with correct content', () => {
        const subtitle = screen.getByText('Mocked subtitle text');
        expect(subtitle).toHaveClass('subtitle');
        expect(subtitle.tagName).toBe('P');
        });
});