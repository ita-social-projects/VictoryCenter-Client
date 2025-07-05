import { render, screen, fireEvent } from '@testing-library/react';
import { LoginPageContent } from './LoginPageContent';
import {
    ERROR_MODAL_TITLE,
    ERROR_MODAL_CONTENT,
    ERROR_MODAL_BUTTON,
} from '../../../../const/login-page/login-page';

jest.mock('../login-form/LoginForm', () => ({
    LoginForm: ({ setShowErrorModal }: { setShowErrorModal: (value: boolean) => void }) => (
        <button onClick={() => setShowErrorModal(true)} data-testid="simulate-error" />
    ),
}));

describe('LoginPageContent', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('does not render the modal by default', () => {
        render(<LoginPageContent />);
        expect(screen.queryByText(ERROR_MODAL_TITLE)).not.toBeInTheDocument();
        expect(screen.queryByText(ERROR_MODAL_CONTENT)).not.toBeInTheDocument();
        expect(screen.queryByText(ERROR_MODAL_BUTTON)).not.toBeInTheDocument();
    });

    it('renders the modal when showErrorModal is true', () => {
        render(<LoginPageContent />);
        fireEvent.click(screen.getByTestId('simulate-error'));

        expect(screen.getByText(ERROR_MODAL_TITLE)).toBeInTheDocument();
        expect(screen.getByText(ERROR_MODAL_CONTENT)).toBeInTheDocument();
        expect(screen.getByText(ERROR_MODAL_BUTTON)).toBeInTheDocument();
    });

    it('closes the modal when action button is clicked', () => {
        render(<LoginPageContent />);
        fireEvent.click(screen.getByTestId('simulate-error'));

        const closeButton = screen.getByRole('button', {name: ERROR_MODAL_BUTTON});
        fireEvent.click(closeButton);

        expect(screen.queryByText(ERROR_MODAL_TITLE)).not.toBeInTheDocument();
        expect(screen.queryByText(ERROR_MODAL_CONTENT)).not.toBeInTheDocument();
        expect(screen.queryByText(ERROR_MODAL_BUTTON)).not.toBeInTheDocument();
    });
});
