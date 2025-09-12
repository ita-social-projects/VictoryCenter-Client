import React, { useState } from 'react';
import { COMMON_IMAGE_TEXT } from '../../../../const/admin/image';
import { Modal } from '../../../common/modal/Modal';
import { Button } from '../../button/Button';
import { COMMON_TEXT_ADMIN } from '../../../../const/admin/common';

interface DeleteImageModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: () => void;
}

export const DeleteImageModal = ({ isOpen, onClose, onSubmit }: DeleteImageModalProps) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <Modal.Title>{COMMON_IMAGE_TEXT.DELETE.TITLE}</Modal.Title>
            <Modal.Actions>
                <Button
                    onClick={(e) => {
                        e.stopPropagation(); // Stop the click event here
                        onClose();
                    }}
                    buttonStyle="secondary"
                >
                    {COMMON_TEXT_ADMIN.BUTTON.NO}
                </Button>
                <Button
                    onClick={(e) => {
                        e.stopPropagation(); // Stop the click event here
                        onSubmit();
                    }}
                    buttonStyle="primary"
                    className="btn-danger"
                >
                    {COMMON_TEXT_ADMIN.BUTTON.YES}
                </Button>
            </Modal.Actions>
        </Modal>
    );
};
