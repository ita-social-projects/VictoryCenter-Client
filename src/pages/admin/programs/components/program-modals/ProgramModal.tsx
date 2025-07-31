import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Modal } from '../../../../../components/common/modal/Modal';
import { ProgramForm, ProgramFormRef, ProgramFormValues } from '../program-form/ProgramForm';
import { Program, ProgramCategory, ProgramCreateUpdate } from '../../../../../types/admin/Programs';
import { VisibilityStatus } from '../../../../../types/admin/Common';
import { Button } from '../../../../../components/common/button/Button';
import { QuestionModal } from '../../../../../components/common/question-modal/QuestionModal';
import { PROGRAMS_TEXT } from '../../../../../const/admin/programs';
import { COMMON_TEXT_ADMIN } from '../../../../../const/admin/common';
import { ProgramsApi } from '../../../../../services/api/admin/programs/programs-api';
import './program-modal.scss';

type BaseProps = {
    isOpen: boolean;
    onClose: () => void;
    categories: ProgramCategory[];
};

type AddModalProps = {
    mode: 'add';
    onAddProgram: (program: Program) => void;
};

type EditModalProps = {
    mode: 'edit';
    programToEdit: Program;
    onEditProgram: (program: Program) => void;
};

export type ProgramModalProps = BaseProps & (AddModalProps | EditModalProps);

export const ProgramModal = (props: ProgramModalProps) => {
    const { isOpen, onClose, mode, categories } = props;
    const isEditMode = mode === 'edit';
    const program = isEditMode ? props.programToEdit : null;
    const onSuccess = isEditMode ? props.onEditProgram : props.onAddProgram;

    const formRef = useRef<ProgramFormRef>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [showFormConfirmModal, setShowFormConfirmModal] = useState(false);
    const [showCloseConfirmModal, setShowCloseConfirmModal] = useState(false);
    const [pendingAction, setPendingAction] = useState<'publish' | 'draft' | null>(null);
    const [pendingFormData, setPendingFormData] = useState<ProgramFormValues | null>(null);
    const [isFormValid, setIsFormValid] = useState(false);

    const initialData = useMemo<ProgramFormValues | null>(() => {
        if (!isEditMode || !program) return null;

        return {
            name: program.name,
            description: program.description,
            categories: program.categories,
            img: program.img,
        };
    }, [program, isEditMode]);

    useEffect(() => {
        if (!isOpen) return;
        setError('');
        setShowFormConfirmModal(false);
        setShowCloseConfirmModal(false);
        setPendingAction(null);
        setPendingFormData(null);
        setIsFormValid(false);
    }, [isOpen]);

    const handleFormValidationChange = (isValid: boolean) => {
        setIsFormValid(isValid);
    };

    const handleFormSubmit = (data: ProgramFormValues, status: VisibilityStatus) => {
        const currentIsValid = formRef.current?.isValid(false) || false;

        if (!currentIsValid) {
            return;
        }

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
            const programData: ProgramCreateUpdate = {
                id: isEditMode && program ? program.id : null,
                name: pendingFormData.name,
                description: pendingFormData.description,
                categoryIds: pendingFormData.categories.map((cat) => cat.id),
                img: pendingFormData.img,
                status: status,
            };

            const resultProgram = isEditMode
                ? await ProgramsApi.editProgram(programData)
                : await ProgramsApi.addProgram(programData);

            onSuccess(resultProgram);
            onClose();
        } catch {
            const errorMessage = isEditMode
                ? PROGRAMS_TEXT.FORM.MESSAGE.FAIL_TO_UPDATE_PROGRAM
                : PROGRAMS_TEXT.FORM.MESSAGE.FAIL_TO_CREATE_PROGRAM;
            setError(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetPendingState = () => {
        setPendingAction(null);
        setPendingFormData(null);
    };

    const handleCancelConfirmation = () => {
        setShowFormConfirmModal(false);
        resetPendingState();
        setIsSubmitting(false);
    };

    const handleClose = () => {
        if (formRef.current?.isDirty()) {
            setShowCloseConfirmModal(true);
        } else if (!isSubmitting) {
            onClose();
        }
    };

    const handleConfirmClose = () => {
        setShowCloseConfirmModal(false);
        onClose();
    };

    const handleCancelClose = () => {
        setShowCloseConfirmModal(false);
    };

    const getFormConfirmTitle = () => {
        if (isEditMode && program) {
            if (program.status === 'Published')
                return pendingAction === 'draft'
                    ? COMMON_TEXT_ADMIN.QUESTION.REMOVE_FROM_PUBLICATION
                    : COMMON_TEXT_ADMIN.QUESTION.PUBLISH_CHANGES;
            return pendingAction === 'draft'
                ? COMMON_TEXT_ADMIN.QUESTION.SAVE_CHANGES
                : PROGRAMS_TEXT.QUESTION.PUBLISH_PROGRAM;
        }
        return pendingAction === 'publish'
            ? PROGRAMS_TEXT.QUESTION.PUBLISH_PROGRAM
            : PROGRAMS_TEXT.QUESTION.DRAFT_PROGRAM;
    };

    const getFormKey = () => {
        if (isEditMode && program?.id) {
            return program.id;
        }
        return 'add';
    };

    const isDraftDisabled = isSubmitting || !isFormValid;
    const isPublishDisabled = isSubmitting || !isFormValid;

    return (
        <>
            <Modal isOpen={isOpen} onClose={handleClose}>
                <Modal.Title>
                    {isEditMode ? PROGRAMS_TEXT.FORM.TITLE.EDIT_PROGRAM : PROGRAMS_TEXT.FORM.TITLE.ADD_PROGRAM}
                </Modal.Title>

                <Modal.Content>
                    <ProgramForm
                        ref={formRef}
                        key={getFormKey()}
                        initialData={initialData}
                        formDisabled={isSubmitting}
                        onSubmit={handleFormSubmit}
                        categories={categories}
                        onValidationChange={handleFormValidationChange}
                    />
                    {error && <div className="error-container">{error}</div>}
                </Modal.Content>

                <Modal.Actions>
                    <Button
                        buttonStyle="secondary"
                        onClick={() => formRef.current?.submit('Draft')}
                        disabled={isDraftDisabled}
                    >
                        {COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_DRAFTED}
                    </Button>
                    <Button
                        buttonStyle="primary"
                        onClick={() => formRef.current?.submit('Published')}
                        disabled={isPublishDisabled}
                    >
                        {COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_PUBLISHED}
                    </Button>
                </Modal.Actions>
            </Modal>

            <QuestionModal
                isOpen={showFormConfirmModal}
                isSubmitting={isSubmitting}
                title={getFormConfirmTitle()}
                onConfirm={handleConfirmAction}
                onCancel={handleCancelConfirmation}
                onClose={handleCancelConfirmation}
                confirmText={COMMON_TEXT_ADMIN.BUTTON.YES}
                cancelText={COMMON_TEXT_ADMIN.BUTTON.NO}
            />

            <QuestionModal
                isOpen={showCloseConfirmModal}
                isSubmitting={false}
                title={COMMON_TEXT_ADMIN.QUESTION.CHANGES_WILL_BE_LOST_WISH_TO_CONTINUE}
                onConfirm={handleConfirmClose}
                onCancel={handleCancelClose}
                onClose={handleCancelClose}
                confirmText={COMMON_TEXT_ADMIN.BUTTON.YES}
                cancelText={COMMON_TEXT_ADMIN.BUTTON.NO}
            />
        </>
    );
};
