import { useState } from 'react';
import { FaqQuestion } from '../../../../../../types/admin/faq';
import '../FaqModal.scss';
import { FaqApi } from '../../../../../../services/api/admin/faq/faq-api';
import axios from 'axios';
import { FAQ_TEXT } from '../../../../../../const/admin/faq';
import { Modal } from '../../../../../../components/common/modal/Modal';
import { COMMON_TEXT_ADMIN } from '../../../../../../const/admin/common';
import { Button } from '../../../../../../components/admin/button/Button';

export interface DeleteFaqModalProps {
    isOpen: boolean;
    onClose: () => void;
    onDeleteFaq: (faq: FaqQuestion) => void;
    faqToDelete: FaqQuestion | null;
}

export const DeleteFaqModal = ({ isOpen, onClose, onDeleteFaq, faqToDelete }: DeleteFaqModalProps) => {
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const handleConfirmDelete = async () => {
        if (!faqToDelete) return;

        try {
            setIsSubmitting(true);
            setError('');

            await FaqApi.delete(axios, faqToDelete.id);
            onDeleteFaq(faqToDelete);
            onClose();
        } catch {
            setError(FAQ_TEXT.FORM.MESSAGE.FAIL_TO_DELETE_FAQ);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        if (isSubmitting) return;
        setError('');
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} data-testid="delete-program-modal">
            <Modal.Title>{FAQ_TEXT.FORM.TITLE.DELETE_FAQ}</Modal.Title>
            <Modal.Content>{error && <div className="error-container">{error}</div>}</Modal.Content>
            <Modal.Actions>
                <Button onClick={handleClose} buttonStyle="secondary" disabled={isSubmitting}>
                    {COMMON_TEXT_ADMIN.BUTTON.CANCEL}
                </Button>
                <Button onClick={handleConfirmDelete} buttonStyle="primary" disabled={isSubmitting}>
                    {COMMON_TEXT_ADMIN.BUTTON.DELETE}
                </Button>
            </Modal.Actions>
        </Modal>
    );
};
