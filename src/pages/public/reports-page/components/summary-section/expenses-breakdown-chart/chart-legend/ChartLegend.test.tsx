import React from 'react';
import { render, screen } from '@testing-library/react';
import { ChartLegend } from './ChartLegend';
import { ExpenseItem } from '@/types/public/reports';

describe('ChartLegend', () => {
    const mockItems: ExpenseItem[] = [
        { label: 'Item 1', amount: 100, percent: 0.15 },
        { label: 'Item 2', amount: 200, percent: 0.35 },
        { label: 'Item 3', amount: 300, percent: 0.5 },
    ];

    it('renders all items in provided order', () => {
        render(<ChartLegend items={mockItems} />);

        const labels = screen.getAllByText(/Item/);

        expect(labels).toHaveLength(3);
        expect(labels[0]).toHaveTextContent('Item 1');
        expect(labels[1]).toHaveTextContent('Item 2');
        expect(labels[2]).toHaveTextContent('Item 3');
    });

    it('assigns correct data-level attribute based on index', () => {
        render(<ChartLegend items={mockItems} />);

        const square0 = screen.getByText('Item 1').previousElementSibling;
        const square1 = screen.getByText('Item 2').previousElementSibling;
        const square2 = screen.getByText('Item 3').previousElementSibling;

        expect(square0).toHaveAttribute('data-level', '0');
        expect(square1).toHaveAttribute('data-level', '1');
        expect(square2).toHaveAttribute('data-level', '2');
    });

    it('renders empty state correctly', () => {
        const { container } = render(<ChartLegend items={[]} />);
        expect(container.firstChild).toBeEmptyDOMElement();
    });
});
