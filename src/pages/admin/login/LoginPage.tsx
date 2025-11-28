import styles from './LoginPage.module.scss';
import { useState } from 'react';
import { LoginForm } from './login-form/LoginForm';
import { Button } from '../../../components/admin/button/Button';
import { Modal } from '../../../components/common/modal/Modal';
import { LOGIN_CONST } from '../../../const/admin/login';

export const LoginPage = () => {
    const [showModal, setShowModal] = useState(false);
    const onClickHandler = () => setShowModal(false);

    return (
        <div className={styles['page-layout']}>
            <LoginForm setShowErrorModal={setShowModal} />

            <Modal isOpen={showModal} onClose={onClickHandler}>
                <Modal.Title>{LOGIN_CONST.ERROR_MODAL.TITLE}</Modal.Title>
                <Modal.Content>{LOGIN_CONST.ERROR_MODAL.CONTENT}</Modal.Content>
                <Modal.Actions>
                    <Button buttonStyle="primary" onClick={onClickHandler}>
                        {LOGIN_CONST.ERROR_MODAL.BUTTON}
                    </Button>
                </Modal.Actions>
            </Modal>
        </div>
    );
};
