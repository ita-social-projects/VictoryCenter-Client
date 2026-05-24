import { render, screen } from '@testing-library/react';
import { HistoryQuote } from './HistoryQuote';

jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock('@/components/public/cta', () => ({
    CtaSection: ({ title, description }: { title: string; description: string }) => (
        <div>
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
});
