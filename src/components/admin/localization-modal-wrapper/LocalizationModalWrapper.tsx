import { VisibilityStatus } from '../../../types/admin/common';
import React from 'react';
import { COMMON_TEXT_ADMIN } from '../../../const/admin/common';
import { ConfirmationModal } from '../confirmation-modal/ConfirmationModal';
import { Modal } from '../../common/modal/Modal';
import { Button } from '../button/Button';
import './LocalizationModalWrapper.scss';

interface GenericModalWrapperProps<TFormValues, TFormRef> {
    isOpen: boolean;
    title: string;
    formRef: React.RefObject<TFormRef>;
    formKey: string | number;
    initialData: TFormValues | null;
    isSubmitting: boolean;
    error: string;
    showFormConfirmModal: boolean;
    showCloseConfirmModal: boolean;
    formConfirmTitle: string;
    onClose: () => void;
    onFormValidationChange: (isValid: boolean) => void;
    onFormSubmit: (data: TFormValues, status: VisibilityStatus) => void;
    onPublishSubmit: () => void;
    onConfirmAction: () => void;
    onCancelConfirmation: () => void;
    onConfirmClose: () => void;
    onCancelClose: () => void;
    renderForm: (props: {
        ref: React.RefObject<TFormRef>;
        key: string | number;
        initialData: TFormValues | null;
        formDisabled: boolean;
        onSubmit: (data: TFormValues, status: VisibilityStatus) => void;
        onValidationChange: (isValid: boolean) => void;
    }) => React.ReactElement;
}

export const LocalizationModalWrapper = <TFormValues, TFormRef>({
    isOpen,
    title,
    formRef,
    formKey,
    initialData,
    isSubmitting,
    error,
    showFormConfirmModal,
    showCloseConfirmModal,
    formConfirmTitle,
    onClose,
    onFormValidationChange,
    onFormSubmit,
    onPublishSubmit,
    onConfirmAction,
    onCancelConfirmation,
    onConfirmClose,
    onCancelClose,
    renderForm,
}: GenericModalWrapperProps<TFormValues, TFormRef>) => {
    const handleCancel = () => {
        onCancelConfirmation();
        onClose();
    };

    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose}>
                <Modal.Title>{title}</Modal.Title>
                <Modal.Content>
                    {renderForm({
                        ref: formRef,
                        key: formKey,
                        initialData,
                        formDisabled: isSubmitting,
                        onSubmit: onFormSubmit,
                        onValidationChange: onFormValidationChange,
                    })}
                    {error && <div className="modal-content-error-container">{error}</div>}
                </Modal.Content>
                <Modal.Actions>
                    <Button
                        className="main-button"
                        buttonStyle="primary"
                        onClick={onPublishSubmit}
                        disabled={isSubmitting}
                    >
                        {COMMON_TEXT_ADMIN.BUTTON.SAVE_TRANSLATION}
                    </Button>
                </Modal.Actions>
            </Modal>

            <ConfirmationModal
                isOpen={showFormConfirmModal}
                isButtonsDisabled={isSubmitting}
                title={formConfirmTitle}
                onConfirm={onConfirmAction}
                onCancel={handleCancel}
                onClose={onClose}
                confirmText={COMMON_TEXT_ADMIN.BUTTON.YES}
                cancelText={COMMON_TEXT_ADMIN.BUTTON.NO}
            />

            <ConfirmationModal
                isOpen={showCloseConfirmModal}
                isButtonsDisabled={false}
                title={COMMON_TEXT_ADMIN.QUESTION.CHANGES_WILL_BE_LOST_WISH_TO_CONTINUE}
                onConfirm={onConfirmClose}
                onCancel={onCancelClose}
                onClose={onClose}
                confirmText={COMMON_TEXT_ADMIN.BUTTON.YES}
                cancelText={COMMON_TEXT_ADMIN.BUTTON.NO}
            />
        </>
    );
};
