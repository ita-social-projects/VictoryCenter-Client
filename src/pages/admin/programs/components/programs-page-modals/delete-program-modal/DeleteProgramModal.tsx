import { useState } from 'react';
import { Modal } from '@/components/common/modal/Modal';
import { Button } from '@/components/admin/button/Button';
import { HippotherapyProgram } from '@/types/admin/programs';
import { ProgramsApi } from '@/services/api/admin/programs/programs-api';
import { PROGRAMS_TEXT } from '@/const/admin/programs';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { useAdminClient } from '@/hooks/admin/use-admin-client/useAdminClient';
import './DeleteProgramModal.scss';

export interface DeleteProgramModalProps {
    isOpen: boolean;
    onClose: () => void;
    onDeleteProgram: (program: HippotherapyProgram) => void;
    programToDelete: HippotherapyProgram | null;
}

export const DeleteProgramModal = ({ isOpen, onClose, onDeleteProgram, programToDelete }: DeleteProgramModalProps) => {
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const client = useAdminClient();

    const handleConfirmDelete = async () => {
        if (!programToDelete) return;

        try {
            setIsSubmitting(true);
            setError('');

            await ProgramsApi.deleteProgram(programToDelete.id, client);
            onDeleteProgram(programToDelete);
            onClose();
        } catch {
            setError(PROGRAMS_TEXT.FORM.MESSAGE.FAIL_TO_DELETE_PROGRAM);
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
            <Modal.Title>{PROGRAMS_TEXT.FORM.TITLE.DELETE_PROGRAM}</Modal.Title>
            <Modal.Content>{error && <div className="delete-program-error-container">{error}</div>}</Modal.Content>
            <Modal.Actions>
                <Button onClick={handleClose} buttonStyle="secondary" disabled={isSubmitting}>
                    {COMMON_TEXT_ADMIN.BUTTON.NO}
                </Button>
                <Button onClick={handleConfirmDelete} buttonStyle="primary" disabled={isSubmitting}>
                    {COMMON_TEXT_ADMIN.BUTTON.YES}
                </Button>
            </Modal.Actions>
        </Modal>
    );
};
