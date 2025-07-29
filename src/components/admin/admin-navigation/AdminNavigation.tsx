import './AdminNavigation.scss';
import React from 'react';
import classNames from 'classnames';
import { NavLink } from 'react-router-dom';
import { adminRoutes } from '../../../const/routes/admin-routes';
import Logo from '../../../assets/icons/logo.svg';
import { COMMON_TEXT_ADMIN } from '../../../const/admin/common';

export const AdminNavigation = () => {
    return (
        <>
            <div className="admin-logo">
                <img src={Logo} alt="Logo" />
            </div>
            <div className="admin-pages">
                <nav>
                    <NavLink
                        to={adminRoutes.TEAM.FULL}
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
                        to={adminRoutes.PROGRAMS.FULL}
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
