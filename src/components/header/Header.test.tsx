import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Header } from './Header';
import { MemoryRouter } from 'react-router';
import { routes } from '../../const/routers/routes';
import { ABOUT_US, PROGRAMS, REPORTING, HOW_TO_SUPPORT, CONTACT_US, DONATE } from '../../const/header/header';

jest.mock('./Header.scss', () => ({}));
jest.mock('../../assets/images/header/VictoryCenterLogo.svg', () => ({
    ReactComponent: () => <div data-testid="logo" />,
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

        expect(screen.getByRole('link', { name: ABOUT_US })).toHaveAttribute(
            'href',
            routes.userPageRoutes.teamPageRoute,
        );
        expect(screen.getByRole('link', { name: PROGRAMS })).toHaveAttribute('href', routes.userPageRoutes.page2Route);
        expect(screen.getByRole('link', { name: REPORTING })).toHaveAttribute('href', routes.userPageRoutes.page2Route);
        expect(screen.getByRole('link', { name: HOW_TO_SUPPORT })).toHaveAttribute(
            'href',
            routes.userPageRoutes.page2Route,
        );
    });

    it('renders Contact Us and Donate buttons', () => {
        render(<Header />, { wrapper: MemoryRouter });

        expect(screen.getByRole('button', { name: CONTACT_US })).toBeInTheDocument();
        const donateLink = screen.getByRole('link', { name: DONATE });
        expect(donateLink).toBeInTheDocument();
        expect(donateLink).toHaveAttribute('href', routes.donatePageRoute);
    });

    it('check if Contact Us button is clicked', () => {
        render(<Header />, { wrapper: MemoryRouter });

        const contactUsBtn = screen.getByRole('button', { name: CONTACT_US });
        fireEvent.click(contactUsBtn);

        // eslint-disable-next-line no-console
        expect(console.log).toHaveBeenCalledWith('CONTACT USED!');
    });
});
