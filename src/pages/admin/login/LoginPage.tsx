import './LoginPage.scss';
import React, { useState } from 'react';
import { LoginForm } from './components/login-form/LoginForm';
import { Modal } from '../../components/common/modal/Modal';
import { Button } from '../../components/common/button/Button';
import { LOGIN_CONST } from '../../const/admin/login';

export const LoginPage = () => {
    const [showModal, setShowModal] = useState(false);
    const onClickHandler = () => setShowModal(false);

    return (
        <div className="page-layout">
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
