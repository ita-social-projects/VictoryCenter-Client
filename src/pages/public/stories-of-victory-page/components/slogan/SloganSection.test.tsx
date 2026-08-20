import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import { SloganSection } from './SloganSection';

// Mock react-i18next BEFORE importing the component
jest.mock('react-i18next', () => ({
    useTranslation: jest.fn(),
}));

describe('SloganSection', () => {
    beforeEach(() => {
        const { useTranslation } = require('react-i18next');
        (useTranslation as jest.Mock).mockReturnValue({
            t: (key: string) => key,
            i18n: { changeLanguage: jest.fn() },
        });
    });

    it('should render without crashing', () => {
        const { container } = render(<SloganSection />);
        expect(container).toBeInTheDocument();
    });

    it('should render section element', () => {
        const { container } = render(<SloganSection />);
        const section = container.querySelector('section');
        expect(section).toBeInTheDocument();
    });

    it('should render h1 with slogan-section testid', () => {
        render(<SloganSection />);
        const heading = screen.getByTestId('slogan-section');
        expect(heading).toBeInTheDocument();
        expect(heading.tagName).toBe('H1');
    });

    it('should call useTranslation with successPage namespace', () => {
        const { useTranslation } = require('react-i18next');
        render(<SloganSection />);
        expect(useTranslation).toHaveBeenCalledWith('successPage');
    });

    it('should render all translation keys', () => {
        render(<SloganSection />);
        expect(screen.getByText('SLOGAN.FIRST_TEXT')).toBeInTheDocument();
        expect(screen.getByText('SLOGAN.SECOND_TEXT')).toBeInTheDocument();
        expect(screen.getByText('SLOGAN.THIRD_TEXT')).toBeInTheDocument();
        expect(screen.getByText('SLOGAN.FOURTH_TEXT')).toBeInTheDocument();
        expect(screen.getByText('SLOGAN.FIFTH_TEXT')).toBeInTheDocument();
        expect(screen.getByText('SLOGAN.SIXTH_TEXT')).toBeInTheDocument();
    });

    it('should render br elements', () => {
        const { container } = render(<SloganSection />);
        const brElements = container.querySelectorAll('br');
        expect(brElements.length).toBeGreaterThan(0);
    });

    it('should apply yellow highlight class to first text', () => {
        const { container } = render(<SloganSection />);
        const spans = container.querySelectorAll('span');
        let firstTextSpan: Element | null = null;

        for (let i = 0; i < spans.length; i++) {
            if (spans[i].textContent === 'SLOGAN.FIRST_TEXT') {
                firstTextSpan = spans[i];
                break;
            }
        }

        expect(firstTextSpan).toBeInTheDocument();
        expect(firstTextSpan?.className).toContain('highlight');
        expect(firstTextSpan?.className).toContain('yellow');
    });

    it('should render correct number of spans', () => {
        const { container } = render(<SloganSection />);
        const spans = container.querySelectorAll('h1 span');
        expect(spans.length).toBeGreaterThan(5);
    });
});
