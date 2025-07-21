import React, { useState } from 'react';
import { Modal } from "../../../../../components/common/modal/Modal";
import { Button } from "../../../../../components/common/button/Button";
import { Program } from '../../../../../types/ProgramAdminPage';
import ProgramsApi from '../../../../../services/api/admin/programs/programs-api';
import { PROGRAMS_TEXT } from "../../../../../const/admin/programs";
import {COMMON_TEXT_ADMIN} from "../../../../../const/admin/common";
import './program-modal.scss';

export const DeleteProgramModal = ({
    isOpen,
    onClose,
    onDeleteProgram,
    programToDelete,
}: {
    isOpen: boolean;
    onClose: () => void;
    onDeleteProgram: (program: Program) => void;
    programToDelete: Program | null;
}) => {
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const handleConfirmDelete = async () => {
        if (!programToDelete) return;

        try {
            setIsSubmitting(true);
            setError('');

            await ProgramsApi.deleteProgram(programToDelete.id);
            onDeleteProgram(programToDelete);
            onClose();
        } catch (error) {
            // Or handle in other way
            setError(PROGRAMS_TEXT.FORM.MESSAGE.FAIL_TO_DELETE_CATEGORY);
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
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            data-testid="delete-program-modal"
        >
            <Modal.Title>{PROGRAMS_TEXT.FORM.TITLE.DELETE_PROGRAM}</Modal.Title>
            <Modal.Content>
                {error && <div className='error-container'>{error}</div>}
            </Modal.Content>
            <Modal.Actions>
                <Button
                    onClick={handleClose}
                    buttonStyle="secondary"
                    disabled={isSubmitting}
                >
                    {COMMON_TEXT_ADMIN.BUTTON.CANCEL}
                </Button>
                <Button
                    onClick={handleConfirmDelete}
                    buttonStyle="primary"
                    disabled={isSubmitting}
                >
                    {COMMON_TEXT_ADMIN.BUTTON.DELETE}
                </Button>
            </Modal.Actions>
        </Modal>
    );
};

export default DeleteProgramModal;
