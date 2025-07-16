import { fireEvent, render, screen } from '@testing-library/react';
import { LoginPage } from './LoginPage';
import { ERROR_MODAL_BUTTON, ERROR_MODAL_CONTENT, ERROR_MODAL_TITLE } from '../../const/login-page/login-page';

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
        expect(screen.queryByText(ERROR_MODAL_TITLE)).not.toBeInTheDocument();
        expect(screen.queryByText(ERROR_MODAL_CONTENT)).not.toBeInTheDocument();
        expect(screen.queryByText(ERROR_MODAL_BUTTON)).not.toBeInTheDocument();
    });

    it('renders the modal when showErrorModal is true', () => {
        render(<LoginPage />);
        fireEvent.click(screen.getByTestId('simulate-error'));

        expect(screen.getByText(ERROR_MODAL_TITLE)).toBeInTheDocument();
        expect(screen.getByText(ERROR_MODAL_CONTENT)).toBeInTheDocument();
        expect(screen.getByText(ERROR_MODAL_BUTTON)).toBeInTheDocument();
    });

    it('closes the modal when action button is clicked', () => {
        render(<LoginPage />);
        fireEvent.click(screen.getByTestId('simulate-error'));

        const closeButton = screen.getByRole('button', { name: ERROR_MODAL_BUTTON });
        fireEvent.click(closeButton);

        expect(screen.queryByText(ERROR_MODAL_TITLE)).not.toBeInTheDocument();
        expect(screen.queryByText(ERROR_MODAL_CONTENT)).not.toBeInTheDocument();
        expect(screen.queryByText(ERROR_MODAL_BUTTON)).not.toBeInTheDocument();
    });
});
