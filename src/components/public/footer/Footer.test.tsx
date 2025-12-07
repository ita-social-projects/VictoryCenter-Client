import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Footer } from './Footer';
import { MemoryRouter } from 'react-router-dom';
import { PUBLIC_ROUTES } from '@const/public/routes';
import footerUk from '@locales/uk/footer.json';

jest.mock('@assets/icons/arrow-up-right.svg', () => ({
    ReactComponent: (props: any) => <svg {...props} data-testid="arrow-icon" />,
}));

jest.mock('@assets/icons/phone.svg', () => ({
    ReactComponent: (props: any) => <svg {...props} data-testid="phone-icon" />,
}));

jest.mock('@assets/icons/mail.svg', () => ({
    ReactComponent: (props: any) => <svg {...props} data-testid="mail-icon" />,
}));

global.open = jest.fn();

// Mock clipboard API
Object.assign(navigator, {
    clipboard: {
        writeText: jest.fn(),
    },
});

function escapeRegExp(string: string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

describe('Footer', () => {
    it('renders email input and clears on subscribe click', () => {
        render(<Footer />, { wrapper: MemoryRouter });
        const input = screen.getByPlaceholderText(footerUk['ENTER_YOUR_EMAIL']) as HTMLInputElement;
        fireEvent.change(input, { target: { value: 'user@example.com' } });
        expect(input.value).toBe('user@example.com');

        const button = screen.getByRole('button', { name: footerUk['SIGN_UP'] });
        fireEvent.click(button);
        expect(input.value).toBe('');
    });

    it('renders the menu section with correct links', () => {
        render(<Footer />, { wrapper: MemoryRouter });
        expect(screen.getByText(footerUk['MENU'])).toBeInTheDocument();

        expect(screen.getByRole('link', { name: footerUk['REPORTING'] })).toHaveAttribute(
            'href',
            PUBLIC_ROUTES.MOCK.FULL,
        );
        expect(screen.getByRole('link', { name: footerUk['STORE'] })).toHaveAttribute('href', PUBLIC_ROUTES.MOCK.FULL);
        expect(screen.getByRole('link', { name: footerUk['HOW_TO_SUPPORT'] })).toHaveAttribute(
            'href',
            PUBLIC_ROUTES.MOCK.FULL,
        );
        expect(screen.getByRole('link', { name: footerUk['STORIES_OF_VICTORIES'] })).toHaveAttribute(
            'href',
            PUBLIC_ROUTES.MOCK.FULL,
        );
    });

    it('renders the about us section with correct links', () => {
        render(<Footer />, { wrapper: MemoryRouter });
        expect(screen.getAllByText(footerUk['ABOUT_US'])[1]).toBeInTheDocument();

        expect(screen.getByRole('link', { name: footerUk['ABOUT_US'] })).toHaveAttribute(
            'href',
            PUBLIC_ROUTES.ABOUT_US.FULL,
        );
        expect(screen.getByRole('link', { name: footerUk['OUR_HISTORY'] })).toHaveAttribute(
            'href',
            PUBLIC_ROUTES.MOCK.FULL,
        );
        expect(screen.getByRole('link', { name: footerUk['OUR_TEAM'] })).toHaveAttribute(
            'href',
            PUBLIC_ROUTES.TEAM.FULL,
        );
        expect(screen.getByRole('link', { name: footerUk['PARTNERS'] })).toHaveAttribute(
            'href',
            PUBLIC_ROUTES.PARTNERS.FULL,
        );
        expect(screen.getByRole('link', { name: footerUk['EVENTS_AND_NEWS'] })).toHaveAttribute(
            'href',
            PUBLIC_ROUTES.MOCK.FULL,
        );
    });

    it('renders the hippotherapy section with correct links', () => {
        render(<Footer />, { wrapper: MemoryRouter });
        expect(screen.getByText(footerUk['HIPPOTHERAPY'])).toBeInTheDocument();

        expect(screen.getByRole('link', { name: footerUk['WHAT_IS_HIPPOTHERAPY'] })).toHaveAttribute(
            'href',
            PUBLIC_ROUTES.MOCK.FULL,
        );
        expect(screen.getByRole('link', { name: footerUk['PROGRAMS'] })).toHaveAttribute(
            'href',
            PUBLIC_ROUTES.PROGRAMS.FULL,
        );
        expect(screen.getByRole('link', { name: footerUk['PROGRAMS_SESSIONS'] })).toHaveAttribute(
            'href',
            PUBLIC_ROUTES.MOCK.FULL,
        );
    });

    it('renders contact buttons with correct text', () => {
        render(<Footer />, { wrapper: MemoryRouter });
        expect(
            screen.getByRole('button', { name: new RegExp(escapeRegExp(footerUk['EMAIL']), 'i') }),
        ).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: new RegExp(escapeRegExp(footerUk['PHONE']), 'i') }),
        ).toBeInTheDocument();

        expect(screen.getByRole('button', { name: /facebook/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /telegram/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /instagram/i })).toBeInTheDocument();
    });

    it('renders icons correctly', () => {
        render(<Footer />, { wrapper: MemoryRouter });
        expect(screen.getByTestId('arrow-icon')).toBeInTheDocument();
        expect(screen.getByTestId('mail-icon')).toBeInTheDocument();
        expect(screen.getByTestId('phone-icon')).toBeInTheDocument();
    });

    it('copies email to clipboard on click', () => {
        render(<Footer />, { wrapper: MemoryRouter });
        const emailButton = screen.getByRole('button', { name: new RegExp(escapeRegExp(footerUk['EMAIL']), 'i') });
        fireEvent.click(emailButton);
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith(footerUk['EMAIL']);
    });

    it('copies phone to clipboard on click', () => {
        render(<Footer />, { wrapper: MemoryRouter });
        const phoneButton = screen.getByRole('button', { name: new RegExp(escapeRegExp(footerUk['PHONE']), 'i') });
        fireEvent.click(phoneButton);
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith(footerUk['PHONE']);
    });

    it('opens Facebook link in a new tab on click', () => {
        render(<Footer />, { wrapper: MemoryRouter });
        const fbButton = screen.getByRole('button', { name: /facebook/i });
        fireEvent.click(fbButton);
        // Check if window.open was called with the correct URL and target
        expect(global.open).toHaveBeenCalledWith(footerUk['FACEBOOK'], '_blank', 'noopener,noreferrer');
    });

    it('opens Telegram link in a new tab on click', () => {
        render(<Footer />, { wrapper: MemoryRouter });
        const tgButton = screen.getByRole('button', { name: /telegram/i });
        fireEvent.click(tgButton);
        // Check if window.open was called with the correct URL and target
        expect(global.open).toHaveBeenCalledWith(footerUk['TELEGRAM'], '_blank', 'noopener,noreferrer');
    });

    it('opens Instagram link in a new tab on click', () => {
        render(<Footer />, { wrapper: MemoryRouter });
        const igButton = screen.getByRole('button', { name: /instagram/i });
        fireEvent.click(igButton);
        // Check if window.open was called with the correct URL and target
        expect(global.open).toHaveBeenCalledWith(footerUk['INSTAGRAM'], '_blank', 'noopener,noreferrer');
    });
});
