import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { useTranslation } from 'react-i18next';
import { CtaSection } from './CtaSection';
import { PUBLIC_ROUTES } from '@/const/public/routes';

jest.mock('react-i18next', () => ({
    useTranslation: jest.fn(),
}));

jest.mock(
    './CtaSection.module.scss',
    () =>
        new Proxy(
            {},
            {
                get: (_, key) => key,
            },
        ),
);

describe('CtaSection', () => {
    const mockUseTranslation = useTranslation as jest.Mock;
    const windowOpenSpy = jest.spyOn(window, 'open').mockImplementation(() => null);

    beforeEach(() => {
        mockUseTranslation.mockReturnValue({
            t: (key: string) => key,
        });
        windowOpenSpy.mockClear();
    });

    afterAll(() => {
        windowOpenSpy.mockRestore();
    });

    it('renders the CTA title and description', () => {
        render(<CtaSection />);
        expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('ctaTitle');
        expect(screen.getByText('ctaDescription')).toBeInTheDocument();
    });

    it('renders the donate button', () => {
        render(<CtaSection />);
        expect(screen.getByRole('button', { name: 'ctaButton' })).toBeInTheDocument();
    });

    it('opens the donate page in a new tab when button is clicked', () => {
        render(<CtaSection />);
        fireEvent.click(screen.getByRole('button', { name: 'ctaButton' }));
        expect(windowOpenSpy).toHaveBeenCalledWith(PUBLIC_ROUTES.DONATE.FULL, '_blank', 'noopener,noreferrer');
    });
});
