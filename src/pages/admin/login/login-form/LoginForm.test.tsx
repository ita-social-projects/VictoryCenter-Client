import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import * as AdminContext from '@/contexts/admin/admin-context-provider/AdminContextProvider';
import { LoginForm } from './LoginForm';
import { MemoryRouter } from 'react-router-dom';
import { AxiosError } from 'axios';
import { LOGIN_CONST } from '@/const/admin/login';

jest.mock('@/assets/icons/logo-with-text.svg', () => ({
    ReactComponent: (props: any) => <svg {...props} data-testid="logo-icon" />,
}));

jest.mock('@/assets/icons/eye-opened.svg', () => ({
    ReactComponent: (props: any) => <svg {...props} data-testid="eye-opened-icon" />,
}));

jest.mock('@/assets/icons/eye-closed.svg', () => ({
    ReactComponent: (props: any) => <svg {...props} data-testid="eye-closed-icon" />,
}));

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
                <LoginForm onLoginError={jest.fn()} />
            </MemoryRouter>,
        );

        expect(screen.getByTestId('logo-icon')).toBeInTheDocument();

        expect(screen.getByText(LOGIN_CONST.FORM.TITLE)).toBeInTheDocument();

        const emailInput = screen.getByLabelText(LOGIN_CONST.FORM.EMAIL_FIELD_LABEL) as HTMLInputElement;
        expect(emailInput.value).toBe('');

        const passwordInput = screen.getByLabelText(LOGIN_CONST.FORM.PASSWORD_FIELD_LABEL) as HTMLInputElement;
        expect(passwordInput.value).toBe('');
        expect(passwordInput.type).toBe('password');
        const toggleBtn = screen.getByTestId('visibility-toggle-button');
        expect(toggleBtn).toBeInTheDocument();

        expect(screen.getByRole('button', { name: LOGIN_CONST.FORM.SUBMIT_BUTTON })).toBeInTheDocument();
    });

    it('updates email and password inputs on change', () => {
        render(
            <MemoryRouter>
                <LoginForm onLoginError={jest.fn()} />
            </MemoryRouter>,
        );

        const emailInput = screen.getByLabelText(LOGIN_CONST.FORM.EMAIL_FIELD_LABEL) as HTMLInputElement;
        const passwordInput = screen.getByLabelText(LOGIN_CONST.FORM.PASSWORD_FIELD_LABEL) as HTMLInputElement;

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
                <LoginForm onLoginError={jest.fn()} />
            </MemoryRouter>,
        );

        const passwordInput = screen.getByLabelText(LOGIN_CONST.FORM.PASSWORD_FIELD_LABEL) as HTMLInputElement;
        const toggleBtn = screen.getByTestId('visibility-toggle-button');

        fireEvent.click(toggleBtn);
        expect(passwordInput.type).toBe('text');
        expect(screen.getByTestId('eye-opened-icon')).toBeInTheDocument();

        fireEvent.click(toggleBtn);
        expect(passwordInput.type).toBe('password');
        expect(screen.getByTestId('eye-closed-icon')).toBeInTheDocument();
    });

    it('calls login with credentials on submit (success)', async () => {
        const onLoginError = jest.fn();
        loginMock.mockResolvedValueOnce();

        render(
            <MemoryRouter>
                <LoginForm onLoginError={onLoginError} />
            </MemoryRouter>,
        );

        fireEvent.change(screen.getByLabelText(LOGIN_CONST.FORM.EMAIL_FIELD_LABEL), {
            target: { value: 'a@b.com' },
        });
        fireEvent.change(screen.getByLabelText(LOGIN_CONST.FORM.PASSWORD_FIELD_LABEL), {
            target: { value: 'secret' },
        });

        fireEvent.click(screen.getByRole('button', { name: LOGIN_CONST.FORM.SUBMIT_BUTTON }));

        await waitFor(() =>
            expect(loginMock).toHaveBeenCalledWith({
                email: 'a@b.com',
                password: 'secret',
            }),
        );
        expect(onLoginError).not.toHaveBeenCalled();
    });

    const renderForm = (onLoginError = jest.fn()) =>
        render(
            <MemoryRouter>
                <LoginForm onLoginError={onLoginError} />
            </MemoryRouter>,
        );

    const createAxiosError = (status: number) =>
        new AxiosError('Request failed', 'ERR_BAD_REQUEST', undefined, undefined, {
            status,
            statusText: '',
            headers: {},
            config: {} as never,
            data: null,
        });

    it('reports invalid-credentials on 401 response', async () => {
        const onLoginError = jest.fn();
        loginMock.mockRejectedValueOnce(createAxiosError(401));
        renderForm(onLoginError);

        fireEvent.click(screen.getByRole('button', { name: LOGIN_CONST.FORM.SUBMIT_BUTTON }));
        await waitFor(() => expect(onLoginError).toHaveBeenCalledWith('invalid-credentials'));
    });

    it('reports service-error on network failure', async () => {
        const onLoginError = jest.fn();
        loginMock.mockRejectedValueOnce(new AxiosError('Network Error', 'ERR_NETWORK'));
        renderForm(onLoginError);

        fireEvent.click(screen.getByRole('button', { name: LOGIN_CONST.FORM.SUBMIT_BUTTON }));
        await waitFor(() => expect(onLoginError).toHaveBeenCalledWith('service-error'));
    });

    it('reports service-error on server failure', async () => {
        const onLoginError = jest.fn();
        loginMock.mockRejectedValueOnce(createAxiosError(500));
        renderForm(onLoginError);

        fireEvent.click(screen.getByRole('button', { name: LOGIN_CONST.FORM.SUBMIT_BUTTON }));
        await waitFor(() => expect(onLoginError).toHaveBeenCalledWith('service-error'));
    });

    it('disables submit and shows loading label while request is in flight, then re-enables', async () => {
        let rejectLogin: (reason: unknown) => void = () => {};
        loginMock.mockImplementationOnce(
            () =>
                new Promise<void>((_, reject) => {
                    rejectLogin = reject;
                }),
        );
        const { container } = renderForm();

        fireEvent.click(screen.getByRole('button', { name: LOGIN_CONST.FORM.SUBMIT_BUTTON }));

        const loadingButton = await screen.findByRole('button', { name: LOGIN_CONST.FORM.SUBMIT_BUTTON_LOADING });
        expect(loadingButton).toBeDisabled();
        expect(container.querySelector('form')).toHaveAttribute('aria-busy', 'true');

        rejectLogin(createAxiosError(401));

        const submitButton = await screen.findByRole('button', { name: LOGIN_CONST.FORM.SUBMIT_BUTTON });
        expect(submitButton).toBeEnabled();
        expect(container.querySelector('form')).toHaveAttribute('aria-busy', 'false');
    });

    it('ignores repeated submissions while a login request is pending', async () => {
        loginMock.mockImplementation(() => new Promise<void>(() => {}));
        const { container } = renderForm();
        const form = container.querySelector('form') as HTMLFormElement;

        fireEvent.submit(form);
        fireEvent.submit(form);
        fireEvent.submit(form);

        await screen.findByRole('button', { name: LOGIN_CONST.FORM.SUBMIT_BUTTON_LOADING });
        expect(loginMock).toHaveBeenCalledTimes(1);
    });
});
