import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Footer } from './Footer';
import { MemoryRouter } from 'react-router';
import {
    ENTER_YOUR_EMAIL,
    SIGN_UP,
    MENU,
    STORE,
    STORIES_OF_VICTORIES,
    OUR_HISTORY,
    OUR_TEAM,
    PARTNERS,
    EVENTS_AND_NEWS,
    HIPPOTHERAPY,
    WHAT_IS_HIPPOTHERAPY,
    PROGRAMS_SESSIONS,
    EMAIL,
    PHONE,
    FACEBOOK,
    TELEGRAM,
    INSTAGRAM,
} from '../../../const/public/footer';
import { REPORTING, HOW_TO_SUPPORT, ABOUT_US, PROGRAMS } from '../../../const/public/footer';
import { PUBLIC_ROUTES } from '../../../const/public/routes';

jest.mock('./Footer.scss', () => ({}));

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
        const input = screen.getByPlaceholderText(ENTER_YOUR_EMAIL) as HTMLInputElement;
        fireEvent.change(input, { target: { value: 'user@example.com' } });
        expect(input.value).toBe('user@example.com');

        const button = screen.getByRole('button', { name: SIGN_UP });
        fireEvent.click(button);
        expect(input.value).toBe('');
    });

    it('renders the menu section with correct links', () => {
        render(<Footer />, { wrapper: MemoryRouter });
        expect(screen.getByText(MENU)).toBeInTheDocument();

        expect(screen.getByRole('link', { name: REPORTING })).toHaveAttribute('href', PUBLIC_ROUTES.TEAM.FULL);
        expect(screen.getByRole('link', { name: STORE })).toHaveAttribute('href', PUBLIC_ROUTES.MOCK.FULL);
        expect(screen.getByRole('link', { name: HOW_TO_SUPPORT })).toHaveAttribute('href', PUBLIC_ROUTES.MOCK.FULL);
        expect(screen.getByRole('link', { name: STORIES_OF_VICTORIES })).toHaveAttribute(
            'href',
            PUBLIC_ROUTES.MOCK.FULL,
        );
    });

    it('renders the about us section with correct links', () => {
        render(<Footer />, { wrapper: MemoryRouter });
        expect(screen.getAllByText(ABOUT_US)[1]).toBeInTheDocument();

        expect(screen.getByRole('link', { name: ABOUT_US })).toHaveAttribute('href', PUBLIC_ROUTES.ABOUT_US.FULL);
        expect(screen.getByRole('link', { name: OUR_HISTORY })).toHaveAttribute('href', PUBLIC_ROUTES.MOCK.FULL);
        expect(screen.getByRole('link', { name: OUR_TEAM })).toHaveAttribute('href', PUBLIC_ROUTES.TEAM.FULL);
        expect(screen.getByRole('link', { name: PARTNERS })).toHaveAttribute('href', PUBLIC_ROUTES.MOCK.FULL);
        expect(screen.getByRole('link', { name: EVENTS_AND_NEWS })).toHaveAttribute('href', PUBLIC_ROUTES.MOCK.FULL);
    });

    it('renders the hippotherapy section with correct links', () => {
        render(<Footer />, { wrapper: MemoryRouter });
        expect(screen.getByText(HIPPOTHERAPY)).toBeInTheDocument();

        expect(screen.getByRole('link', { name: WHAT_IS_HIPPOTHERAPY })).toHaveAttribute(
            'href',
            PUBLIC_ROUTES.MOCK.FULL,
        );
        expect(screen.getByRole('link', { name: PROGRAMS })).toHaveAttribute('href', PUBLIC_ROUTES.PROGRAMS.FULL);
        expect(screen.getByRole('link', { name: PROGRAMS_SESSIONS })).toHaveAttribute('href', PUBLIC_ROUTES.MOCK.FULL);
        expect(screen.getByRole('link', { name: PROGRAMS })).toHaveAttribute('href', PUBLIC_ROUTES.TEAM.FULL);
        expect(screen.getByRole('link', { name: PROGRAMS_SESSIONS })).toHaveAttribute('href', PUBLIC_ROUTES.TEAM.FULL);
    });

    it('renders contact buttons with correct text', () => {
        render(<Footer />, { wrapper: MemoryRouter });
        expect(screen.getByRole('button', { name: new RegExp(escapeRegExp(EMAIL), 'i') })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: new RegExp(escapeRegExp(PHONE), 'i') })).toBeInTheDocument();

        expect(screen.getByRole('button', { name: /facebook/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /telegram/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /instagram/i })).toBeInTheDocument();
    });

    it('renders contact button with correct links', () => {
        render(<Footer />, { wrapper: MemoryRouter });
    });

    it('copies email to clipboard on click', () => {
        render(<Footer />, { wrapper: MemoryRouter });
        const emailButton = screen.getByRole('button', { name: new RegExp(escapeRegExp(EMAIL), 'i') });
        fireEvent.click(emailButton);
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith(EMAIL);
    });

    it('copies phone to clipboard on click', () => {
        render(<Footer />, { wrapper: MemoryRouter });
        const phoneButton = screen.getByRole('button', { name: new RegExp(escapeRegExp(PHONE), 'i') });
        fireEvent.click(phoneButton);
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith(PHONE);
    });

    it('opens Facebook link in a new tab on click', () => {
        render(<Footer />, { wrapper: MemoryRouter });
        const fbButton = screen.getByRole('button', { name: /facebook/i });
        fireEvent.click(fbButton);
        // Check if window.open was called with the correct URL and target
        expect(global.open).toHaveBeenCalledWith(FACEBOOK, '_blank', 'noopener,noreferrer');
    });

    it('opens Telegram link in a new tab on click', () => {
        render(<Footer />, { wrapper: MemoryRouter });
        const tgButton = screen.getByRole('button', { name: /telegram/i });
        fireEvent.click(tgButton);
        // Check if window.open was called with the correct URL and target
        expect(global.open).toHaveBeenCalledWith(TELEGRAM, '_blank', 'noopener,noreferrer');
    });

    it('opens Instagram link in a new tab on click', () => {
        render(<Footer />, { wrapper: MemoryRouter });
        const igButton = screen.getByRole('button', { name: /instagram/i });
        fireEvent.click(igButton);
        // Check if window.open was called with the correct URL and target
        expect(global.open).toHaveBeenCalledWith(INSTAGRAM, '_blank', 'noopener,noreferrer');
    });
});
