import React from 'react';
import { render, screen } from '@testing-library/react';
import { useTranslation } from 'react-i18next';
import { HeroSection } from './HeroSection';

jest.mock('react-i18next', () => ({
    useTranslation: jest.fn(),
}));

jest.mock(
    './HeroSection.module.scss',
    () =>
        new Proxy(
            {},
            {
                get: (_, key) => key,
            },
        ),
);

describe('HeroSection', () => {
    const mockUseTranslation = useTranslation as jest.Mock;

    beforeEach(() => {
        mockUseTranslation.mockReturnValue({
            t: (key: string) => key,
        });
    });

    it('renders the hero title', () => {
        render(<HeroSection />);
        expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('heroTitle');
    });
});
