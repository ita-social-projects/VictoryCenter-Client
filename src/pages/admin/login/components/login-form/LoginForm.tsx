import './LoginForm.scss';
import React, { useState } from 'react';
import { NavLink } from 'react-router';
import { Button } from '../../../../components/common/button/Button';
import Logo from '../../../../assets/icons/logo.svg';
import EyeOpened from '../../../../assets/icons/eye-opened.svg';
import EyeClosed from '../../../../assets/icons/eye-closed.svg';
import { Credentials } from '../../../../types/admin/auth';
import { LOGIN_CONST } from '../../../../const/admin/login';
import { PUBLIC_ROUTES } from '../../../../const/public/routes';
import { useAdminContext } from '../../../../contexts/admin/admin-context-provider/AdminContextProvider';

type LoginFormProps = {
    setShowErrorModal: (value: boolean) => void;
};

export const LoginForm = ({ setShowErrorModal }: LoginFormProps) => {
    const { login } = useAdminContext();
    const [credentials, setCredentials] = useState<Credentials>({ email: '', password: '' });
    const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);

    const handleChange = (field: keyof Credentials) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setCredentials((prev) => ({ ...prev, [field]: e.target.value }));
    };
    const handleVisibilityChange = () => setIsPasswordVisible(!isPasswordVisible);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await login(credentials);
        } catch (error) {
            setShowErrorModal(true);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="login-form" spellCheck={false}>
            <NavLink to={PUBLIC_ROUTES.ROOT} className="logo">
                <img src={Logo} alt={LOGIN_CONST.FORM.LOGO_ALT} />
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
                    <button type="button" className="visibility-toggle" onClick={handleVisibilityChange}>
                        <img
                            src={isPasswordVisible ? EyeOpened : EyeClosed}
                            alt={
                                isPasswordVisible
                                    ? LOGIN_CONST.FORM.SHOWED_PASSWORD_ALT
                                    : LOGIN_CONST.FORM.HIDDEN_PASSWORD_ALT
                            }
                            className="toggle-icon"
                        />
                    </button>
                </div>
            </div>
            <div className="login-form-group">
                <Button type="submit" buttonStyle="primary" className="submit-button">
                    {LOGIN_CONST.FORM.SUBMIT_BUTTON}
                </Button>
            </div>
        </form>
    );
};
