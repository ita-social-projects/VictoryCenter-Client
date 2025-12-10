import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { Header } from './Header';
import { MemoryRouter } from 'react-router-dom';
import { PUBLIC_ROUTES } from '@/const/public/routes';
import headerUk from '@/locales/uk/header.json';

jest.mock('./Header.scss', () => ({}));

jest.mock('@/assets/icons/logo-with-text.svg', () => ({
    ReactComponent: () => <svg data-testid="logo" />,
}));
jest.mock('@/assets/icons/chevron-up.svg', () => ({
    ReactComponent: () => <svg data-testid="chevron-up" />,
}));
jest.mock('@/assets/icons/chevron-down.svg', () => ({
    ReactComponent: () => <svg data-testid="chevron-down" />,
}));
jest.mock('@/assets/icons/menu.svg', () => ({
    ReactComponent: () => <svg data-testid="menu" />,
}));
jest.mock('@/assets/icons/cross.svg', () => ({
    ReactComponent: () => <svg data-testid="close" />,
}));
jest.mock('@/assets/icons/burger.svg', () => ({
    ReactComponent: () => <div data-testid="burger-icon" />,
}));
jest.mock('@/assets/icons/cross.svg', () => ({
    ReactComponent: () => <div data-testid="cross" />,
}));

describe('Header', () => {
    beforeEach(() => {
        jest.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('renders the logo inside a link to "/"', () => {
        render(<Header />, { wrapper: MemoryRouter });
        expect(screen.getByRole('link', { name: '' })).toHaveAttribute('href', '/');
        expect(screen.getByTestId('logo')).toBeInTheDocument();
    });

    it('renders nav links with correct text and href', () => {
        render(<Header />, { wrapper: MemoryRouter });

        expect(screen.getByRole('link', { name: headerUk['PROGRAMS'] })).toHaveAttribute(
            'href',
            PUBLIC_ROUTES.PROGRAMS.FULL,
        );
        expect(screen.getByRole('link', { name: headerUk['REPORTING'] })).toHaveAttribute(
            'href',
            PUBLIC_ROUTES.REPORTS.FULL,
        );
        expect(screen.getByRole('link', { name: headerUk['HOW_TO_SUPPORT'] })).toHaveAttribute(
            'href',
            PUBLIC_ROUTES.MOCK.FULL,
        );
    });

    it('renders Contact Us and Donate buttons', () => {
        render(<Header />, { wrapper: MemoryRouter });

        expect(screen.getByRole('button', { name: headerUk['CONTACT_US'] })).toBeInTheDocument();
        const donateLink = screen.getByRole('link', { name: headerUk['DONATE'] });
        expect(donateLink).toBeInTheDocument();
        expect(donateLink).toHaveAttribute('href', PUBLIC_ROUTES.DONATE.FULL);
    });

    it('check if Contact Us button is clicked', () => {
        render(<Header />, { wrapper: MemoryRouter });

        const contactUsBtn = screen.getByRole('button', { name: headerUk['CONTACT_US'] });
        fireEvent.click(contactUsBtn);

        // eslint-disable-next-line no-console
        expect(console.log).toHaveBeenCalledWith('CONTACT USED!');
    });

    it('renders burger menu correctly', () => {
        render(<Header />, { wrapper: MemoryRouter });

        const burgerMenuButton = screen.getByTestId('burger-icon').closest('button');

        expect(document.querySelector('.mobile-menu')).not.toBeInTheDocument();
        fireEvent.click(burgerMenuButton!);
        expect(document.querySelector('.mobile-menu')).toBeInTheDocument();
    });
});
