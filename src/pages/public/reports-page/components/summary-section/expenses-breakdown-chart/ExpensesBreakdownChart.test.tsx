import React from 'react';
import { render, screen } from '@testing-library/react';
import { ExpensesBreakdownChart } from './ExpensesBreakdownChart';
import { ExpenseItem } from '@/types/public/reports/expenses';

describe('ExpensesBreakdownChart', () => {
    const mockItems: ExpenseItem[] = [
        { label: 'Admin Expenses', amount: 500, percent: 0.25 },
        { label: 'Operational Expenses', amount: 1500, percent: 0.75 },
    ];

    it('renders the chart title', () => {
        render(<ExpensesBreakdownChart items={mockItems} />);
        expect(screen.getByRole('heading', { level: 3, name: /основні витрати/i })).toBeInTheDocument();
    });

    it('renders the legend component with provided items', () => {
        render(<ExpensesBreakdownChart items={mockItems} />);

        expect(screen.getByText('Admin Expenses')).toBeInTheDocument();
        expect(screen.getByText('Operational Expenses')).toBeInTheDocument();
    });

    it('renders correctly with empty items', () => {
        render(<ExpensesBreakdownChart items={[]} />);

        expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument();
        expect(screen.queryByText('Admin Expenses')).not.toBeInTheDocument();
    });
});
