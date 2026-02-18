import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { AdminNavigation } from './AdminNavigation';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { ADMIN_ROUTES } from '@/const/admin/routes';
import { useAdminContext } from '@/contexts/admin/admin-context-provider/AdminContextProvider';

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

describe('AdminNavigation', () => {
    const logout = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        mockActivePath = '';
        (useAdminContext as jest.Mock).mockReturnValue({ logout });
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

    it('calls logout when exit button is clicked', () => {
        render(<AdminNavigation />);

        fireEvent.click(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.EXIT }));

        expect(logout).toHaveBeenCalledTimes(1);
    });
});
