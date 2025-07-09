import React, { useState } from 'react';
import { LoginForm } from './components/login-form/LoginForm';
import { Modal } from '../../components/common/modal/Modal';
import {
    ERROR_MODAL_BUTTON,
    ERROR_MODAL_CONTENT,
    ERROR_MODAL_TITLE,
} from '../../const/login-page/login-page';
import { Button } from '../../components/common/button/Button';
import './login-page.scss';

export const LoginPage = () => {
    const [showModal, setShowModal] = useState(false);
    const onClickHandler = () => setShowModal(false);

    return (
        <div className="page-layout">
            <LoginForm setShowErrorModal={setShowModal} />

            <Modal isOpen={showModal} onClose={onClickHandler}>
                <Modal.Title>{ERROR_MODAL_TITLE}</Modal.Title>
                <Modal.Content>{ERROR_MODAL_CONTENT}</Modal.Content>
                <Modal.Actions>
                    <Button buttonStyle="primary" onClick={onClickHandler}>
                        {ERROR_MODAL_BUTTON}
                    </Button>
                </Modal.Actions>
            </Modal>
        </div>
    );
};
