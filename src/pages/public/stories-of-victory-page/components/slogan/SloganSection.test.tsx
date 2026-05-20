import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock react-i18next BEFORE importing the component
jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key) => {
            const translations: Record<string, string> = {
                'SLOGAN.FIRST_TEXT': 'First Text',
                'SLOGAN.SECOND_TEXT': 'Second Text',
                'SLOGAN.THIRD_TEXT': 'Third Text',
                'SLOGAN.FOURTH_TEXT': 'Fourth Text',
                'SLOGAN.FIFTH_TEXT': 'Fifth Text',
                'SLOGAN.SIXTH_TEXT': 'Sixth Text',
            };
            return translations[key] || key;
        },
        i18n: { changeLanguage: jest.fn() },
    }),
}));

import { SloganSection } from './SloganSection';

describe('SloganSection', () => {
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
        expect(screen.getByText('First Text')).toBeInTheDocument();
        expect(screen.getByText('Second Text')).toBeInTheDocument();
        expect(screen.getByText('Third Text')).toBeInTheDocument();
        expect(screen.getByText('Fourth Text')).toBeInTheDocument();
        expect(screen.getByText('Fifth Text')).toBeInTheDocument();
        expect(screen.getByText('Sixth Text')).toBeInTheDocument();
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
            if (spans[i].textContent === 'First Text') {
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
