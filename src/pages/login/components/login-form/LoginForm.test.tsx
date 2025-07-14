import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import * as AdminContext from '../../../../context/admin-context-provider/AdminContextProvider';
import { LoginForm } from './LoginForm';
import {
    EMAIL_FIELD_LABEL,
    PASSWORD_FIELD_LABEL,
    FORM_TITLE,
    LOGO_ALT,
    EYE_CLOSED_ALT,
    EYE_OPENED_ALT,
    SUBMIT_BUTTON,
} from '../../../../const/login-page/login-page';
import Logo from '../../../../assets/icons/logo.svg';
import { MemoryRouter } from 'react-router';

describe('<LoginForm />', () => {
    let loginMock: jest.Mock<Promise<void>, [creds: any]>;

    beforeEach(() => {
        loginMock = jest.fn();
        jest.spyOn(AdminContext, 'useAdminContext').mockReturnValue({
            client: {} as any,
            isAuthenticated: false,
            isLoading: false,
            login: loginMock,
            logout: jest.fn(),
            refreshAccessToken: jest.fn(),
        });
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('renders logo, title, inputs, toggle and submit button', () => {
        render(
            <MemoryRouter>
                <LoginForm setShowErrorModal={jest.fn()} />
            </MemoryRouter>,
        );

        const logo = screen.getByAltText(LOGO_ALT) as HTMLImageElement;
        expect(logo).toBeInTheDocument();
        expect(logo.src).toContain(Logo);

        expect(screen.getByText(FORM_TITLE)).toBeInTheDocument();

        const emailInput = screen.getByLabelText(EMAIL_FIELD_LABEL) as HTMLInputElement;
        expect(emailInput.value).toBe('');

        const passwordInput = screen.getByLabelText(PASSWORD_FIELD_LABEL) as HTMLInputElement;
        expect(passwordInput.value).toBe('');
        expect(passwordInput.type).toBe('password');
        const toggleBtn = screen.getByRole('button', {
            name: EYE_CLOSED_ALT,
        });
        expect(toggleBtn).toBeInTheDocument();

        expect(screen.getByRole('button', { name: SUBMIT_BUTTON })).toBeInTheDocument();
    });

    it('updates email and password inputs on change', () => {
        render(
            <MemoryRouter>
                <LoginForm setShowErrorModal={jest.fn()} />
            </MemoryRouter>,
        );

        const emailInput = screen.getByLabelText(EMAIL_FIELD_LABEL) as HTMLInputElement;
        const passwordInput = screen.getByLabelText(PASSWORD_FIELD_LABEL) as HTMLInputElement;

        fireEvent.change(emailInput, {
            target: { value: 'user@example.com' },
        });
        expect(emailInput.value).toBe('user@example.com');

        fireEvent.change(passwordInput, {
            target: { value: 'p@ssw0rd' },
        });
        expect(passwordInput.value).toBe('p@ssw0rd');
    });

    it('toggles password visibility and icon', () => {
        render(
            <MemoryRouter>
                <LoginForm setShowErrorModal={jest.fn()} />
            </MemoryRouter>,
        );

        const passwordInput = screen.getByLabelText(PASSWORD_FIELD_LABEL) as HTMLInputElement;
        const toggleBtn = screen.getByRole('button', {
            name: EYE_CLOSED_ALT,
        });

        fireEvent.click(toggleBtn);
        expect(passwordInput.type).toBe('text');
        expect(screen.getByRole('button', { name: EYE_OPENED_ALT })).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: EYE_OPENED_ALT }));
        expect(passwordInput.type).toBe('password');
        expect(screen.getByRole('button', { name: EYE_CLOSED_ALT })).toBeInTheDocument();
    });

    it('calls login with credentials on submit (success)', async () => {
        const setShowErrorModal = jest.fn();
        loginMock.mockResolvedValueOnce();

        render(
            <MemoryRouter>
                <LoginForm setShowErrorModal={setShowErrorModal} />
            </MemoryRouter>,
        );

        fireEvent.change(screen.getByLabelText(EMAIL_FIELD_LABEL), {
            target: { value: 'a@b.com' },
        });
        fireEvent.change(screen.getByLabelText(PASSWORD_FIELD_LABEL), {
            target: { value: 'secret' },
        });

        fireEvent.click(screen.getByRole('button', { name: SUBMIT_BUTTON }));

        await waitFor(() =>
            expect(loginMock).toHaveBeenCalledWith({
                email: 'a@b.com',
                password: 'secret',
            }),
        );
        expect(setShowErrorModal).not.toHaveBeenCalled();
    });

    it('shows error modal on login failure', async () => {
        const setShowErrorModal = jest.fn();
        loginMock.mockRejectedValueOnce(new Error('fail'));

        render(
            <MemoryRouter>
                <LoginForm setShowErrorModal={setShowErrorModal} />
            </MemoryRouter>,
        );

        fireEvent.click(screen.getByRole('button', { name: SUBMIT_BUTTON }));
        await waitFor(() => expect(setShowErrorModal).toHaveBeenCalledWith(true));
    });
});
