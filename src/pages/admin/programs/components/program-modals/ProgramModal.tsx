import React from 'react';
import { Modal } from '../../../../../components/common/modal/Modal';
import { ProgramForm } from '../program-form/ProgramForm';
import { Program, ProgramCategory } from '../../../../../types/admin/Programs';
import { Button } from '../../../../../components/common/button/Button';
import { QuestionModal } from '../../../../../components/common/question-modal/QuestionModal';
import { PROGRAMS_TEXT } from '../../../../../const/admin/programs';
import { COMMON_TEXT_ADMIN } from '../../../../../const/admin/common';
import { useProgramModal } from '../../../../../hooks/admin/useProgramModal/useProgramModal';
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

    const { formRef, isSubmitting, error, initialData, pendingAction, modals, handleFormSubmit, handleClose } =
        useProgramModal({
            isOpen,
            program: isEditMode ? props.programToEdit : null,
            onSuccess: isEditMode ? props.onEditProgram : props.onAddProgram,
            onClose,
        });

    const getFormConfirmTitle = () => {
        if (isEditMode && props.programToEdit) {
            return props.programToEdit.status === 'Published' && pendingAction === 'draft'
                ? COMMON_TEXT_ADMIN.QUESTION.REMOVE_FROM_PUBLICATION
                : COMMON_TEXT_ADMIN.QUESTION.PUBLISH_CHANGES;
        }
        return PROGRAMS_TEXT.QUESTION.PUBLISH_PROGRAM;
    };

    const getFormKey = () => {
        if (isEditMode && props.programToEdit?.id) {
            return props.programToEdit.id;
        }
        return 'add';
    };

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
                    />
                    {error && <div className="error-container">{error}</div>}
                </Modal.Content>

                <Modal.Actions>
                    <Button
                        buttonStyle="secondary"
                        onClick={() => formRef.current?.submit('Draft')}
                        disabled={isSubmitting}
                    >
                        {COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_DRAFTED}
                    </Button>
                    <Button
                        buttonStyle="primary"
                        onClick={() => formRef.current?.submit('Published')}
                        disabled={isSubmitting}
                    >
                        {COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_PUBLISHED}
                    </Button>
                </Modal.Actions>
            </Modal>

            <QuestionModal
                isOpen={modals.formConfirm.isOpen}
                isSubmitting={isSubmitting}
                title={getFormConfirmTitle()}
                onConfirm={modals.formConfirm.onConfirm}
                onCancel={modals.formConfirm.onCancel}
                onClose={modals.formConfirm.onCancel}
                confirmText={COMMON_TEXT_ADMIN.BUTTON.YES}
                cancelText={COMMON_TEXT_ADMIN.BUTTON.NO}
            />

            <QuestionModal
                isOpen={modals.closeConfirm.isOpen}
                isSubmitting={false}
                title={COMMON_TEXT_ADMIN.QUESTION.CHANGES_WILL_BE_LOST_WISH_TO_CONTINUE}
                onConfirm={modals.closeConfirm.onConfirm}
                onCancel={modals.closeConfirm.onCancel}
                onClose={modals.closeConfirm.onCancel}
                confirmText={COMMON_TEXT_ADMIN.BUTTON.YES}
                cancelText={COMMON_TEXT_ADMIN.BUTTON.NO}
            />
        </>
    );
};
