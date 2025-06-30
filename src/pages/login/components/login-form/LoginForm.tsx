import React, { useState } from 'react';
import { useAdminContext } from '../../../../context/admin-context-provider/AdminContextProvider';
import { Credentials } from '../../../../types/AdminContext';
import { Button } from '../../../../components/common/button/Button';
import {
    EMAIL_FIELD_LABEL,
    FORM_TITLE,
    LOGO_ALT,
    PASSWORD_FIELD_LABEL,
    SUBMIT_BUTTON,
} from '../../../../const/login-page/login-page';
import Logo from '../../../../assets/icons/logo.svg';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { adminRoutes } from '../../../../const/routers/routes';
import './login-form.scss';

type LoginFormProps = {
    setShowErrorModal: (value: boolean) => void;
};

export const LoginForm = ({ setShowErrorModal }: LoginFormProps) => {
    const { login } = useAdminContext();
    const [credentials, setCredentials] = useState<Credentials>({ email: '', password: '' });
    const navigate = useNavigate();
    const location = useLocation();
    
    const from = location.state?.from?.pathname || adminRoutes.adminRoute;

    const handleChange = (field: keyof Credentials) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setCredentials((prev) => ({ ...prev, [field]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await login(credentials);
            navigate(from, { replace: true });
        } catch (error) {
            setShowErrorModal(true);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="form">
            <NavLink to="/" className="logo">
                <img src={Logo} alt={LOGO_ALT} />
            </NavLink>
            <h2 className="form-title">{FORM_TITLE}</h2>
            <div className="form-group">
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

            <div className="form-group">
                <label htmlFor="password">{PASSWORD_FIELD_LABEL}</label>
                <input
                    id="password"
                    name="password"
                    type="password"
                    value={credentials.password}
                    onChange={handleChange('password')}
                    autoComplete="current-password"
                    required
                />
            </div>
            <div className="form-group">
                <Button type="submit" buttonStyle="primary" className="submit-button">
                    {SUBMIT_BUTTON}
                </Button>
            </div>
        </form>
    );
};
