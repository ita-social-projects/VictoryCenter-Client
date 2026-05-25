import React from 'react';
import { render, screen } from '@testing-library/react';
import { useTranslation } from 'react-i18next';
import { PartnerTypesSection } from './PartnerTypesSection';

jest.mock('react-i18next', () => ({
    useTranslation: jest.fn(),
}));

jest.mock(
    './PartnerTypesSection.module.scss',
    () =>
        new Proxy(
            {},
            {
                get: (_, key) => key,
            },
        ),
);

describe('PartnerTypesSection', () => {
    const mockUseTranslation = useTranslation as jest.Mock;

    beforeEach(() => {
        mockUseTranslation.mockReturnValue({
            t: (key: string) => key,
        });
    });

    it('renders the section heading', () => {
        render(<PartnerTypesSection />);
        expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('partnersSectionTitle');
    });

    it('renders three partner type cards', () => {
        render(<PartnerTypesSection />);
        expect(screen.getByText('partner1Text')).toBeInTheDocument();
        expect(screen.getByText('partner2Text')).toBeInTheDocument();
        expect(screen.getByText('partner3Text')).toBeInTheDocument();
    });
});
