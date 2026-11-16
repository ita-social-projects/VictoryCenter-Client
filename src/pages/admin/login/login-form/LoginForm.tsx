import './LoginForm.scss';
import React, { useRef, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { ReactComponent as Logo } from '@/assets/icons/logo-with-text.svg';
import { ReactComponent as EyeOpened } from '@/assets/icons/eye-opened.svg';
import { ReactComponent as EyeClosed } from '@/assets/icons/eye-closed.svg';
import { Button } from '@/components/admin/button/Button';
import { LOGIN_CONST } from '@/const/admin/login';
import { PUBLIC_ROUTES } from '@/const/public/routes';
import { useAdminContext } from '@/contexts/admin/admin-context-provider/AdminContextProvider';
import { Credentials } from '@/types/admin/auth';
import { getLoginErrorType, LoginErrorType } from '@/utils/functions/get-login-error-type/get-login-error-type';

type LoginFormProps = {
    onLoginError: (type: LoginErrorType) => void;
};

export const LoginForm = ({ onLoginError }: LoginFormProps) => {
    const { login } = useAdminContext();
    const [credentials, setCredentials] = useState<Credentials>({ email: '', password: '' });
    const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const isSubmittingRef = useRef<boolean>(false);

    const handleChange = (field: keyof Credentials) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setCredentials((prev) => ({ ...prev, [field]: e.target.value }));
    };
    const handleVisibilityChange = () => setIsPasswordVisible((prev) => !prev);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmittingRef.current) return;

        isSubmittingRef.current = true;
        setIsSubmitting(true);
        try {
            await login(credentials);
        } catch (error) {
            onLoginError(getLoginErrorType(error));
        } finally {
            isSubmittingRef.current = false;
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="login-form" spellCheck={false} aria-busy={isSubmitting}>
            <NavLink to={PUBLIC_ROUTES.ROOT}>
                <Logo />
            </NavLink>
            <h2 className="login-form-title">{LOGIN_CONST.FORM.TITLE}</h2>
            <div className="login-form-group">
                <label htmlFor="email">{LOGIN_CONST.FORM.EMAIL_FIELD_LABEL}</label>
                <input
                    id="email"
                    name="email"
                    type="email"
                    value={credentials.email}
                    onChange={handleChange('email')}
                    autoComplete="username"
                    required
                />
            </div>
            <div className="login-form-group">
                <label htmlFor="password">{LOGIN_CONST.FORM.PASSWORD_FIELD_LABEL}</label>
                <div className="password-input-container">
                    <input
                        id="password"
                        name="password"
                        type={isPasswordVisible ? 'text' : 'password'}
                        value={credentials.password}
                        onChange={handleChange('password')}
                        autoComplete="current-password"
                        required
                    />
                    <button
                        type="button"
                        className="visibility-toggle"
                        data-testid="visibility-toggle-button"
                        onClick={handleVisibilityChange}
                    >
                        {isPasswordVisible ? <EyeOpened /> : <EyeClosed />}
                    </button>
                </div>
            </div>
            <div className="login-form-group">
                <Button type="submit" buttonStyle="primary" className="submit-button" disabled={isSubmitting}>
                    {isSubmitting ? LOGIN_CONST.FORM.SUBMIT_BUTTON_LOADING : LOGIN_CONST.FORM.SUBMIT_BUTTON}
                </Button>
            </div>
        </form>
    );
};
