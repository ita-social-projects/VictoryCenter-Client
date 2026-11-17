import { render, screen } from '@testing-library/react';
import { FeedbackQuote } from './FeedbackQuote';
import { CtaSection } from '@/components/public/cta';
import { PUBLIC_ROUTES } from '@/const/public/routes';

const mockUseTranslation = jest.fn();

jest.mock('react-i18next', () => ({
    useTranslation: (ns?: string) => mockUseTranslation(ns),
}));

jest.mock('./feedback-quote-bg.png', () => 'feedback-quote-bg.png');

jest.mock('@/components/public/cta', () => ({
    CtaSection: ({
        title,
        description,
        titleVariant,
        mediaUrl,
        overlay,
        buttons,
    }: React.ComponentProps<typeof CtaSection>) => (
        <div
            data-testid="cta-section"
            data-title-variant={titleVariant}
            data-media-url={mediaUrl}
            data-overlay={JSON.stringify(overlay)}
        >
            <h2>{title}</h2>
            <p>{description}</p>
            {buttons?.map((button) => (
                <a key={button.label} href={button.href}>
                    {button.label}
                </a>
            ))}
        </div>
    ),
}));

describe('FeedbackQuote', () => {
    beforeEach(() => {
        mockUseTranslation.mockReturnValue({ t: (key: string) => key });
    });

    it('should use the feedbackPage translation namespace', () => {
        render(<FeedbackQuote />);

        expect(mockUseTranslation).toHaveBeenCalledWith('feedbackPage');
    });

    it('should render closing title and description', () => {
        render(<FeedbackQuote />);

        expect(screen.getByText('CLOSING_TITLE')).toBeInTheDocument();
        expect(screen.getByText('CLOSING_DESCRIPTION')).toBeInTheDocument();
    });

    it('should render the closing title with the default variant', () => {
        render(<FeedbackQuote />);

        expect(screen.getByTestId('cta-section')).toHaveAttribute('data-title-variant', 'default');
    });

    it('should pass the background image and overlay to the CTA section', () => {
        render(<FeedbackQuote />);

        const section = screen.getByTestId('cta-section');
        expect(section).toHaveAttribute('data-media-url', 'feedback-quote-bg.png');
        expect(section).toHaveAttribute('data-overlay', JSON.stringify({ opacity: 0.35, color: '#0f0600' }));
    });

    it('should render the donate button linking to the donate page', () => {
        render(<FeedbackQuote />);

        expect(screen.getByRole('link', { name: 'CLOSING_BTN_DONATE' })).toHaveAttribute(
            'href',
            PUBLIC_ROUTES.DONATE.FULL,
        );
    });

    it('should render the partner button linking to the support us page', () => {
        render(<FeedbackQuote />);

        expect(screen.getByRole('link', { name: 'CLOSING_BTN_PARTNER' })).toHaveAttribute(
            'href',
            PUBLIC_ROUTES.SUPPORT_US.FULL,
        );
    });
});
