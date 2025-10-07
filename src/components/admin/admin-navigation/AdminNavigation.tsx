import { Button } from '../../admin/button/Button';
import { ReactComponent as ExitIcon } from '../../../assets/icons/exit-icon.svg';
import { ReactComponent as Logo } from '../../../assets/icons/logo-with-text.svg';
import { useAdminContext } from '../../../contexts/admin/admin-context-provider/AdminContextProvider';
import './AdminNavigation.scss';
import classNames from 'classnames';
import { NavLink } from 'react-router-dom';
import { COMMON_TEXT_ADMIN } from '../../../const/admin/common';
import { ADMIN_ROUTES } from '../../../const/admin/routes';

export const AdminNavigation = () => {
    const { logout } = useAdminContext();

    return (
        <div className="admin-navigation">
            <div>
                <div className="admin-logo">
                    <Logo />
                </div>
                <div className="admin-pages">
                    <nav>
                        <NavLink
                            to={ADMIN_ROUTES.TEAM.FULL}
                            end
                            className={({ isActive }) =>
                                classNames('admin-page-link', {
                                    'admin-pages-selected': isActive,
                                })
                            }
                        >
                            {COMMON_TEXT_ADMIN.TAB.TEAM_MEMBERS}
                        </NavLink>

                        <NavLink
                            to={ADMIN_ROUTES.PROGRAMS.FULL}
                            end
                            className={({ isActive }) =>
                                classNames('admin-page-link', {
                                    'admin-pages-selected': isActive,
                                })
                            }
                        >
                            {COMMON_TEXT_ADMIN.TAB.PROGRAMS}
                        </NavLink>

                        <NavLink
                            to={ADMIN_ROUTES.FAQ.FULL}
                            end
                            className={({ isActive }) =>
                                classNames('admin-page-link', {
                                    'admin-pages-selected': isActive,
                                })
                            }
                        >
                            {COMMON_TEXT_ADMIN.TAB.FAQ}
                        </NavLink>

                        <NavLink
                            to={ADMIN_ROUTES.WHO_WE_ARE.FULL}
                            end
                            className={({ isActive }) =>
                                classNames('admin-page-link', {
                                    'admin-pages-selected': isActive,
                                })
                            }
                        >
                            {COMMON_TEXT_ADMIN.TAB.WHO_WE_ARE}
                        </NavLink>
                    </nav>
                </div>
            </div>
            <Button className="exit-button" onClick={logout}>
                <ExitIcon className="exit-icon" />
                <span className="exit-button-text">{COMMON_TEXT_ADMIN.BUTTON.EXIT}</span>
            </Button>
        </div>
    );
};
