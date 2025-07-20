import React, { useRef, useState, useEffect } from 'react';
import Modal from "../../../../../components/common/modal/Modal";
import { ProgramForm, ProgramFormValues, ProgramFormRef } from "../program-form/ProgramForm";
import {Program, ProgramCreateUpdate} from '../../../../../types/ProgramAdminPage';
import ProgramsApi from '../../../../../services/api/admin/programs/programs-api';
import Button from "../../../../../components/common/button/Button";
import QuestionModal from "../../../../../components/common/question-modal/QuestionModal";
import {VisibilityStatus} from "../../../../../types/Common";
import {PROGRAMS_TEXT} from "../../../../../const/admin/programs";
import {COMMON_TEXT_ADMIN} from "../../../../../const/admin/common";

export const AddProgramModal = ({ isOpen, onClose, onAddProgram } : {
    isOpen: boolean;
    onClose: () => void;
    onAddProgram: (program: Program) => void;
}) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [showFormConfirmModal, setShowFormConfirmModal] = useState(false);
    const [showCloseConfirmModal, setShowCloseConfirmModal] = useState(false);
    const [pendingAction, setPendingAction] = useState<'publish' | 'draft' | null>(null);
    const [pendingFormData, setPendingFormData] = useState<ProgramFormValues | null>(null);
    const formRef = useRef<ProgramFormRef>(null);

    const handleFormSubmit = async (data: ProgramFormValues, status: VisibilityStatus) => {
        setPendingFormData(data);
        setPendingAction(status === 'Published' ? 'publish' : 'draft');
        setShowFormConfirmModal(true);
    };

    const handleConfirmAction = async () => {
        if (!pendingFormData || !pendingAction) return;

        setShowFormConfirmModal(false);
        setIsSubmitting(true);
        setError('');

        try {
            const status: VisibilityStatus = pendingAction === 'publish' ? 'Published' : 'Draft';

            const programToCreate: ProgramCreateUpdate = {
                name: pendingFormData.name,
                description: pendingFormData.description,
                categoryIds: pendingFormData.categories.map(cat => cat.id),
                img: pendingFormData.img,
                status: status,
            };

            const newProgram = await ProgramsApi.addProgram(programToCreate);
            onAddProgram(newProgram);

            setPendingAction(null);
            setPendingFormData(null);
            onClose();
        } catch (err) {
            // Or handle in other way
            setError(PROGRAMS_TEXT.FORM.MESSAGE.FAIL_TO_CREATE_CATEGORY);
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

    // Reset state on Modal open/close
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
                <Modal.Title>{PROGRAMS_TEXT.FORM.TITLE.ADD_PROGRAM}</Modal.Title>
                <Modal.Content>
                    <ProgramForm
                        ref={formRef}
                        formDisabled={isSubmitting}
                        onSubmit={handleFormSubmit}
                    />
                    {error && <span className='error'>{error}</span>}
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
                title={PROGRAMS_TEXT.QUESTION.PUBLISH_PROGRAM}
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
