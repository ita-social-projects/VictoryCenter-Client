import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CarouselNavButton } from './CarouselNavButton';

const IconMock = (props: React.SVGProps<SVGSVGElement>) => <svg data-testid="icon" {...props} />;

const setup = (props: Partial<React.ComponentProps<typeof CarouselNavButton>> = {}) => {
    const onClick = props.onClick ?? jest.fn();
    const ariaLabel = props.ariaLabel ?? 'nav';

    render(
        <CarouselNavButton
            side={props.side ?? 'left'}
            variant={props.variant}
            ariaLabel={ariaLabel}
            Icon={props.Icon ?? IconMock}
            onClick={onClick}
        />,
    );

    return { onClick, button: screen.getByRole('button', { name: ariaLabel }) };
};

describe('CarouselNavButton', () => {
    it('renders button by aria-label and renders icon', () => {
        setup({ ariaLabel: 'previous' });

        expect(screen.getByRole('button', { name: 'previous' })).toBeInTheDocument();
        expect(screen.getByTestId('icon')).toBeInTheDocument();
    });

    it('calls onClick', () => {
        const onClick = jest.fn();
        const { button } = setup({ onClick });

        fireEvent.click(button);

        expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('renders with side="right"', () => {
        setup({ side: 'right' });
        expect(screen.getByRole('button', { name: 'nav' })).toBeInTheDocument();
    });

    it('renders with variant="template"', () => {
        setup({ variant: 'template' });
        expect(screen.getByRole('button', { name: 'nav' })).toBeInTheDocument();
    });

    it('renders with variant="editable"', () => {
        setup({ variant: 'editable' });
        expect(screen.getByRole('button', { name: 'nav' })).toBeInTheDocument();
    });
});
