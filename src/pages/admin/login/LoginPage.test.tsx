import { fireEvent, render, screen } from '@testing-library/react';
import { LOGIN_CONST } from '@/const/admin/login';
import { LoginErrorType } from '@/utils/functions/get-login-error-type/get-login-error-type';
import { LoginPage } from './LoginPage';
import { useAdminContext } from '@/contexts/admin/admin-context-provider/AdminContextProvider';

jest.mock('@/contexts/admin/admin-context-provider/AdminContextProvider', () => ({
    useAdminContext: jest.fn(),
}));

jest.mock('./login-form/LoginForm', () => ({
    LoginForm: ({ onLoginError }: { onLoginError: (type: LoginErrorType) => void }) => (
        <div data-testid="login-form">
            <button onClick={() => onLoginError('invalid-credentials')} data-testid="simulate-invalid-credentials" />
            <button onClick={() => onLoginError('service-error')} data-testid="simulate-service-error" />
        </div>
    ),
}));

const useAdminContextMock = useAdminContext as jest.Mock;

const renderWithRevocationFailed = (isLogoutRevocationFailed: boolean) => {
    useAdminContextMock.mockReturnValue({ isLogoutRevocationFailed });
    return render(<LoginPage />);
};

describe('LoginPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        useAdminContextMock.mockReturnValue({ isLogoutRevocationFailed: false });
    });

    it('does not render the modal by default', () => {
        render(<LoginPage />);
        expect(screen.queryByText(LOGIN_CONST.ERROR_MODAL.TITLE)).not.toBeInTheDocument();
        expect(screen.queryByText(LOGIN_CONST.ERROR_MODAL.INVALID_CREDENTIALS)).not.toBeInTheDocument();
        expect(screen.queryByText(LOGIN_CONST.ERROR_MODAL.SERVICE_UNAVAILABLE)).not.toBeInTheDocument();
        expect(screen.queryByText(LOGIN_CONST.ERROR_MODAL.BUTTON)).not.toBeInTheDocument();
    });

    it('renders the invalid credentials message for invalid-credentials errors', () => {
        render(<LoginPage />);
        fireEvent.click(screen.getByTestId('simulate-invalid-credentials'));

        expect(screen.getByText(LOGIN_CONST.ERROR_MODAL.TITLE)).toBeInTheDocument();
        expect(screen.getByText(LOGIN_CONST.ERROR_MODAL.INVALID_CREDENTIALS)).toBeInTheDocument();
        expect(screen.queryByText(LOGIN_CONST.ERROR_MODAL.SERVICE_UNAVAILABLE)).not.toBeInTheDocument();
    });

    it('renders the service unavailable message for service errors', () => {
        render(<LoginPage />);
        fireEvent.click(screen.getByTestId('simulate-service-error'));

        expect(screen.getByText(LOGIN_CONST.ERROR_MODAL.TITLE)).toBeInTheDocument();
        expect(screen.getByText(LOGIN_CONST.ERROR_MODAL.SERVICE_UNAVAILABLE)).toBeInTheDocument();
        expect(screen.queryByText(LOGIN_CONST.ERROR_MODAL.INVALID_CREDENTIALS)).not.toBeInTheDocument();
    });

    it('renders the error modal with the login-specific class', () => {
        render(<LoginPage />);
        fireEvent.click(screen.getByTestId('simulate-invalid-credentials'));

        const message = screen.getByText(LOGIN_CONST.ERROR_MODAL.INVALID_CREDENTIALS);

        expect(message.closest('.modal-container')).toHaveClass('login-error-modal');
    });

    it('closes the modal when action button is clicked', () => {
        render(<LoginPage />);
        fireEvent.click(screen.getByTestId('simulate-invalid-credentials'));

        fireEvent.click(screen.getByRole('button', { name: LOGIN_CONST.ERROR_MODAL.BUTTON }));

        expect(screen.queryByText(LOGIN_CONST.ERROR_MODAL.TITLE)).not.toBeInTheDocument();
        expect(screen.queryByText(LOGIN_CONST.ERROR_MODAL.INVALID_CREDENTIALS)).not.toBeInTheDocument();
        expect(screen.queryByText(LOGIN_CONST.ERROR_MODAL.BUTTON)).not.toBeInTheDocument();
    });

    describe('<LoginPage /> logout revocation warning', () => {
        it('shows the warning when server logout could not be confirmed', () => {
            renderWithRevocationFailed(true);

            expect(screen.getByTestId('logout-revocation-warning')).toHaveTextContent(
                LOGIN_CONST.LOGOUT_REVOCATION_WARNING,
            );
        });

        it('does not show the warning when logout was confirmed', () => {
            renderWithRevocationFailed(false);

            expect(screen.queryByTestId('logout-revocation-warning')).not.toBeInTheDocument();
        });

        it('still renders the login form when the warning is shown', () => {
            renderWithRevocationFailed(true);

            expect(screen.getByTestId('login-form')).toBeInTheDocument();
        });
    });
});
