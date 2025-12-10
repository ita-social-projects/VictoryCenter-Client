import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { ADMIN_ROUTES } from '@/const/admin/routes';
import { PageLoader } from '@/components/common/page-loader/PageLoader';
import { useAdminContext } from '@/contexts/admin/admin-context-provider/AdminContextProvider';

export const PrivateRoute = () => {
    const { isLoading, isAuthenticated } = useAdminContext();
    const location = useLocation();

    if (isLoading) {
        return <PageLoader />;
    }

    if (!isAuthenticated) {
        const from = location.state?.from?.pathname ?? ADMIN_ROUTES.LOGIN.FULL;
        return <Navigate to={from} state={{ from: location }} replace />;
    }

    return <Outlet />;
};
