import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Footer } from './Footer';
import { MemoryRouter } from 'react-router';
import { routes } from '../../const/routers/routes';
import {
    ABOUT_US,
    HIPPOTHERAPY,
    MENU,
    REPORTING,
    STORE,
    HOW_TO_SUPPORT,
    STORIES_OF_VICTORIES,
    OUR_HISTORY,
    OUR_TEAM,
    PARTNERS,
    EVENTS_AND_NEWS,
    PROGRAMS,
    PROGRAMS_SESSIONS,
    VICTORY_STARTS_WITH_YOU,
    STAY_UP_TO_DATE_WITH_THE_NEWS,
    ENTER_YOUR_EMAIL,
    SIGN_UP,
    WHAT_IS_HIPPOTHERAPY,
    EMAIL,
    PHONE,
    FACEBOOK,
    INSTAGRAM,
    TELEGRAM,
} from '../../const/footer/footer';

jest.mock('./Footer.scss', () => ({}));

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
    beforeEach(() => {
        render(<Footer />, { wrapper: MemoryRouter });
    });

    it('renders email input and clears on subscribe click', () => {
        const input = screen.getByPlaceholderText(ENTER_YOUR_EMAIL) as HTMLInputElement;
        fireEvent.change(input, { target: { value: 'user@example.com' } });
        expect(input.value).toBe('user@example.com');

        const button = screen.getByRole('button', { name: SIGN_UP });
        fireEvent.click(button);
        expect(input.value).toBe('');
    });

    it('renders the menu section with correct links', () => {
        // Check menu title
        expect(screen.getByText(MENU)).toBeInTheDocument();

        // Check all links in menu
        expect(screen.getByRole('link', { name: REPORTING })).toHaveAttribute(
            'href',
            routes.userPageRoutes.teamPageRoute,
        );
        expect(screen.getByRole('link', { name: STORE })).toHaveAttribute('href', routes.userPageRoutes.page2Route);
        expect(screen.getByRole('link', { name: HOW_TO_SUPPORT })).toHaveAttribute(
            'href',
            routes.userPageRoutes.page2Route,
        );
        expect(screen.getByRole('link', { name: STORIES_OF_VICTORIES })).toHaveAttribute(
            'href',
            routes.userPageRoutes.page2Route,
        );
    });

    it('renders the about us section with correct links', () => {
        expect(screen.getAllByText(ABOUT_US)[1]).toBeInTheDocument(); // The second ABOUT_US span

        expect(screen.getByRole('link', { name: ABOUT_US })).toHaveAttribute(
            'href',
            routes.userPageRoutes.teamPageRoute,
        );
        expect(screen.getByRole('link', { name: OUR_HISTORY })).toHaveAttribute(
            'href',
            routes.userPageRoutes.page2Route,
        );
        expect(screen.getByRole('link', { name: OUR_TEAM })).toHaveAttribute('href', routes.userPageRoutes.page2Route);
        expect(screen.getByRole('link', { name: PARTNERS })).toHaveAttribute('href', routes.userPageRoutes.page2Route);
        expect(screen.getByRole('link', { name: EVENTS_AND_NEWS })).toHaveAttribute(
            'href',
            routes.userPageRoutes.page2Route,
        );
    });

    it('renders the hippotherapy section with correct links', () => {
        expect(screen.getByText(HIPPOTHERAPY)).toBeInTheDocument();

        expect(screen.getByRole('link', { name: WHAT_IS_HIPPOTHERAPY })).toHaveAttribute(
            'href',
            routes.userPageRoutes.teamPageRoute,
        );
        expect(screen.getByRole('link', { name: PROGRAMS })).toHaveAttribute(
            'href',
            routes.userPageRoutes.teamPageRoute,
        );
        expect(screen.getByRole('link', { name: PROGRAMS_SESSIONS })).toHaveAttribute(
            'href',
            routes.userPageRoutes.teamPageRoute,
        );
    });

    it('renders contact buttons with correct text', () => {
        expect(screen.getByRole('button', { name: new RegExp(escapeRegExp(EMAIL), 'i') })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: new RegExp(escapeRegExp(PHONE), 'i') })).toBeInTheDocument();

        expect(screen.getByRole('button', { name: /facebook/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /telegram/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /instagram/i })).toBeInTheDocument();
    });

    it('copies email to clipboard on click', () => {
        const emailButton = screen.getByRole('button', { name: new RegExp(escapeRegExp(EMAIL), 'i') });
        fireEvent.click(emailButton);
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith(EMAIL);
    });

    it('copies phone to clipboard on click', () => {
        const phoneButton = screen.getByRole('button', { name: new RegExp(escapeRegExp(PHONE), 'i') });
        fireEvent.click(phoneButton);
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith(PHONE);
    });

    it('copies Facebook to clipboard on click', () => {
        const fbButton = screen.getByRole('button', { name: /facebook/i });
        fireEvent.click(fbButton);
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith(FACEBOOK);
    });

    it('copies Telegram to clipboard on click', () => {
        const tgButton = screen.getByRole('button', { name: /telegram/i });
        fireEvent.click(tgButton);
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith(TELEGRAM);
    });

    it('copies Instagram to clipboard on click', () => {
        const igButton = screen.getByRole('button', { name: /instagram/i });
        fireEvent.click(igButton);
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith(INSTAGRAM);
    });
});
