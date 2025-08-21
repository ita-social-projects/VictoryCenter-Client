import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { DropdownMenu, DropdownLink } from './DropdownMenu';

jest.mock('../../../assets/icons/chevron-up.svg', () => ({
    __esModule: true,
    ReactComponent: (props: any) => <svg {...props} data-testid="arrow-up" />,
}));

jest.mock('../../../assets/icons/chevron-down.svg', () => ({
    __esModule: true,
    ReactComponent: (props: any) => <svg {...props} data-testid="arrow-down" />,
}));

describe('DropdownMenu', () => {
    const links: DropdownLink[] = [
        { text: 'Home', navigateTo: '/home', isDisabled: false },
        { text: 'Profile', navigateTo: '/profile', isDisabled: true },
        { text: 'Settings', navigateTo: '/settings', isDisabled: false },
    ];

    const setup = () =>
        render(
            <MemoryRouter>
                <DropdownMenu mainText="Menu" links={links} />
            </MemoryRouter>,
        );

    it('renders main button with text and closed state initially', () => {
        setup();
        expect(screen.getByRole('button', { name: /menu/i })).toBeInTheDocument();
        expect(screen.queryByText('Home')).not.toBeInTheDocument();
        expect(screen.getByTestId('arrow-up')).toBeInTheDocument();
    });

    it('opens dropdown when button is clicked', () => {
        setup();
        fireEvent.click(screen.getByRole('button', { name: /menu/i }));

        expect(screen.getByText('Home')).toBeInTheDocument();
        expect(screen.getByText('Profile')).toBeInTheDocument();
        expect(screen.getByText('Settings')).toBeInTheDocument();

        expect(screen.getByTestId('arrow-down')).toBeInTheDocument();
    });

    it('applies disabled class to disabled links', () => {
        setup();
        fireEvent.click(screen.getByRole('button', { name: /menu/i }));

        expect(screen.getByText('Profile')).toHaveClass('disable');
    });

    it('closes dropdown when a link is clicked', () => {
        setup();
        fireEvent.click(screen.getByRole('button', { name: /menu/i }));
        fireEvent.click(screen.getByText('Home'));
        expect(screen.queryByText('Home')).not.toBeInTheDocument();
    });

    it('links have correct navigation paths', () => {
        setup();
        fireEvent.click(screen.getByRole('button', { name: /menu/i }));

        expect(screen.getByText('Home')).toHaveAttribute('href', '/home');
        expect(screen.getByText('Profile')).toHaveAttribute('href', '/profile');
    });

    it('toggles open/close when button clicked twice', () => {
        setup();
        const button = screen.getByRole('button', { name: /menu/i });

        fireEvent.click(button);
        expect(screen.getByText('Home')).toBeInTheDocument();

        fireEvent.click(button);
        expect(screen.queryByText('Home')).not.toBeInTheDocument();
    });
});
