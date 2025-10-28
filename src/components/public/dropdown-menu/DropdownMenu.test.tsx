import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { DropdownMenu, DropdownLink } from './DropdownMenu';
import { MemoryRouter } from 'react-router-dom';

jest.mock('../../../assets/icons/chevron-up.svg', () => ({
    ReactComponent: () => <span data-testid="arrow-up" />,
}));
jest.mock('../../../assets/icons/chevron-down.svg', () => ({
    ReactComponent: () => <span data-testid="arrow-down" />,
}));

describe('DropdownMenu', () => {
    const links: DropdownLink[] = [
        { text: 'Home', navigateTo: '/home', isDisabled: false },
        { text: 'Profile', navigateTo: '/profile', isDisabled: true },
    ];

    const renderDropdown = () =>
        render(
            <MemoryRouter>
                <DropdownMenu mainText="Menu" links={links} />
            </MemoryRouter>,
        );

    it('renders with mainText and closed state by default', () => {
        renderDropdown();

        expect(screen.getByText('Menu')).toBeInTheDocument();
        expect(screen.getByTestId('arrow-down')).toBeInTheDocument();
        expect(screen.queryByText('Home')).not.toBeInTheDocument();
    });

    it('opens menu on mouse enter', () => {
        renderDropdown();

        const dropdown = screen.getByRole('button', { name: /menu/i }).parentElement!;
        fireEvent.mouseEnter(dropdown);

        expect(screen.getByText('Home')).toBeInTheDocument();
        expect(screen.getByText('Profile')).toBeInTheDocument();
        expect(screen.getByTestId('arrow-up')).toBeInTheDocument();
    });

    it('closes menu on mouse leave', () => {
        renderDropdown();

        const dropdown = screen.getByRole('button', { name: /menu/i }).parentElement!;
        fireEvent.mouseEnter(dropdown);
        expect(screen.getByText('Home')).toBeInTheDocument();

        fireEvent.mouseLeave(dropdown);
        expect(screen.queryByText('Home')).not.toBeInTheDocument();
    });

    it('clicking a link toggles menu closed', () => {
        renderDropdown();

        const dropdown = screen.getByRole('button', { name: /menu/i }).parentElement!;
        fireEvent.mouseEnter(dropdown);

        const link = screen.getByText('Home');
        fireEvent.click(link);

        expect(screen.queryByText('Home')).not.toBeInTheDocument();
    });

    it('renders disabled class for disabled links', () => {
        renderDropdown();

        const dropdown = screen.getByRole('button', { name: /menu/i }).parentElement!;
        fireEvent.mouseEnter(dropdown);

        const disabledLink = screen.getByText('Profile');
        expect(disabledLink).toHaveClass('disable');
    });
});
