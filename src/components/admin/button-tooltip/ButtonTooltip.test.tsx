import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ButtonTooltip, ButtonTooltipProps } from './ButtonTooltip';
import { TooltipProps } from '../tooltip/Tooltip';

jest.mock('@/assets/icons/info.svg', () => ({
    ReactComponent: ({ className, ...props }: any) => (
        <svg className={className} data-testid="info-icon" {...props}>
            <title>Info Icon</title>
        </svg>
    ),
}));

jest.mock('../tooltip/Tooltip', () => {
    const React = require('react');
    return {
        Tooltip: React.forwardRef(
            ({ id, children, position = 'bottom', allowClickThrough }: Partial<TooltipProps>, ref: any) => (
                <div
                    ref={ref}
                    data-testid="tooltip-popup"
                    id={id}
                    role="tooltip"
                    className={`button-tooltip-popup button-tooltip-popup--${position}`}
                    onMouseDown={(e) => {
                        if (allowClickThrough) e.stopPropagation();
                    }}
                >
                    {children}
                </div>
            ),
        ),
    };
});

describe('ButtonTooltip', () => {
    const defaultProps: ButtonTooltipProps = {
        children: <div>Tooltip content</div>,
    };

    const renderButtonTooltip = (overrideProps: Partial<ButtonTooltipProps> = {}) =>
        render(<ButtonTooltip {...defaultProps} {...overrideProps} />);

    const getButton = () => screen.getByRole('button', { name: /Show additional information/i });
    const getIcon = () => screen.getByTestId('info-icon');
    const getTooltip = () => screen.queryByTestId('tooltip-popup');

    const clickButton = () => fireEvent.click(getButton());
    const clickTooltip = () => fireEvent.mouseDown(getTooltip()!);
    const clickOutside = () => fireEvent.mouseDown(document.body);

    const hoverButton = () => fireEvent.mouseEnter(getButton());
    const unhoverButton = () => fireEvent.mouseLeave(getButton());
    const focusButton = () => fireEvent.focus(getButton());
    const blurButton = () => fireEvent.blur(getButton());

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('renders with default props and hides tooltip by default', () => {
        renderButtonTooltip();

        expect(getIcon()).toBeInTheDocument();
        expect(getIcon()).toHaveClass('button-tooltip-icon');
        expect(getTooltip()).not.toBeInTheDocument();
    });

    it('shows tooltip on mouse enter', () => {
        renderButtonTooltip();
        expect(getTooltip()).not.toBeInTheDocument();

        hoverButton();
        expect(getTooltip()).toBeInTheDocument();
    });

    it('hides tooltip on mouse leave', () => {
        renderButtonTooltip();
        hoverButton();
        expect(getTooltip()).toBeInTheDocument();

        unhoverButton();
        expect(getTooltip()).not.toBeInTheDocument();
    });

    it('shows tooltip on focus', () => {
        renderButtonTooltip();
        expect(getTooltip()).not.toBeInTheDocument();

        focusButton();
        expect(getTooltip()).toBeInTheDocument();
    });

    it('hides tooltip on blur', () => {
        renderButtonTooltip();
        focusButton();
        expect(getTooltip()).toBeInTheDocument();

        blurButton();
        expect(getTooltip()).not.toBeInTheDocument();
    });

    it('shows tooltip when clicked', () => {
        renderButtonTooltip();
        clickButton();

        expect(screen.getByText('Tooltip content')).toBeInTheDocument();
        expect(getButton()).toHaveAttribute('aria-expanded', 'true');
        expect(getButton()).toHaveAttribute('aria-describedby');
    });

    it('keeps tooltip visible when clicked again', () => {
        renderButtonTooltip();
        clickButton();
        expect(getTooltip()).toBeInTheDocument();

        clickButton();
        expect(getTooltip()).toBeInTheDocument();
    });

    it('hides tooltip when clicking outside', async () => {
        renderButtonTooltip();
        clickButton();
        expect(getTooltip()).toBeInTheDocument();

        clickOutside();
        await waitFor(() => expect(getTooltip()).not.toBeInTheDocument());
    });

    it('applies correct position class (default bottom)', () => {
        renderButtonTooltip();
        clickButton();

        expect(getTooltip()).toHaveClass('button-tooltip-popup--bottom');
    });

    it('applies correct position class when position="top"', () => {
        renderButtonTooltip({ position: 'top' });
        clickButton();

        expect(getTooltip()).toHaveClass('button-tooltip-popup--top');
    });

    it('has correct accessibility attributes', () => {
        renderButtonTooltip();

        const button = getButton();
        expect(button).toHaveAttribute('aria-haspopup', 'true');
        expect(button).toHaveAttribute('aria-expanded', 'false');
        expect(button).toHaveAttribute('aria-label');
        expect(button).not.toHaveAttribute('aria-describedby');

        clickButton();

        expect(button).toHaveAttribute('aria-expanded', 'true');
        expect(button).toHaveAttribute('aria-describedby');
    });

    it('does not hide tooltip when clicking on tooltip itself', async () => {
        renderButtonTooltip();

        clickButton();
        expect(getTooltip()).toBeInTheDocument();

        // Click on the tooltip itself
        clickTooltip();

        // Should still be visible
        expect(getTooltip()).toBeInTheDocument();
    });

    it('removes event listeners on unmount', () => {
        const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener');

        const { unmount } = renderButtonTooltip();
        clickButton(); // Show tooltip to add event listener

        unmount();

        expect(removeEventListenerSpy).toHaveBeenCalledWith('mousedown', expect.any(Function));

        removeEventListenerSpy.mockRestore();
    });
});
