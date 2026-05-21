import { render, screen } from '@testing-library/react';
import { HistoryQuote } from './HistoryQuote';
import * as CtaModule from '@/components/public/cta';

jest.mock('@/components/public/cta', () => ({
    CtaSection: jest.fn(),
}));

const MockedCtaSection = CtaModule.CtaSection as jest.Mock;

describe('HistoryQuote', () => {
    beforeEach(() => {
        MockedCtaSection.mockImplementation(() => <div data-testid="cta-section" />);
    });

    it('should render a CtaSection', () => {
        render(<HistoryQuote />);

        expect(screen.getByTestId('cta-section')).toBeInTheDocument();
    });

    it('should pass translated donate and partner button labels', () => {
        render(<HistoryQuote />);

        const props = MockedCtaSection.mock.calls[0][0];
        expect(props.buttons).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ label: 'Донатити' }),
                expect.objectContaining({ label: 'Стати партнером' }),
            ]),
        );
    });

    it('should pass donate and partner hrefs', () => {
        render(<HistoryQuote />);

        const props = MockedCtaSection.mock.calls[0][0];
        expect(props.buttons).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ href: '/donate' }),
                expect.objectContaining({ href: '/partners-page' }),
            ]),
        );
    });

    it('should pass overlay with correct opacity and color', () => {
        render(<HistoryQuote />);

        const props = MockedCtaSection.mock.calls[0][0];
        expect(props.overlay).toEqual({ opacity: 0.35, color: '#0f0600' });
    });
});
