import { render, screen } from '@testing-library/react';
import { PUBLIC_ROUTES } from '@/const/public/routes';
import { DonateSection } from './DonateSection';

jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock('@/components/public/cta', () => ({
    CtaSection: ({
        title,
        description,
        mediaUrl,
        buttons,
    }: React.ComponentProps<typeof import('@/components/public/cta').CtaSection>) => (
        <section data-testid="cta-section" data-media-url={mediaUrl}>
            <h2>{title}</h2>
            <p>{description}</p>
            {buttons.map((btn) => (
                <a key={btn.href} href={btn.href} target={btn.target} rel={btn.rel}>
                    {btn.label}
                </a>
            ))}
        </section>
    ),
}));

describe('DonateSection', () => {
    it('feeds the localized donate content into the shared CTA section', () => {
        render(<DonateSection />);

        expect(screen.getByRole('heading', { level: 2, name: 'DONATE.TITLE' })).toBeInTheDocument();
        expect(screen.getByText('DONATE.DESCRIPTION')).toBeInTheDocument();

        const donateLink = screen.getByRole('link', { name: 'DONATE.SUBMIT_BUTTON' });

        expect(donateLink).toHaveAttribute('href', PUBLIC_ROUTES.DONATE.FULL);
        expect(donateLink).toHaveAttribute('target', '_blank');
        expect(donateLink).toHaveAttribute('rel', 'noopener noreferrer');
    });
});
