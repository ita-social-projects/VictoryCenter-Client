import { Button } from '@/components/admin/button/Button';
import { ReactComponent as ExitIcon } from '@/assets/icons/exit-icon.svg';
import { ReactComponent as Logo } from '@/assets/icons/logo-with-text.svg';
import { useAdminContext } from '@/contexts/admin/admin-context-provider/AdminContextProvider';
import { useAdminNavigationGuard } from '@/contexts/admin/admin-navigation-guard-provider/AdminNavigationGuardProvider';
import { useToast } from '@/contexts/admin/toast-context-provider/ToastContextProvider';
import classNames from 'classnames';
import { NavLink } from 'react-router-dom';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { ADMIN_ROUTES } from '@/const/admin/routes';
import { ToastType } from '@/types/admin/toast';
import './AdminNavigation.scss';

export const AdminNavigation = () => {
    const { logout } = useAdminContext();
    const { isBlocked, blockMessage } = useAdminNavigationGuard();
    const { addToast } = useToast();

    const navItems = [
        {
            link: ADMIN_ROUTES.MAIN.FULL,
            text: COMMON_TEXT_ADMIN.TAB.MAIN,
        },
        {
            link: ADMIN_ROUTES.PROFILE_COMPANY.FULL,
            text: COMMON_TEXT_ADMIN.TAB.PROFILE_COMPANY,
        },
        {
            link: ADMIN_ROUTES.REPORTS.FULL,
            text: COMMON_TEXT_ADMIN.TAB.REPORTS,
        },
        {
            link: ADMIN_ROUTES.TEAM.FULL,
            text: COMMON_TEXT_ADMIN.TAB.TEAM_MEMBERS,
        },
        {
            link: ADMIN_ROUTES.PROGRAMS.FULL,
            text: COMMON_TEXT_ADMIN.TAB.PROGRAMS,
        },
        {
            link: ADMIN_ROUTES.DONATE.FULL,
            text: COMMON_TEXT_ADMIN.TAB.DONATE,
        },
        {
            link: ADMIN_ROUTES.HISTORY.FULL,
            text: COMMON_TEXT_ADMIN.TAB.HISTORY,
        },
        {
            link: ADMIN_ROUTES.FAQ.FULL,
            text: COMMON_TEXT_ADMIN.TAB.FAQ,
        },
        {
            link: ADMIN_ROUTES.WHO_WE_ARE.FULL,
            text: COMMON_TEXT_ADMIN.TAB.WHO_WE_ARE,
        },
        {
            link: ADMIN_ROUTES.EVENTS.FULL,
            text: COMMON_TEXT_ADMIN.TAB.EVENTS,
        },
        {
            link: ADMIN_ROUTES.PARTNERS.FULL,
            text: COMMON_TEXT_ADMIN.TAB.PARTNERS,
        },
        {
            link: ADMIN_ROUTES.HIPPOTHERAPY.FULL,
            text: COMMON_TEXT_ADMIN.TAB.HIPPOTHERAPY,
        },
        {
            link: ADMIN_ROUTES.FEEDBACK.FULL,
            text: COMMON_TEXT_ADMIN.TAB.FEEDBACK,
        },
    ];

    const handleNavLinkClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        if (isBlocked) {
            e.preventDefault();
            addToast(blockMessage ?? COMMON_TEXT_ADMIN.MESSAGE.NAVIGATION_BLOCKED, ToastType.Error);
        }
    };

    const handleLogoutClick = () => {
        if (isBlocked) {
            addToast(blockMessage ?? COMMON_TEXT_ADMIN.MESSAGE.NAVIGATION_BLOCKED, ToastType.Error);
            return;
        }
        logout();
    };

    return (
        <div className="admin-navigation">
            <div>
                <div className="admin-logo">
                    <Logo />
                </div>
                <div className="admin-pages">
                    <nav>
                        {navItems.map((nav) => (
                            <NavLink
                                key={nav.link}
                                to={nav.link}
                                end
                                onClick={handleNavLinkClick}
                                className={({ isActive }) =>
                                    classNames('admin-page-link', {
                                        'admin-pages-selected': isActive,
                                    })
                                }
                            >
                                {nav.text}
                            </NavLink>
                        ))}
                    </nav>
                </div>
            </div>
            <Button className="exit-button" onClick={handleLogoutClick}>
                <ExitIcon className="exit-icon" />
                <span className="exit-button-text">{COMMON_TEXT_ADMIN.BUTTON.EXIT}</span>
            </Button>
        </div>
    );
};
