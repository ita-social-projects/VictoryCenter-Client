import React from 'react';
import { render, screen } from '@testing-library/react';
import { FundingSourcesRow } from './FundingSourcesRow';

describe('FundingSourcesRow', () => {
    const defaultProps = {
        label: 'Test Source',
        formattedAmount: '1 000 грн',
        ratio: 0.5,
        variant: 'variant1',
    };

    it('renders label and formatted amount correctly', () => {
        render(<FundingSourcesRow {...defaultProps} />);

        expect(screen.getByTitle('Test Source')).toBeInTheDocument();
        expect(screen.getByText('Test Source')).toBeInTheDocument();
        expect(screen.getByText('1 000 грн')).toBeInTheDocument();
    });

    it('applies correct width based on ratio', () => {
        render(<FundingSourcesRow {...defaultProps} ratio={0.75} />);

        const bar = screen.getByText('Test Source').closest('.row')?.querySelector('.bar');
        expect(bar).toHaveStyle({ width: '75%' });
    });

    it('applies variant class correctly', () => {
        render(<FundingSourcesRow {...defaultProps} variant="variant-custom" />);

        const bar = screen.getByText('Test Source').closest('.row')?.querySelector('.bar');
        expect(bar).toHaveClass('variant-custom');
    });

    it('handles zero ratio', () => {
        render(<FundingSourcesRow {...defaultProps} ratio={0} />);

        const bar = screen.getByText('Test Source').closest('.row')?.querySelector('.bar');
        expect(bar).toHaveStyle({ width: '0%' });
    });
});
