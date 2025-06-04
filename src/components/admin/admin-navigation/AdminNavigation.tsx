import "./admin-navigation.scss"
import React from "react";
import {Link, useLocation} from "react-router-dom";
import {adminRoutes} from "../../../const/routers/routes";

export const AdminNavigation = () => {
    const location = useLocation();

    return (<>
        <div className='admin__logo'>
            LOGO
        </div>
        <div className='admin__pages'>
            <ul>
                <Link to={adminRoutes.teamPageRoute}>
                    <li className={location.pathname === adminRoutes.teamPageRoute ? "admin__pages-selected" : ''}>
                        Команда
                    </li>
                </Link>

                <Link to={adminRoutes.testAdminRoute}>
                    <li className={location.pathname === adminRoutes.testAdminRoute ? "admin__pages-selected" : ''}>
                        Test
                    </li>
                </Link>
            </ul>
        </div>
    </>);
}
