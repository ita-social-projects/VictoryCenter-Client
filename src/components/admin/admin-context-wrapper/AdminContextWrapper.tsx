import { Outlet } from 'react-router';
import { AdminContextProvider } from '../../../contexts/admin/admin-context-provider/AdminContextProvider';
import { ToastProvider } from '../../../contexts/admin/toast-context-provider/ToastContextProvider';

export const AdminContextWrapper = () => (
    <AdminContextProvider>
        <ToastProvider>
            <Outlet />
        </ToastProvider>
    </AdminContextProvider>
);
