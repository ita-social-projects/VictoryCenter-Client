import React, {useRef, useState, useEffect, useMemo} from 'react';
import { ProgramForm, ProgramFormValues, ProgramFormRef } from "../program-form/ProgramForm";
import Modal from "../../../../../components/common/modal/Modal";
import Button from "../../../../../components/common/button/Button";
import QuestionModal from "../../../../../components/common/question-modal/QuestionModal";
import { Program } from '../../../../../types/ProgramAdminPage';
import ProgramsApi from '../../../../../services/api/admin/programs/programs-api';
import { PROGRAMS_TEXT } from "../../../../../const/admin/programs";
import { VisibilityStatus } from "../../../../../types/Common";
import { COMMON_TEXT_ADMIN } from "../../../../../const/admin/common";
import './program-modal.scss';

export const EditProgramModal = ({ isOpen, onClose, onEditProgram, programToEdit } : {
    isOpen: boolean;
    onClose: () => void;
    onEditProgram: (program: Program) => void;
    programToEdit: Program | null;
}) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [showFormConfirmModal, setShowFormConfirmModal] = useState(false);
    const [showCloseConfirmModal, setShowCloseConfirmModal] = useState(false);
    const [pendingAction, setPendingAction] = useState<'publish' | 'draft' | null>(null);
    const [pendingFormData, setPendingFormData] = useState<ProgramFormValues | null>(null);
    const formRef = useRef<ProgramFormRef>(null);

    const initialData = useMemo<ProgramFormValues | null>(() => {
        if (!programToEdit) {
            return null;
        }
        return {
            name: programToEdit.name,
            description: programToEdit.description,
            categories: programToEdit.categories,
            img: programToEdit.img,
        };
    }, [programToEdit]);

    const handleFormSubmit = async (data: ProgramFormValues, status: VisibilityStatus) => {
        setPendingFormData(data);
        setPendingAction(status === 'Published' ? 'publish' : 'draft');
        setShowFormConfirmModal(true);
    };

    const handleConfirmAction = async () => {
        if (!pendingFormData || !pendingAction || !programToEdit) return;

        setShowFormConfirmModal(false);
        setIsSubmitting(true);
        setError('');

        try {
            const status: VisibilityStatus = pendingAction === 'publish' ? 'Published' : 'Draft';

            const programToUpdate = {
                id: programToEdit.id,
                name: pendingFormData.name,
                description: pendingFormData.description,
                categoryIds: pendingFormData.categories.map(cat => cat.id),
                status: status,
                img: pendingFormData.img
            };

            const updatedProgram = await ProgramsApi.editProgram(programToUpdate);
            onEditProgram(updatedProgram);

            setPendingAction(null);
            setPendingFormData(null);
            onClose();
        } catch (err) {
            setError(PROGRAMS_TEXT.FORM.MESSAGE.FAIL_TO_UPDATE_CATEGORY);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancelConfirmation = () => {
        setShowFormConfirmModal(false);
        setPendingAction(null);
        setPendingFormData(null);
        setIsSubmitting(false);
    };

    const handleClose = () => {
        if (formRef.current?.isDirty) {
            setShowCloseConfirmModal(true);
            return;
        }

        setError('');
        setShowFormConfirmModal(false);
        setPendingAction(null);
        setPendingFormData(null);
        onClose();
    };

    const handleConfirmClose = () => {
        setShowCloseConfirmModal(false);
        setError('');
        setShowFormConfirmModal(false);
        setPendingAction(null);
        setPendingFormData(null);
        onClose();
    };

    const handleCancelClose = () => {
        setShowCloseConfirmModal(false);
    };

    useEffect(() => {
        if (isOpen) {
            setError('');
            setShowFormConfirmModal(false);
            setShowCloseConfirmModal(false);
            setPendingAction(null);
            setPendingFormData(null);
        }
    }, [isOpen]);

    return (
        <>
            <Modal isOpen={isOpen} onClose={handleClose}>
                <Modal.Title>{PROGRAMS_TEXT.FORM.TITLE.EDIT_PROGRAM}</Modal.Title>
                <Modal.Content>
                    {initialData && (
                        <ProgramForm
                            ref={formRef}
                            initialData={initialData}
                            formDisabled={isSubmitting}
                            onSubmit={handleFormSubmit}
                        />
                    )}
                    {error && <div className='error-container'>{error}</div>}
                </Modal.Content>
                <Modal.Actions>
                    <Button
                        buttonStyle='secondary'
                        onClick={() => formRef.current?.submit('Draft')}
                        disabled={isSubmitting}
                    >
                        {COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_DRAFTED}
                    </Button>
                    <Button
                        buttonStyle='primary'
                        onClick={() => formRef.current?.submit('Published')}
                        disabled={isSubmitting}
                    >
                        {COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_PUBLISHED}
                    </Button>
                </Modal.Actions>
            </Modal>

            <QuestionModal
                isOpen={showFormConfirmModal}
                isSubmitting={isSubmitting}
                title={ programToEdit?.status === 'Published' && pendingAction === 'draft'
                    ? COMMON_TEXT_ADMIN.QUESTION.REMOVE_FROM_PUBLICATION
                    : COMMON_TEXT_ADMIN.QUESTION.PUBLISH_CHANGES}
                confirmText={COMMON_TEXT_ADMIN.BUTTON.YES}
                cancelText={COMMON_TEXT_ADMIN.BUTTON.NO}
                onClose={handleCancelConfirmation}
                onConfirm={handleConfirmAction}
                onCancel={handleCancelConfirmation}
            />

            <QuestionModal
                isOpen={showCloseConfirmModal}
                isSubmitting={false}
                title={COMMON_TEXT_ADMIN.QUESTION.CHANGES_WILL_BE_LOST_WISH_TO_CONTINUE}
                confirmText={COMMON_TEXT_ADMIN.BUTTON.YES}
                cancelText={COMMON_TEXT_ADMIN.BUTTON.NO}
                onClose={handleCancelClose}
                onConfirm={handleConfirmClose}
                onCancel={handleCancelClose}
            />
        </>
    );
};
