import { Outlet } from 'react-router';
import { AdminContextProvider } from '../../../contexts/admin/admin-context-provider/AdminContextProvider';

export const AdminContextWrapper = () => (
    <AdminContextProvider>
        <Outlet />
    </AdminContextProvider>
);
