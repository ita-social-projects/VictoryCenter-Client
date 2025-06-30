import { Outlet } from "react-router-dom";
import { AdminContextProvider } from "../../../context/admin-context-provider/AdminContextProvider";

export const AdminContextWrapper = () => (
    <AdminContextProvider>
        <Outlet />
    </AdminContextProvider>
);
