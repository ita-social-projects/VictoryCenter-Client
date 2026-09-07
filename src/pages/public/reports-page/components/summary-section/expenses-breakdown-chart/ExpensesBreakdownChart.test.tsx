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

    it('passes items sorted by amount descending to child components (where source and reversed orders differ)', () => {
        const items: ExpenseItem[] = [
            { label: 'mid', amount: 300, percent: 0.3 },
            { label: 'low', amount: 100, percent: 0.1 },
            { label: 'high', amount: 500, percent: 0.5 },
        ];

        render(<ExpensesBreakdownChart items={items} formatAmount={mockFormatAmount} />);

        const expectedOrder = 'high,mid,low';

        expect(screen.getByTestId('chart-graphic')).toHaveTextContent(expectedOrder);
        expect(screen.getByTestId('chart-legend')).toHaveTextContent(expectedOrder);
    });

    it('breaks equal amounts by percent descending', () => {
        const items: ExpenseItem[] = [
            { label: 'small', amount: 100, percent: 0.05 },
            { label: 'big', amount: 100, percent: 0.07 },
            { label: 'tiny', amount: 100, percent: 0.01 },
        ];

        render(<ExpensesBreakdownChart items={items} formatAmount={mockFormatAmount} />);

        const expectedOrder = 'big,small,tiny';

        expect(screen.getByTestId('chart-graphic')).toHaveTextContent(expectedOrder);
        expect(screen.getByTestId('chart-legend')).toHaveTextContent(expectedOrder);
    });

    it('does not mutate the incoming items array', () => {
        const items: ExpenseItem[] = [
            { label: 'mid', amount: 300, percent: 0.3 },
            { label: 'low', amount: 100, percent: 0.1 },
            { label: 'high', amount: 500, percent: 0.5 },
        ];
        const originalOrder = 'mid,low,high';

        render(<ExpensesBreakdownChart items={items} formatAmount={mockFormatAmount} />);

        expect(items.map((i) => i.label).join(',')).toBe(originalOrder);
    });

    it('renders correctly with empty items', () => {
        render(<ExpensesBreakdownChart items={[]} formatAmount={mockFormatAmount} />);

        expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument();
        expect(screen.getByTestId('chart-graphic')).toBeEmptyDOMElement();
        expect(screen.getByTestId('chart-legend')).toBeEmptyDOMElement();
    });
});
