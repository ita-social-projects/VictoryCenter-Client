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

    it('renders all items in reversed order', () => {
        render(<ChartLegend items={mockItems} />);

        const items = screen.getAllByText(/Item/);

        expect(items).toHaveLength(3);
        expect(items[0]).toHaveTextContent('Item 3');
        expect(items[1]).toHaveTextContent('Item 2');
        expect(items[2]).toHaveTextContent('Item 1');
    });

    it('assigns correct background level classes based on reversed index', () => {
        render(<ChartLegend items={mockItems} />);

        const square3 = screen.getByText('Item 3').previousElementSibling;
        expect(square3).toHaveClass('bg-level-0');

        const square2 = screen.getByText('Item 2').previousElementSibling;
        expect(square2).toHaveClass('bg-level-1');

        const square1 = screen.getByText('Item 1').previousElementSibling;
        expect(square1).toHaveClass('bg-level-2');
    });

    it('renders nothing gracefully if items array is empty', () => {
        const { container } = render(<ChartLegend items={[]} />);
        expect(container.firstChild).toBeEmptyDOMElement();
    });
});
