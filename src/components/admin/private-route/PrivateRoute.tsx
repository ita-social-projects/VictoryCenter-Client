import { Navigate, Outlet, useLocation } from 'react-router';
import { useAdminContext } from '../../../context/admin-context-provider/AdminContextProvider';
import { ADMIN_ROUTES } from '../../../const/admin/routes';
import { PageLoader } from '../../common/page-loader/PageLoader';

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
