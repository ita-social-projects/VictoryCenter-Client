import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ButtonTooltip } from './ButtonTooltip';

jest.mock('../../../assets/icons/info.svg', () => 'info-icon.svg');

describe('ButtonTooltip', () => {
    const defaultProps = {
        children: <div>Tooltip content</div>,
    };

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('renders the component with default props', () => {
        render(<ButtonTooltip {...defaultProps} />);

        const icon = screen.getByRole('img');
        expect(icon).toBeInTheDocument();
        expect(icon).toHaveAttribute('src', 'info-icon.svg');
        expect(screen.queryByText('Tooltip content')).not.toBeInTheDocument();
    });

    it('shows tooltip when clicked', () => {
        render(<ButtonTooltip {...defaultProps} />);

        const button = screen.getByRole('button', { name: 'Show additional information' });
        fireEvent.click(button);

        expect(screen.getByText('Tooltip content')).toBeInTheDocument();
    });

    it('hides tooltip when clicked again', () => {
        render(<ButtonTooltip {...defaultProps} />);

        const button = screen.getByRole('button', { name: 'Show additional information' });

        // Show tooltip
        fireEvent.click(button);
        expect(screen.getByText('Tooltip content')).toBeInTheDocument();

        // Hide tooltip
        fireEvent.click(button);
        expect(screen.queryByText('Tooltip content')).not.toBeInTheDocument();
    });

    it('applies correct position class for bottom position (default)', () => {
        render(<ButtonTooltip {...defaultProps} />);

        fireEvent.click(screen.getByRole('button', { name: 'Show additional information' }));

        const tooltip = screen.getByText('Tooltip content').closest('.button-tooltip-popup');
        expect(tooltip).toHaveClass('button-tooltip-popup--bottom');
    });

    it('applies correct position class for top position', () => {
        render(<ButtonTooltip {...defaultProps} position="top" />);

        fireEvent.click(screen.getByRole('button', { name: 'Show additional information' }));

        const tooltip = screen.getByText('Tooltip content').closest('.button-tooltip-popup');
        expect(tooltip).toHaveClass('button-tooltip-popup--top');
    });

    it('hides tooltip when clicking outside', async () => {
        render(
            <div>
                <ButtonTooltip {...defaultProps} />
                <div data-testid="outside-element">Outside</div>
            </div>,
        );

        fireEvent.click(screen.getByRole('button', { name: 'Show additional information' }));
        expect(screen.getByText('Tooltip content')).toBeInTheDocument();

        fireEvent.mouseDown(screen.getByTestId('outside-element'));

        await waitFor(() => {
            expect(screen.queryByText('Tooltip content')).not.toBeInTheDocument();
        });
    });

    it('shows tooltip when clicking on button', () => {
        render(<ButtonTooltip {...defaultProps} />);

        const button = screen.getByRole('button', { name: 'Show additional information' });

        fireEvent.click(button);

        expect(screen.getByText('Tooltip content')).toBeInTheDocument();
    });

    it('has correct accessibility attributes', () => {
        render(<ButtonTooltip {...defaultProps} />);

        const button = screen.getByRole('button');

        expect(button).toHaveAttribute('aria-haspopup', 'true');
        expect(button).toHaveAttribute('aria-expanded', 'false');
        expect(button).toHaveAttribute('aria-label', 'Show additional information');
        expect(button).not.toHaveAttribute('aria-describedby');

        fireEvent.click(button);

        expect(button).toHaveAttribute('aria-expanded', 'true');
        expect(button).toHaveAttribute('aria-describedby');

        const tooltip = screen.getByRole('tooltip');
        expect(tooltip).toBeInTheDocument();
    });
});
