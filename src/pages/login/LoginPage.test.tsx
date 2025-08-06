import { fireEvent, render, screen } from '@testing-library/react';
import { LoginPage } from './LoginPage';
import { LOGIN_CONST } from '../../const/admin/login';

jest.mock('./components/login-form/LoginForm', () => ({
    LoginForm: ({ setShowErrorModal }: { setShowErrorModal: (value: boolean) => void }) => (
        <button onClick={() => setShowErrorModal(true)} data-testid="simulate-error" />
    ),
}));

describe('LoginPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('does not render the modal by default', () => {
        render(<LoginPage />);
        expect(screen.queryByText(LOGIN_CONST.ERROR_MODAL.TITLE)).not.toBeInTheDocument();
        expect(screen.queryByText(LOGIN_CONST.ERROR_MODAL.CONTENT)).not.toBeInTheDocument();
        expect(screen.queryByText(LOGIN_CONST.ERROR_MODAL.BUTTON)).not.toBeInTheDocument();
    });

    it('renders the modal when showErrorModal is true', () => {
        render(<LoginPage />);
        fireEvent.click(screen.getByTestId('simulate-error'));

        expect(screen.getByText(LOGIN_CONST.ERROR_MODAL.TITLE)).toBeInTheDocument();
        expect(screen.getByText(LOGIN_CONST.ERROR_MODAL.CONTENT)).toBeInTheDocument();
        expect(screen.getByText(LOGIN_CONST.ERROR_MODAL.BUTTON)).toBeInTheDocument();
    });

    it('closes the modal when action button is clicked', () => {
        render(<LoginPage />);
        fireEvent.click(screen.getByTestId('simulate-error'));

        const closeButton = screen.getByRole('button', { name: LOGIN_CONST.ERROR_MODAL.BUTTON });
        fireEvent.click(closeButton);

        expect(screen.queryByText(LOGIN_CONST.ERROR_MODAL.TITLE)).not.toBeInTheDocument();
        expect(screen.queryByText(LOGIN_CONST.ERROR_MODAL.CONTENT)).not.toBeInTheDocument();
        expect(screen.queryByText(LOGIN_CONST.ERROR_MODAL.BUTTON)).not.toBeInTheDocument();
    });
});
