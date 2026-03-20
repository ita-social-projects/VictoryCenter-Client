import { FC, SVGProps } from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { IconButton } from './IconButton';

jest.mock('./IconButton.module.scss', () => ({
    'icon-btn': 'icon-btn',
    'icon-default': 'icon-default',
    'icon-filled': 'icon-filled',
}));

const DefaultIcon: FC<SVGProps<SVGSVGElement>> = ({ className, ...props }) => (
    <svg data-testid="default-icon" className={className} {...props} />
);

const FilledIcon: FC<SVGProps<SVGSVGElement>> = ({ className, ...props }) => (
    <svg data-testid="hover-icon" className={className} {...props} />
);

describe('IconButton', () => {
    const renderHoverIconButton = (overrideProps = {}) =>
        render(
            <IconButton
                DefaultIcon={DefaultIcon}
                FilledIcon={FilledIcon}
                aria-label="Hover icon button"
                {...overrideProps}
            />,
        );

    const getButton = () => screen.getByRole('button', { name: /hover icon button/i });
    const getDefaultIcon = () => screen.getByTestId('default-icon');

    it('renders button and default icon', () => {
        renderHoverIconButton();

        expect(getButton()).toBeInTheDocument();
        expect(getDefaultIcon()).toBeInTheDocument();
    });

    it('renders hover icon and applies icon classes when FilledIcon is provided', () => {
        renderHoverIconButton();

        const defaultIcon = getDefaultIcon();
        const filledIcon = screen.getByTestId('hover-icon');

        expect(defaultIcon).toHaveClass('icon-default');
        expect(filledIcon).toHaveClass('icon-filled');
    });

    it('does not render hover icon and does not apply default icon class when FilledIcon is undefined', () => {
        renderHoverIconButton({ FilledIcon: undefined });

        expect(screen.queryByTestId('hover-icon')).not.toBeInTheDocument();
        expect(getDefaultIcon()).not.toHaveClass('icon-default');
    });

    it('does not render hover icon when FilledIcon is null', () => {
        renderHoverIconButton({ FilledIcon: null });

        expect(screen.queryByTestId('hover-icon')).not.toBeInTheDocument();
        expect(getDefaultIcon()).not.toHaveClass('icon-default');
    });

    it('applies button classes and forwards native button props', () => {
        renderHoverIconButton({ className: 'custom-btn', type: 'submit', disabled: true });

        const button = getButton();

        expect(button).toHaveClass('icon-btn');
        expect(button).toHaveClass('custom-btn');
        expect(button).toHaveAttribute('type', 'submit');
        expect(button).toBeDisabled();
    });

    it('calls onClick when clicked', () => {
        const onClick = jest.fn();
        renderHoverIconButton({ onClick });

        fireEvent.click(getButton());

        expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('does not call onClick when disabled', () => {
        const onClick = jest.fn();
        renderHoverIconButton({ onClick, disabled: true });

        fireEvent.click(getButton());

        expect(onClick).not.toHaveBeenCalled();
    });
});
