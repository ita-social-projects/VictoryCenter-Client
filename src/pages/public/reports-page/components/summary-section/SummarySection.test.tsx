import React from 'react';
import { render, screen } from '@testing-library/react';
import { SummarySection } from './SummarySection';
import { useLocale } from '@/hooks/common/use-locale/useLocale';

jest.mock('@/hooks/common/use-locale/useLocale', () => ({
    useLocale: jest.fn(),
}));

jest.mock('@/utils/mock-data/public/reports-page', () => ({
    SUMMARY_DATA: {
        collected: { uah: 100000, usd: 2352.94 },
        livesChanged: 42,
        disclaimer: 'Test currency disclaimer text',
    },
    EXPENSES_DATA: { items: [{ label: 'Expense 1', amount: { uah: 10, usd: 0.24 }, percent: 10 }] },
    FUNDING_DATA: { items: [{ label: 'Funding 1', amount: { uah: 20, usd: 0.47 } }] },
    PROGRAMS_ALLOCATION_DATA: { items: [{ label: 'Program 1', amount: { uah: 30, usd: 0.71 } }] },
}));

jest.mock('./stat-card', () => ({
    StatCard: ({ label, value, currency, formattedValue }: any) => (
        <div data-testid="stat-card">
            {label}: {formattedValue !== undefined ? formattedValue : `${value} ${currency ?? ''}`}
        </div>
    ),
}));

jest.mock('./expenses-breakdown-chart', () => ({
    ExpensesBreakdownChart: ({ items, formatAmount }: any) => (
        <div data-testid="expenses-chart">
            {JSON.stringify(items)}
            {items[0] ? formatAmount(items[0].amount) : ''}
        </div>
    ),
}));

jest.mock('./funding-sources-chart', () => ({
    FundingSourcesChart: ({ items, formatAmount }: any) => (
        <div data-testid="funding-chart">
            {JSON.stringify(items)}
            {items[0] ? formatAmount(items[0].amount) : ''}
        </div>
    ),
}));

jest.mock('./programs-allocation-chart', () => ({
    ProgramsAllocationChart: ({ items, formatAmount }: any) => (
        <div data-testid="programs-chart">
            {JSON.stringify(items)}
            {items[0] ? formatAmount(items[0].amount) : ''}
        </div>
    ),
}));

const mockUseLocale = useLocale as jest.Mock;

describe('SummarySection', () => {
    beforeEach(() => {
        mockUseLocale.mockReturnValue({ isEn: false });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('renders collected stat card with UAH currency by default', () => {
        render(<SummarySection />);

        const cards = screen.getAllByTestId('stat-card');
        expect(cards[0]).toHaveTextContent('Зібрано: 100 000 грн');
    });

    it('renders collected stat card with pre-formatted USD value when English is active', () => {
        mockUseLocale.mockReturnValue({ isEn: true });

        render(<SummarySection />);

        const cards = screen.getAllByTestId('stat-card');
        expect(cards[0]).toHaveTextContent('Зібрано: 2 352 USD');
    });

    it('renders lives changed card with static data', () => {
        render(<SummarySection />);

        const cards = screen.getAllByTestId('stat-card');
        expect(cards[1]).toHaveTextContent('Змінених життів: 42');
    });

    it('does not render disclaimer when UAH is active', () => {
        render(<SummarySection />);

        expect(screen.queryByText('Test currency disclaimer text')).not.toBeInTheDocument();
    });

    it('renders disclaimer for the report summary', () => {
        mockUseLocale.mockReturnValue({ isEn: true });

        render(<SummarySection />);

        expect(screen.getByText('Test currency disclaimer text')).toBeInTheDocument();
    });

    it('does not render disclaimer when English is active but disclaimer text is missing', () => {
        mockUseLocale.mockReturnValue({ isEn: true });

        const reportsPageMock = jest.requireMock('@/utils/mock-data/public/reports-page') as {
            SUMMARY_DATA: { disclaimer?: string };
        };
        const originalDisclaimer = reportsPageMock.SUMMARY_DATA.disclaimer;
        reportsPageMock.SUMMARY_DATA.disclaimer = undefined;

        render(<SummarySection />);

        expect(screen.queryByText('Test currency disclaimer text')).not.toBeInTheDocument();

        reportsPageMock.SUMMARY_DATA.disclaimer = originalDisclaimer;
    });

    it('passes correct data to Expenses chart', () => {
        render(<SummarySection />);

        const chart = screen.getByTestId('expenses-chart');
        const expectedData = [{ label: 'Expense 1', amount: 10, percent: 10 }];
        expect(chart).toHaveTextContent(JSON.stringify(expectedData));
    });

    it('passes correct data to Funding chart', () => {
        render(<SummarySection />);

        const chart = screen.getByTestId('funding-chart');
        const expectedData = [{ label: 'Funding 1', amount: 20 }];
        expect(chart).toHaveTextContent(JSON.stringify(expectedData));
    });

    it('passes correct data to Programs chart', () => {
        render(<SummarySection />);

        const chart = screen.getByTestId('programs-chart');
        const expectedData = [{ label: 'Program 1', amount: 30 }];
        expect(chart).toHaveTextContent(JSON.stringify(expectedData));
    });
});
