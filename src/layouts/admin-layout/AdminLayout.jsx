import {Outlet} from 'react-router-dom';
import {AdminContextProvider} from "../../context/admin-context-provider/AdminContextProvider";
import "./admin-layout.scss"
import {AdminNavigation} from "../../components/admin/admin-navigation/AdminNavigation";

export const AdminLayout = () => (
    <AdminContextProvider>
        <div className='admin'>
            <div className="admin__navigation">
                <AdminNavigation/>
            </div>
            <div className="admin__page">
                <Outlet/>
            </div>
        </div>
    </AdminContextProvider>
);
