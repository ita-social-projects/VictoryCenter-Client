import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { Header } from './Header';
import { MemoryRouter } from 'react-router';
import { publicRoutes } from '../../../const/routes/public-routes';
import { CONTACT_US, DONATE, HOW_TO_SUPPORT, PROGRAMS, REPORTING } from '../../../const/public/header';

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

        expect(screen.getByRole('link', { name: publicRoutes.ABOUT_US.FULL })).toHaveAttribute(
            'href',
            publicRoutes.ABOUT_US.FULL,
        );
        expect(screen.getByRole('link', { name: PROGRAMS })).toHaveAttribute('href', publicRoutes.PROGRAMS.FULL);
        expect(screen.getByRole('link', { name: REPORTING })).toHaveAttribute('href', publicRoutes.MOCK.FULL);
        expect(screen.getByRole('link', { name: HOW_TO_SUPPORT })).toHaveAttribute('href', publicRoutes.MOCK.FULL);
    });

    it('renders Contact Us and Donate buttons', () => {
        render(<Header />, { wrapper: MemoryRouter });

        expect(screen.getByRole('button', { name: CONTACT_US })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: DONATE })).toBeInTheDocument();
    });

    it('check if Contact Us button is clicked', () => {
        render(<Header />, { wrapper: MemoryRouter });

        const contactUsBtn = screen.getByRole('button', { name: CONTACT_US });
        fireEvent.click(contactUsBtn);

        expect(console.log).toHaveBeenCalledWith('CONTACT USED!');
    });

    it('check if Donate button is clicked', () => {
        render(<Header />, { wrapper: MemoryRouter });

        const donateBtn = screen.getByRole('button', { name: DONATE });
        fireEvent.click(donateBtn);

        expect(console.log).toHaveBeenCalledWith('DONATE!');
    });
});
