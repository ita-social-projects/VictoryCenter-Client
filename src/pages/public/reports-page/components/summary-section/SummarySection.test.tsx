import React from 'react';
import { render, screen } from '@testing-library/react';
import { useTranslation } from 'react-i18next';
import { SummarySection } from './SummarySection';

jest.mock('@/utils/mock-data/public/reports-page', () => ({
    SUMMARY_DATA: {
        collected: { uah: 100000, usd: 2500 },
        livesChanged: 42,
    },
    EXPENSES_DATA: { items: [{ label: 'Expense 1', amount: 10 }] },
    FUNDING_DATA: { items: [{ label: 'Funding 1', amount: 20 }] },
    PROGRAMS_ALLOCATION_DATA: { items: [{ label: 'Program 1', amount: 30 }] },
}));

jest.mock('./stat-card', () => ({
    StatCard: ({ label, value, currency }: any) => (
        <div data-testid="stat-card">
            {label}: {value} {currency}
        </div>
    ),
}));

jest.mock('./expenses-breakdown-chart', () => ({
    ExpensesBreakdownChart: ({ items }: any) => <div data-testid="expenses-chart">{JSON.stringify(items)}</div>,
}));

jest.mock('./funding-sources-chart', () => ({
    FundingSourcesChart: ({ items }: any) => <div data-testid="funding-chart">{JSON.stringify(items)}</div>,
}));

jest.mock('./programs-allocation-chart', () => ({
    ProgramsAllocationChart: ({ items }: any) => <div data-testid="programs-chart">{JSON.stringify(items)}</div>,
}));

jest.mock('react-i18next', () => ({
    useTranslation: jest.fn(),
}));

describe('SummarySection', () => {
    const useTranslationMock = useTranslation as jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();

        useTranslationMock.mockReturnValue({
            t: (key: string) => key,
            i18n: { language: 'uk' },
        });
    });

    it('renders correct collected amount and currency for Ukrainian (Default)', () => {
        render(<SummarySection />);

        const cards = screen.getAllByTestId('stat-card');
        expect(cards[0]).toHaveTextContent('summary.collected: 100000 UAH');
    });

    it('renders correct collected amount and currency for English', () => {
        useTranslationMock.mockReturnValue({
            t: (key: string) => key,
            i18n: { language: 'en' },
        });

        render(<SummarySection />);

        const cards = screen.getAllByTestId('stat-card');
        expect(cards[0]).toHaveTextContent('summary.collected: 2500 USD');
    });

    it('renders lives changed card with static data', () => {
        render(<SummarySection />);

        const cards = screen.getAllByTestId('stat-card');
        expect(cards[1]).toHaveTextContent('summary.lives: 42');
    });

    it('passes correct data props to Expenses chart', () => {
        render(<SummarySection />);

        const chart = screen.getByTestId('expenses-chart');
        const expectedData = [{ label: 'Expense 1', amount: 10 }];
        expect(chart).toHaveTextContent(JSON.stringify(expectedData));
    });

    it('passes correct data props to Funding chart', () => {
        render(<SummarySection />);

        const chart = screen.getByTestId('funding-chart');
        const expectedData = [{ label: 'Funding 1', amount: 20 }];
        expect(chart).toHaveTextContent(JSON.stringify(expectedData));
    });

    it('passes correct data props to Programs chart', () => {
        render(<SummarySection />);

        const chart = screen.getByTestId('programs-chart');
        const expectedData = [{ label: 'Program 1', amount: 30 }];
        expect(chart).toHaveTextContent(JSON.stringify(expectedData));
    });
});
