import React from 'react';
import { render, screen } from '@testing-library/react';
import { ProgramsAllocationChart } from './ProgramsAllocationChart';

describe('ProgramsAllocationChart', () => {
    const defaultItems = [
        { label: 'Program A', amount: 1000 },
        { label: 'Program B', amount: 3000 },
    ];

    it('renders title', () => {
        render(<ProgramsAllocationChart items={defaultItems} />);
        expect(screen.getByText('Розподіл коштів по програмах')).toBeInTheDocument();
    });

    it('renders labels and formatted amounts for 2 items', () => {
        render(<ProgramsAllocationChart items={defaultItems} />);

        expect(screen.getByText('Program A')).toBeInTheDocument();
        expect(screen.getByText(/1\s+000/)).toBeInTheDocument();
        expect(screen.getByText('Program B')).toBeInTheDocument();
        expect(screen.getByText(/3\s+000/)).toBeInTheDocument();
        expect(screen.getAllByText('грн')).toHaveLength(2);
    });

    it('renders correctly for 3 items structure', () => {
        const items = [
            { label: 'A', amount: 100 },
            { label: 'B', amount: 200 },
            { label: 'C', amount: 300 },
        ];
        render(<ProgramsAllocationChart items={items} />);

        expect(screen.getByText('A')).toBeInTheDocument();
        expect(screen.getByText('B')).toBeInTheDocument();
        expect(screen.getByText('C')).toBeInTheDocument();
    });

    it('handles locale formatting with non-breaking spaces', () => {
        const items = [
            { label: 'Large', amount: 1234567 },
            { label: 'Small', amount: 1 },
        ];
        render(<ProgramsAllocationChart items={items} />);

        expect(screen.getByText(/1\s+234\s+567/)).toBeInTheDocument();
    });

    it('renders nothing in chart area if items count is invalid', () => {
        render(<ProgramsAllocationChart items={[{ label: 'Solo', amount: 100 }]} />);

        expect(screen.getByText('Розподіл коштів по програмах')).toBeInTheDocument();
        expect(screen.queryByText('Solo')).not.toBeInTheDocument();
    });
});
