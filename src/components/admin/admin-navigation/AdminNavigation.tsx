import "./admin-navigation.scss";
import React from "react";
import classNames from "classnames";
import { NavLink } from "react-router-dom";
import { adminRoutes } from "../../../const/routers/routes";
import Logo from "../../../assets/icons/logo.svg"

export const AdminNavigation = () => {
    return (
        <>
            <div className='admin-logo'>
                <img src={Logo} alt="Logo"/>
            </div>
            <div className='admin-pages'>
                <nav>
                    <NavLink
                        to={adminRoutes.teamPageRoute}
                        end
                        className={({ isActive }) =>
                            classNames("admin-page-link", 
                            {
                                "admin-pages-selected": isActive,
                            }
                        )}
                    >
                        Команда
                    </NavLink>

                    <NavLink
                        to={adminRoutes.testAdminRoute}
                        end
                        className={({ isActive }) =>
                            classNames("admin-page-link", 
                            {
                                "admin-pages-selected": isActive,
                            }
                        )}
                    >
                        Test
                    </NavLink>
                </nav>
            </div>
        </>
    );
}

