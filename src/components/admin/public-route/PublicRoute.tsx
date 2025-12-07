import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { PageLoader } from '@components/common/page-loader/PageLoader';
import { ADMIN_ROUTES } from '@const/admin/routes';
import { useAdminContext } from '@contexts/admin/admin-context-provider/AdminContextProvider';

export const PublicRoute = () => {
    const { isLoading, isAuthenticated } = useAdminContext();
    const location = useLocation();

    if (isLoading) {
        return <PageLoader />;
    }

    if (isAuthenticated) {
        const from = location.state?.from?.pathname ?? ADMIN_ROUTES.ROOT;
        return <Navigate to={from} replace />;
    }

    return <Outlet />;
};
