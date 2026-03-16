import { FC, SVGProps } from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { HoverIconButton } from './HoverIconButton';

jest.mock('./HoverIconButton.module.scss', () => ({
    'icon-btn': 'icon-btn',
    'icon-default': 'icon-default',
    'icon-hover': 'icon-hover',
}));

const DefaultIcon: FC<SVGProps<SVGSVGElement>> = ({ className, ...props }) => (
    <svg data-testid="default-icon" className={className} {...props} />
);

const HoverIcon: FC<SVGProps<SVGSVGElement>> = ({ className, ...props }) => (
    <svg data-testid="hover-icon" className={className} {...props} />
);

describe('HoverIconButton', () => {
    const renderHoverIconButton = (overrideProps = {}) =>
        render(
            <HoverIconButton
                DefaultIcon={DefaultIcon}
                HoverIcon={HoverIcon}
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

    it('renders hover icon and applies icon classes when HoverIcon is provided', () => {
        renderHoverIconButton();

        const defaultIcon = getDefaultIcon();
        const hoverIcon = screen.getByTestId('hover-icon');

        expect(defaultIcon).toHaveClass('icon-default');
        expect(hoverIcon).toHaveClass('icon-hover');
    });

    it('does not render hover icon and does not apply default icon class when HoverIcon is undefined', () => {
        renderHoverIconButton({ HoverIcon: undefined });

        expect(screen.queryByTestId('hover-icon')).not.toBeInTheDocument();
        expect(getDefaultIcon()).not.toHaveClass('icon-default');
    });

    it('does not render hover icon when HoverIcon is null', () => {
        renderHoverIconButton({ HoverIcon: null });

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
