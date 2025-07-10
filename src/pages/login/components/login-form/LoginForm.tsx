import React, { useState } from 'react';
import { NavLink } from 'react-router';
import { useAdminContext } from '../../../../context/admin-context-provider/AdminContextProvider';
import { Button } from '../../../../components/common/button/Button';
import {
    EMAIL_FIELD_LABEL,
    EYE_CLOSED_ALT,
    EYE_OPENED_ALT,
    FORM_TITLE,
    LOGO_ALT,
    PASSWORD_FIELD_LABEL,
    SUBMIT_BUTTON,
} from '../../../../const/login-page/login-page';
import Logo from '../../../../assets/icons/logo.svg';
import EyeOpened from '../../../../assets/icons/eye-opened.svg';
import EyeClosed from '../../../../assets/icons/eye-closed.svg';
import { Credentials } from '../../../../types/Auth';
import './login-form.scss';

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
            <NavLink to="/" className="logo">
                <img src={Logo} alt={LOGO_ALT} />
            </NavLink>
            <h2 className="login-form-title">{FORM_TITLE}</h2>
            <div className="login-form-group">
                <label htmlFor="email">{EMAIL_FIELD_LABEL}</label>
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
                <label htmlFor="password">{PASSWORD_FIELD_LABEL}</label>
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
                        onClick={() => setIsPasswordVisible((isPasswordVisible) => !isPasswordVisible)}
                    >
                        <img
                            src={isPasswordVisible ? EyeOpened : EyeClosed}
                            alt={isPasswordVisible ? EYE_OPENED_ALT : EYE_CLOSED_ALT}
                            className="toggle-icon"
                        />
                    </button>
                </div>
            </div>
            <div className="login-form-group">
                <Button type="submit" buttonStyle="primary" className="submit-button">
                    {SUBMIT_BUTTON}
                </Button>
            </div>
        </form>
    );
};
