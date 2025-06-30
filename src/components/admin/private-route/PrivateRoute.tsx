import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAdminContext } from '../../../context/admin-context-provider/AdminContextProvider';
import { adminRoutes } from '../../../const/routers/routes';

export const PrivateRoute = () => {
    const { isLoading, isAuthenticated } = useAdminContext();
    const location = useLocation();

    if (isLoading) {
        return <div>WIP</div>;
    }

    if (!isAuthenticated) {
        return <Navigate to={adminRoutes.loginRoute} state={{ from: location }} replace />;
    }

    return <Outlet />;
};
