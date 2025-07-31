import './admin-navigation.scss';
import React from 'react';
import { Button } from '../../common/button/Button';
import classNames from 'classnames';
import { NavLink } from 'react-router-dom';
import { adminRoutes } from '../../../const/routers/routes';
import ExitIcon from '../../../assets/icons/exit-icon.svg';
import Logo from '../../../assets/icons/logo.svg';
import { useAdminContext } from '../../../context/admin-context-provider/AdminContextProvider';

export const AdminNavigation = () => {
    const { logout } = useAdminContext();

    return (
        <div className="admin-navigation">
            <div>
                <div className="admin-logo">
                    <img src={Logo} alt="Logo" />
                </div>
                <div className="admin-pages">
                    <nav>
                        <NavLink
                            to={adminRoutes.teamPageRoute}
                            end
                            className={({ isActive }) =>
                                classNames('admin-page-link', {
                                    'admin-pages-selected': isActive,
                                })
                            }
                        >
                            Команда
                        </NavLink>
                    </nav>
                </div>
            </div>
            <Button className="exit-button" onClick={logout}>
                <img src={ExitIcon} alt="exit-icon" />
                <span className="exit-button-text">Вихід</span>
            </Button>
        </div>
    );
};
