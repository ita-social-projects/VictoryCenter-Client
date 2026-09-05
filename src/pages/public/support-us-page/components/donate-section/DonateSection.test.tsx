import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { PUBLIC_ROUTES } from '@/const/public/routes';
import { DonateSection } from './DonateSection';

jest.mock(
    './DonateSection.module.scss',
    () =>
        new Proxy(
            {},
            {
                get: (_, key) => key,
            },
        ),
);

jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key: string) => key }),
}));

describe('DonateSection', () => {
    it('renders a CTA link to the donation page', () => {
        render(
            <MemoryRouter>
                <DonateSection />
            </MemoryRouter>,
        );

        expect(screen.getByRole('heading', { level: 2, name: 'DONATE.TITLE' })).toBeInTheDocument();
        expect(screen.getByRole('heading', { level: 4, name: 'DONATE.DESCRIPTION' })).toBeInTheDocument();

        const donateLink = screen.getByRole('link', { name: 'DONATE.SUBMIT_BUTTON' });

        expect(donateLink).toHaveAttribute('href', PUBLIC_ROUTES.DONATE.FULL);
        expect(donateLink).toHaveAttribute('target', '_blank');
        expect(donateLink).toHaveAttribute('rel', 'noopener noreferrer');
    });
});
