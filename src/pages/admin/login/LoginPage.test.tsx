import { fireEvent, render, screen } from '@testing-library/react';
import { LOGIN_CONST } from '@/const/admin/login';
import { LoginErrorType } from '@/utils/functions/get-login-error-type/get-login-error-type';
import { LoginPage } from './LoginPage';

jest.mock('./login-form/LoginForm', () => ({
    LoginForm: ({ onLoginError }: { onLoginError: (type: LoginErrorType) => void }) => (
        <>
            <button onClick={() => onLoginError('invalid-credentials')} data-testid="simulate-invalid-credentials" />
            <button onClick={() => onLoginError('service-error')} data-testid="simulate-service-error" />
        </>
    ),
}));

describe('LoginPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
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

    it('closes the modal when action button is clicked', () => {
        render(<LoginPage />);
        fireEvent.click(screen.getByTestId('simulate-invalid-credentials'));

        fireEvent.click(screen.getByRole('button', { name: LOGIN_CONST.ERROR_MODAL.BUTTON }));

        expect(screen.queryByText(LOGIN_CONST.ERROR_MODAL.TITLE)).not.toBeInTheDocument();
        expect(screen.queryByText(LOGIN_CONST.ERROR_MODAL.INVALID_CREDENTIALS)).not.toBeInTheDocument();
        expect(screen.queryByText(LOGIN_CONST.ERROR_MODAL.BUTTON)).not.toBeInTheDocument();
    });
});
