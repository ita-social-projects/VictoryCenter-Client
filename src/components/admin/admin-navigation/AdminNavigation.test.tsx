import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent, createEvent } from '@testing-library/react';
import { AdminNavigation } from './AdminNavigation';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { ADMIN_ROUTES } from '@/const/admin/routes';
import { useAdminContext } from '@/contexts/admin/admin-context-provider/AdminContextProvider';
import { useAdminNavigationGuard } from '@/contexts/admin/admin-navigation-guard-provider/AdminNavigationGuardProvider';
import { useToast } from '@/contexts/admin/toast-context-provider/ToastContextProvider';
import { ToastType } from '@/types/admin/toast';

let mockActivePath = '';

jest.mock('react-router-dom', () => {
    const actual = jest.requireActual('react-router-dom');
    return {
        ...actual,
        NavLink: ({ to, className, children, ...rest }: any) => {
            const isActive = mockActivePath === to;
            const resolvedClassName = typeof className === 'function' ? className({ isActive }) : className;

            return (
                <a href={to} className={resolvedClassName} aria-current={isActive ? 'page' : undefined} {...rest}>
                    {children}
                </a>
            );
        },
    };
});

jest.mock('./AdminNavigation.scss', () => ({}));

jest.mock('@/assets/icons/exit-icon.svg', () => ({
    ReactComponent: (props: any) => <svg data-testid="exit-icon" {...props} />,
}));

jest.mock('@/assets/icons/logo-with-text.svg', () => ({
    ReactComponent: (props: any) => <svg data-testid="logo" {...props} />,
}));

jest.mock('@/components/admin/button/Button', () => ({
    Button: ({ children, onClick, className, disabled }: any) => (
        <button type="button" onClick={onClick} className={className} disabled={disabled}>
            {children}
        </button>
    ),
}));

jest.mock('@/contexts/admin/admin-context-provider/AdminContextProvider', () => ({
    useAdminContext: jest.fn(),
}));

jest.mock('@/contexts/admin/admin-navigation-guard-provider/AdminNavigationGuardProvider', () => ({
    useAdminNavigationGuard: jest.fn(),
}));

jest.mock('@/contexts/admin/toast-context-provider/ToastContextProvider', () => ({
    useToast: jest.fn(),
}));

describe('AdminNavigation', () => {
    const logout = jest.fn();
    const addToast = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        mockActivePath = '';
        (useAdminContext as jest.Mock).mockReturnValue({ logout });
        (useAdminNavigationGuard as jest.Mock).mockReturnValue({ isBlocked: false, blockMessage: null });
        (useToast as jest.Mock).mockReturnValue({ addToast });
    });

    it('renders logo, navigation links and exit button', () => {
        render(<AdminNavigation />);

        expect(screen.getByTestId('logo')).toBeInTheDocument();

        expect(screen.getByRole('link', { name: COMMON_TEXT_ADMIN.TAB.TEAM_MEMBERS })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: COMMON_TEXT_ADMIN.TAB.PROGRAMS })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: COMMON_TEXT_ADMIN.TAB.DONATE })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: COMMON_TEXT_ADMIN.TAB.FAQ })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: COMMON_TEXT_ADMIN.TAB.WHO_WE_ARE })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: COMMON_TEXT_ADMIN.TAB.PARTNERS })).toBeInTheDocument();

        expect(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.EXIT })).toBeInTheDocument();
        expect(screen.getByTestId('exit-icon')).toBeInTheDocument();
    });

    it('sets active class only for the current route link', () => {
        mockActivePath = ADMIN_ROUTES.PROGRAMS.FULL;

        render(<AdminNavigation />);

        const programs = screen.getByRole('link', { name: COMMON_TEXT_ADMIN.TAB.PROGRAMS });
        const team = screen.getByRole('link', { name: COMMON_TEXT_ADMIN.TAB.TEAM_MEMBERS });

        expect(programs).toHaveClass('admin-page-link');
        expect(programs).toHaveClass('admin-pages-selected');
        expect(programs).toHaveAttribute('aria-current', 'page');

        expect(team).toHaveClass('admin-page-link');
        expect(team).not.toHaveClass('admin-pages-selected');
        expect(team).not.toHaveAttribute('aria-current');
    });

    it('renders correct href for each link', () => {
        render(<AdminNavigation />);

        expect(screen.getByRole('link', { name: COMMON_TEXT_ADMIN.TAB.TEAM_MEMBERS })).toHaveAttribute(
            'href',
            ADMIN_ROUTES.TEAM.FULL,
        );
        expect(screen.getByRole('link', { name: COMMON_TEXT_ADMIN.TAB.PROGRAMS })).toHaveAttribute(
            'href',
            ADMIN_ROUTES.PROGRAMS.FULL,
        );
        expect(screen.getByRole('link', { name: COMMON_TEXT_ADMIN.TAB.DONATE })).toHaveAttribute(
            'href',
            ADMIN_ROUTES.DONATE.FULL,
        );
        expect(screen.getByRole('link', { name: COMMON_TEXT_ADMIN.TAB.FAQ })).toHaveAttribute(
            'href',
            ADMIN_ROUTES.FAQ.FULL,
        );
        expect(screen.getByRole('link', { name: COMMON_TEXT_ADMIN.TAB.WHO_WE_ARE })).toHaveAttribute(
            'href',
            ADMIN_ROUTES.WHO_WE_ARE.FULL,
        );
        expect(screen.getByRole('link', { name: COMMON_TEXT_ADMIN.TAB.PARTNERS })).toHaveAttribute(
            'href',
            ADMIN_ROUTES.PARTNERS.FULL,
        );
    });

    it('calls logout when exit button is clicked and navigation is not blocked', () => {
        render(<AdminNavigation />);

        fireEvent.click(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.EXIT }));

        expect(logout).toHaveBeenCalledTimes(1);
        expect(addToast).not.toHaveBeenCalled();
    });

    describe('navigation guard', () => {
        it('does not prevent the default click or show a toast when isBlocked is false', () => {
            render(<AdminNavigation />);

            const link = screen.getByRole('link', { name: COMMON_TEXT_ADMIN.TAB.PROGRAMS });
            const clickEvent = createEvent.click(link);
            fireEvent(link, clickEvent);

            expect(clickEvent.defaultPrevented).toBe(false);
            expect(addToast).not.toHaveBeenCalled();
        });

        it('prevents the default click and shows a toast with blockMessage when isBlocked is true', () => {
            (useAdminNavigationGuard as jest.Mock).mockReturnValue({
                isBlocked: true,
                blockMessage: COMMON_TEXT_ADMIN.MESSAGE.NAVIGATION_BLOCKED,
            });

            render(<AdminNavigation />);

            const link = screen.getByRole('link', { name: COMMON_TEXT_ADMIN.TAB.PROGRAMS });
            const clickEvent = createEvent.click(link);
            fireEvent(link, clickEvent);

            expect(clickEvent.defaultPrevented).toBe(true);
            expect(addToast).toHaveBeenCalledTimes(1);
            expect(addToast).toHaveBeenCalledWith(COMMON_TEXT_ADMIN.MESSAGE.NAVIGATION_BLOCKED, ToastType.Error);
        });

        it('falls back to the default NAVIGATION_BLOCKED message when blockMessage is null', () => {
            (useAdminNavigationGuard as jest.Mock).mockReturnValue({ isBlocked: true, blockMessage: null });

            render(<AdminNavigation />);

            const link = screen.getByRole('link', { name: COMMON_TEXT_ADMIN.TAB.PROGRAMS });
            fireEvent.click(link);

            expect(addToast).toHaveBeenCalledWith(COMMON_TEXT_ADMIN.MESSAGE.NAVIGATION_BLOCKED, ToastType.Error);
        });

        it('applies the block to every nav link, not just one', () => {
            (useAdminNavigationGuard as jest.Mock).mockReturnValue({ isBlocked: true, blockMessage: 'blocked' });

            render(<AdminNavigation />);

            const team = screen.getByRole('link', { name: COMMON_TEXT_ADMIN.TAB.TEAM_MEMBERS });
            const donate = screen.getByRole('link', { name: COMMON_TEXT_ADMIN.TAB.DONATE });

            const teamClick = createEvent.click(team);
            fireEvent(team, teamClick);
            const donateClick = createEvent.click(donate);
            fireEvent(donate, donateClick);

            expect(teamClick.defaultPrevented).toBe(true);
            expect(donateClick.defaultPrevented).toBe(true);
            expect(addToast).toHaveBeenCalledTimes(2);
        });

        it('blocks logout and shows a toast instead of calling logout when isBlocked is true', () => {
            (useAdminNavigationGuard as jest.Mock).mockReturnValue({
                isBlocked: true,
                blockMessage: COMMON_TEXT_ADMIN.MESSAGE.NAVIGATION_BLOCKED,
            });

            render(<AdminNavigation />);

            fireEvent.click(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.EXIT }));

            expect(logout).not.toHaveBeenCalled();
            expect(addToast).toHaveBeenCalledTimes(1);
            expect(addToast).toHaveBeenCalledWith(COMMON_TEXT_ADMIN.MESSAGE.NAVIGATION_BLOCKED, ToastType.Error);
        });
    });
});
