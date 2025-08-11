import { render, screen } from '@testing-library/react';
import { useLocation } from 'react-router';
import { PrivateRoute } from './PrivateRoute';
import { ADMIN_ROUTES } from '../../../const/admin/routes';
import { useAdminContext } from '../../../contexts/admin/admin-context-provider/AdminContextProvider';

const mockUseAdminContext = useAdminContext as jest.MockedFunction<typeof useAdminContext>;
const mockUseLocation = useLocation as jest.MockedFunction<typeof useLocation>;

jest.mock('react-router', () => ({
    Navigate: ({ to, state, replace }: any) => (
        <div data-testid="navigate" data-to={to} data-from={state.from.pathname} data-replace={String(replace)} />
    ),
    Outlet: () => <div data-testid="outlet" />,
    useLocation: jest.fn(),
}));
jest.mock('../../../contexts/admin/admin-context-provider/AdminContextProvider', () => ({
    useAdminContext: jest.fn(),
}));
jest.mock('../../common/page-loader/PageLoader', () => ({
    PageLoader: () => <div data-testid="loader" />,
}));
jest.mock('../../../const/admin/routes', () => ({
    ADMIN_ROUTES: { LOGIN: { FULL: '/login' } },
}));

describe('PrivateRoute', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders loader while loading', () => {
        mockUseAdminContext.mockReturnValue({ isLoading: true, isAuthenticated: false } as any);

        render(<PrivateRoute />);
        expect(screen.getByTestId('loader')).toBeInTheDocument();
    });

    it('redirects to login when not authenticated', () => {
        mockUseAdminContext.mockReturnValue({ isLoading: false, isAuthenticated: false } as any);
        mockUseLocation.mockReturnValue({ pathname: '/public' } as any);

        render(<PrivateRoute />);
        const nav = screen.getByTestId('navigate');
        expect(nav).toHaveAttribute('data-to', ADMIN_ROUTES.LOGIN.FULL);
        expect(nav).toHaveAttribute('data-from', '/public');
        expect(nav).toHaveAttribute('data-replace', 'true');
    });

    it('renders Outlet when authenticated', () => {
        mockUseAdminContext.mockReturnValue({ isLoading: false, isAuthenticated: true } as any);

        render(<PrivateRoute />);
        expect(screen.getByTestId('outlet')).toBeInTheDocument();
    });
});
