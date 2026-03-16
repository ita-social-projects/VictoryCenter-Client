import React from 'react';
import { render, screen } from '@testing-library/react';
import { ExpensesBreakdownChart } from './ExpensesBreakdownChart';
import { ExpenseItem } from '@/types/public/reports/expenses';

jest.mock('./chart-graphic', () => ({
    ChartGraphic: ({ items }: any) => (
        <div data-testid="chart-graphic">{items.map((item: ExpenseItem) => item.label).join(',')}</div>
    ),
}));

jest.mock('./chart-legend', () => ({
    ChartLegend: ({ items }: any) => (
        <div data-testid="chart-legend">{items.map((item: ExpenseItem) => item.label).join(',')}</div>
    ),
}));

const mockFormatAmount = jest.fn((amount: number) => `${amount} грн`);

describe('ExpensesBreakdownChart', () => {
    const mockItems: ExpenseItem[] = [
        { label: 'Admin Expenses', amount: 500, percent: 0.25 },
        { label: 'Operational Expenses', amount: 1500, percent: 0.75 },
    ];

    it('renders the chart title', () => {
        render(<ExpensesBreakdownChart items={mockItems} formatAmount={mockFormatAmount} />);

        expect(screen.getByRole('heading', { level: 3, name: /основні витрати/i })).toBeInTheDocument();
    });

    it('passes reversed items to child components', () => {
        render(<ExpensesBreakdownChart items={mockItems} formatAmount={mockFormatAmount} />);

        const expectedOrder = 'Operational Expenses,Admin Expenses';

        expect(screen.getByTestId('chart-graphic')).toHaveTextContent(expectedOrder);
        expect(screen.getByTestId('chart-legend')).toHaveTextContent(expectedOrder);
    });

    it('renders correctly with empty items', () => {
        render(<ExpensesBreakdownChart items={[]} formatAmount={mockFormatAmount} />);

        expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument();
        expect(screen.getByTestId('chart-graphic')).toBeEmptyDOMElement();
        expect(screen.getByTestId('chart-legend')).toBeEmptyDOMElement();
    });
});
