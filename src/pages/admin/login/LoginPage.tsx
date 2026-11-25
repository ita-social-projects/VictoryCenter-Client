import './LoginPage.scss';
import { useState } from 'react';
import { LoginForm } from './login-form/LoginForm';
import { Button } from '@/components/admin/button/Button';
import { Modal } from '@/components/common/modal/Modal';
import { LOGIN_CONST } from '@/const/admin/login';
import { useAdminContext } from '@/contexts/admin/admin-context-provider/AdminContextProvider';
import { LoginErrorType } from '@/utils/functions/get-login-error-type/get-login-error-type';

const ERROR_MESSAGES: Record<LoginErrorType, string> = {
    'invalid-credentials': LOGIN_CONST.ERROR_MODAL.INVALID_CREDENTIALS,
    'service-error': LOGIN_CONST.ERROR_MODAL.SERVICE_UNAVAILABLE,
};

export const LoginPage = () => {
    const [errorType, setErrorType] = useState<LoginErrorType | null>(null);
    const { isLogoutRevocationFailed } = useAdminContext();
    const onClickHandler = () => setErrorType(null);

    return (
        <div className="page-layout">
            <div className="login-content">
                {isLogoutRevocationFailed && (
                    <div className="logout-revocation-warning" role="status" data-testid="logout-revocation-warning">
                        {LOGIN_CONST.LOGOUT_REVOCATION_WARNING}
                    </div>
                )}

                <LoginForm onLoginError={setErrorType} />
            </div>

            <Modal isOpen={errorType !== null} onClose={onClickHandler} className="login-error-modal">
                <Modal.Title>{LOGIN_CONST.ERROR_MODAL.TITLE}</Modal.Title>
                <Modal.Content>{errorType && ERROR_MESSAGES[errorType]}</Modal.Content>
                <Modal.Actions>
                    <Button buttonStyle="primary" onClick={onClickHandler}>
                        {LOGIN_CONST.ERROR_MODAL.BUTTON}
                    </Button>
                </Modal.Actions>
            </Modal>
        </div>
    );
};
