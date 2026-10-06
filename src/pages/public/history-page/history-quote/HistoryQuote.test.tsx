import { render, screen } from '@testing-library/react';
import { HistoryQuote } from './HistoryQuote';
import { CtaSection } from '@/components/public/cta';

jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock('@/components/public/cta', () => ({
    CtaSection: ({ title, description, titleVariant }: React.ComponentProps<typeof CtaSection>) => (
        <div data-testid="cta-section" data-title-variant={titleVariant}>
            <h2>{title}</h2>
            <p>{description}</p>
        </div>
    ),
}));

describe('HistoryQuote', () => {
    it('should render closing title and description', () => {
        render(<HistoryQuote />);

        expect(screen.getByText('CLOSING_TITLE')).toBeInTheDocument();
        expect(screen.getByText('CLOSING_DESCRIPTION')).toBeInTheDocument();
    });

    it('should render the closing title with the emphasis variant', () => {
        render(<HistoryQuote />);

        expect(screen.getByTestId('cta-section')).toHaveAttribute('data-title-variant', 'emphasis');
    });
});
