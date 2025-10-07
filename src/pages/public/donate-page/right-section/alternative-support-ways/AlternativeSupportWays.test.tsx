import { render, screen } from '@testing-library/react';
import { AlternativeSupportWays } from './AlternativeSupportWays';

jest.mock('../../../../../assets/icons/arrow-up-right.svg', () => ({
    ReactComponent: (props: any) => <svg {...props} data-testid="arrow-up-right-icon" />,
}));

jest.mock('../../../../../assets/icons/forward.svg', () => ({
    ReactComponent: (props: any) => <svg {...props} data-testid="forward-icon" />,
}));

describe('AlternativeSupportWays', () => {
    it('renders all alternative support labels and buttons', () => {
        render(<AlternativeSupportWays />);
        expect(screen.getByText(/Pay Pal/i)).toBeInTheDocument();
        expect(screen.getAllByText(/Monobank/i).length).toBeGreaterThan(0);
        expect(screen.getAllByRole('button')).toHaveLength(4);
        expect(screen.getByTestId('arrow-up-right-icon')).toBeInTheDocument();
        expect(screen.getByTestId('forward-icon')).toBeInTheDocument();
    });
});
