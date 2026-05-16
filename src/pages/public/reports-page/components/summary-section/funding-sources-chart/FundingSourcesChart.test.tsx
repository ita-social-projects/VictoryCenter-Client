import React from 'react';
import { render, screen } from '@testing-library/react';
import { FundingSourcesChart } from './FundingSourcesChart';

const defaultFormatAmount = (amount: number) => `${amount.toLocaleString('uk-UA')} грн`;

describe('FundingSourcesChart', () => {
    const mockItems = [
        { label: 'Source A', amount: 100 },
        { label: 'Source B', amount: 50 },
        { label: 'Source C', amount: 25 },
    ];

    it('renders title', () => {
        render(<FundingSourcesChart items={mockItems} formatAmount={defaultFormatAmount} />);
        expect(screen.getByText('Звідки прийшли кошти')).toBeInTheDocument();
    });

    it('renders all items with correctly formatted amounts', () => {
        const items = [
            { label: 'Grant', amount: 20000 },
            { label: 'Donation', amount: 5000 },
        ];
        render(<FundingSourcesChart items={items} formatAmount={defaultFormatAmount} />);

        expect(screen.getByText('Grant')).toBeInTheDocument();
        expect(screen.getByText(/20\s+000\s+грн/)).toBeInTheDocument();

        expect(screen.getByText('Donation')).toBeInTheDocument();
        expect(screen.getByText(/5\s+000\s+грн/)).toBeInTheDocument();
    });

    it('calculates ratios correctly based on max amount', () => {
        render(<FundingSourcesChart items={mockItems} formatAmount={defaultFormatAmount} />);

        const barA = screen.getByText('Source A').closest('.row')?.querySelector('.bar');
        const barB = screen.getByText('Source B').closest('.row')?.querySelector('.bar');
        const barC = screen.getByText('Source C').closest('.row')?.querySelector('.bar');

        expect(barA).toHaveStyle({ width: '100%' });
        expect(barB).toHaveStyle({ width: '50%' });
        expect(barC).toHaveStyle({ width: '25%' });
    });

    it('assigns variant classes in correct cycle', () => {
        const items = [
            { label: '1', amount: 10 },
            { label: '2', amount: 10 },
            { label: '3', amount: 10 },
            { label: '4', amount: 10 },
            { label: '5', amount: 10 },
        ];
        render(<FundingSourcesChart items={items} formatAmount={defaultFormatAmount} />);

        const getBar = (label: string) => screen.getByText(label).closest('.row')?.querySelector('.bar');

        expect(getBar('1')).toHaveClass('variant0');
        expect(getBar('2')).toHaveClass('variant1');
        expect(getBar('3')).toHaveClass('variant2');
        expect(getBar('4')).toHaveClass('variant3');
        expect(getBar('5')).toHaveClass('variant0');
    });

    it('handles zero amounts gracefully', () => {
        const items = [{ label: 'Zero', amount: 0 }];
        render(<FundingSourcesChart items={items} formatAmount={defaultFormatAmount} />);

        expect(screen.getByText('Zero')).toBeInTheDocument();
        expect(screen.getByText(/0\s+грн/)).toBeInTheDocument();

        const bar = screen.getByText('Zero').closest('.row')?.querySelector('.bar');
        expect(bar).toHaveStyle({ width: '0%' });
    });
});
