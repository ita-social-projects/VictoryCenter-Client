import React from 'react';
import { render, screen } from '@testing-library/react';
import { SupportUsPage } from './SupportUsPage';

jest.mock(
    './SupportUsPage.module.scss',
    () =>
        new Proxy(
            {},
            {
                get: (_, key) => key,
            },
        ),
);

jest.mock('./components/hero-section/HeroSection', () => ({
    HeroSection: () => <div data-testid="hero-section" />,
}));

jest.mock('./components/partner-types-section/PartnerTypesSection', () => ({
    PartnerTypesSection: () => <div data-testid="partner-types-section" />,
}));

jest.mock('./components/contact-section/ContactSection', () => ({
    ContactSection: () => <div data-testid="contact-section" />,
}));

jest.mock('./components/cta-section/CtaSection', () => ({
    CtaSection: () => <div data-testid="cta-section" />,
}));

describe('SupportUsPage', () => {
    it('renders all page sections', () => {
        render(<SupportUsPage />);
        expect(screen.getByTestId('hero-section')).toBeInTheDocument();
        expect(screen.getByTestId('partner-types-section')).toBeInTheDocument();
        expect(screen.getByTestId('contact-section')).toBeInTheDocument();
        expect(screen.getByTestId('cta-section')).toBeInTheDocument();
    });
});
