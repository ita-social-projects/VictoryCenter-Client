import { render, screen } from '@testing-library/react';
import { AlternativeSupportWays } from './AlternativeSupportWays';

describe('AlternativeSupportWays', () => {
    it('renders all alternative support labels and buttons', () => {
        render(<AlternativeSupportWays />);
        expect(screen.getByText(/Pay Pal/i)).toBeInTheDocument();
        expect(screen.getAllByText(/Monobank/i).length).toBeGreaterThan(0);
        expect(screen.getAllByRole('button')).toHaveLength(2);
        expect(screen.getAllByRole('img')).toHaveLength(4);
    });
});
