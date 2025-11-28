import styles from './LoginForm.module.scss';
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { ReactComponent as Logo } from '../../../../assets/icons/logo-with-text.svg';
import { ReactComponent as EyeOpened } from '../../../../assets/icons/eye-opened.svg';
import { ReactComponent as EyeClosed } from '../../../../assets/icons/eye-closed.svg';
import { Button } from '../../../../components/admin/button/Button';
import { LOGIN_CONST } from '../../../../const/admin/login';
import { PUBLIC_ROUTES } from '../../../../const/public/routes';
import { useAdminContext } from '../../../../contexts/admin/admin-context-provider/AdminContextProvider';
import { Credentials } from '../../../../types/admin/auth';

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
    const handleVisibilityChange = () => setIsPasswordVisible((prev) => !prev);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await login(credentials);
        } catch (error) {
            setShowErrorModal(true);
        }
    };

    return (
        <form onSubmit={handleSubmit} className={styles['login-form']} spellCheck={false}>
            <NavLink to={PUBLIC_ROUTES.ROOT}>
                <Logo />
            </NavLink>
            <h2 className={styles['login-form-title']}>{LOGIN_CONST.FORM.TITLE}</h2>
            <div className={styles['login-form-group']}>
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
            <div className={styles['login-form-group']}>
                <label htmlFor="password">{LOGIN_CONST.FORM.PASSWORD_FIELD_LABEL}</label>
                <div className={styles['password-input-container']}>
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
                        className={styles['visibility-toggle']}
                        data-testid="visibility-toggle-button"
                        onClick={handleVisibilityChange}
                    >
                        {isPasswordVisible ? <EyeOpened /> : <EyeClosed />}
                    </button>
                </div>
            </div>
            <div className={styles['login-form-group']}>
                <Button type="submit" buttonStyle="primary" className={styles['submit-button']}>
                    {LOGIN_CONST.FORM.SUBMIT_BUTTON}
                </Button>
            </div>
        </form>
    );
};
