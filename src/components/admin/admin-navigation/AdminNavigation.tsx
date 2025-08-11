import './AdminNavigation.scss';
import classNames from 'classnames';
import { NavLink } from 'react-router-dom';
import Logo from '../../../assets/icons/logo-with-text.svg';
import { COMMON_TEXT_ADMIN } from '../../../const/admin/common';
import { ADMIN_ROUTES } from '../../../const/admin/routes';

export const AdminNavigation = () => {
    return (
        <>
            <div className="admin-logo">
                <img src={Logo} alt="Logo" />
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
                </nav>
            </div>
        </>
    );
};
