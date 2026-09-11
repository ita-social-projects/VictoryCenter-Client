import { Outlet } from 'react-router-dom';
import { AdminContextProvider } from '@/contexts/admin/admin-context-provider/AdminContextProvider';
import { ToastProvider } from '@/contexts/admin/toast-context-provider/ToastContextProvider';
import { AdminNavigationGuardProvider } from '@/contexts/admin/admin-navigation-guard-provider/AdminNavigationGuardProvider';

export const AdminContextWrapper = () => (
    <AdminContextProvider>
        <ToastProvider>
            <AdminNavigationGuardProvider>
                <Outlet />
            </AdminNavigationGuardProvider>
        </ToastProvider>
    </AdminContextProvider>
);
