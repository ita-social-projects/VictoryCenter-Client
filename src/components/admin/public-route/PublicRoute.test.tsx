import { render, screen } from '@testing-library/react';
import { useLocation } from 'react-router';
import { useAdminContext } from '../../../context/admin-context-provider/AdminContextProvider';
import { PublicRoute } from './PublicRoute';
import { ADMIN_ROUTES } from '../../../const/admin/routes';

const mockUseAdminContext = useAdminContext as jest.MockedFunction<typeof useAdminContext>;
const mockUseLocation = useLocation as jest.MockedFunction<typeof useLocation>;

jest.mock('react-router', () => ({
    Navigate: ({ to, replace }: any) => <div data-testid="navigate" data-to={to} data-replace={String(replace)} />,
    Outlet: () => <div data-testid="outlet" />,
    useLocation: jest.fn(),
}));
jest.mock('../../../context/admin-context-provider/AdminContextProvider', () => ({
    useAdminContext: jest.fn(),
}));
jest.mock('../../common/page-loader/PageLoader', () => ({
    PageLoader: () => <div data-testid="loader" />,
}));

describe('<PublicRoute />', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders PageLoader while loading', () => {
        mockUseAdminContext.mockReturnValue({ isLoading: true, isAuthenticated: false } as any);

        render(<PublicRoute />);
        expect(screen.getByTestId('loader')).toBeInTheDocument();
    });

    it('redirects to "from" when authenticated and location.state.from exists', () => {
        mockUseAdminContext.mockReturnValue({ isLoading: false, isAuthenticated: true } as any);
        mockUseLocation.mockReturnValue({ state: { from: { pathname: '/private' } } } as any);

        render(<PublicRoute />);
        const nav = screen.getByTestId('navigate');
        expect(nav).toHaveAttribute('data-to', '/private');
        expect(nav).toHaveAttribute('data-replace', 'true');
    });

    it('redirects to adminRoute when authenticated but no from in location.state', () => {
        mockUseAdminContext.mockReturnValue({ isLoading: false, isAuthenticated: true } as any);
        mockUseLocation.mockReturnValue({ state: {} } as any);

        render(<PublicRoute />);
        const nav = screen.getByTestId('navigate');
        expect(nav).toHaveAttribute('data-to', ADMIN_ROUTES.ROOT);
        expect(nav).toHaveAttribute('data-replace', 'true');
    });

    it('renders Outlet when not authenticated', () => {
        mockUseAdminContext.mockReturnValue({ isLoading: false, isAuthenticated: false } as any);
        mockUseLocation.mockReturnValue({ state: {} } as any);

        render(<PublicRoute />);
        expect(screen.getByTestId('outlet')).toBeInTheDocument();
    });
});
