import { VisibilityStatus } from '@app-types/admin/common';
import React from 'react';
import { COMMON_TEXT_ADMIN } from '@const/admin/common';
import { ConfirmationModal } from '@components/admin/confirmation-modal/ConfirmationModal';
import { Modal } from '@components/common/modal/Modal';
import { Button } from '@components/admin/button/Button';

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
    buttonStates: {
        draftValid: boolean;
        publishValid: boolean;
    };
    onClose: () => void;
    onFormValidationChange: (isValid: boolean) => void;
    onFormSubmit: (data: TFormValues, status: VisibilityStatus) => void;
    onDraftSubmit: () => void;
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
    categories?: any[];
}

export const GenericModalWrapper = <TFormValues, TFormRef>({
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
    buttonStates,
    onClose,
    onFormValidationChange,
    onFormSubmit,
    onDraftSubmit,
    onPublishSubmit,
    onConfirmAction,
    onCancelConfirmation,
    onConfirmClose,
    onCancelClose,
    renderForm,
    categories,
}: GenericModalWrapperProps<TFormValues, TFormRef>) => {
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
                        ...(categories && { categories }),
                    })}
                    {error && <div className="modal-content-error-container">{error}</div>}
                </Modal.Content>
                <Modal.Actions>
                    <Button
                        buttonStyle="secondary"
                        onClick={onDraftSubmit}
                        disabled={isSubmitting || !buttonStates.draftValid}
                    >
                        {COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_DRAFT}
                    </Button>
                    <Button
                        buttonStyle="primary"
                        onClick={onPublishSubmit}
                        disabled={isSubmitting || !buttonStates.publishValid}
                    >
                        {COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_PUBLISHED}
                    </Button>
                </Modal.Actions>
            </Modal>

            <ConfirmationModal
                isOpen={showFormConfirmModal}
                isButtonsDisabled={isSubmitting}
                title={formConfirmTitle}
                onConfirm={onConfirmAction}
                onCancel={onCancelConfirmation}
                onClose={onCancelConfirmation}
            />

            <ConfirmationModal
                isOpen={showCloseConfirmModal}
                isButtonsDisabled={false}
                title={COMMON_TEXT_ADMIN.QUESTION.CHANGES_WILL_BE_LOST_WISH_TO_CONTINUE}
                onConfirm={onConfirmClose}
                onCancel={onCancelClose}
                onClose={onCancelClose}
            />
        </>
    );
};
