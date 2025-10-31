import { VisibilityStatus } from '../../../../types/admin/common';
import React from 'react';
import { COMMON_TEXT_ADMIN } from '../../../../const/admin/common';
import { Modal } from '../../../common/modal/Modal';
import { Button } from '../../button/Button';
import './LocalizationModalWrapper.scss';
import { ConfirmationModals, ConfirmationModalsProps } from '../confirmation-modals/ConfirmationModals';

interface GenericModalWrapperProps<TFormValues, TFormRef> extends ConfirmationModalsProps {
    isOpen: boolean;
    title: string;
    formRef: React.RefObject<TFormRef>;
    formKey: string | number;
    initialData: TFormValues | null;
    isSubmitting: boolean;
    error: string;
    onFormValidationChange: (isValid: boolean) => void;
    onFormSubmit: (data: TFormValues) => void;
    onPublishSubmit: () => void;
    renderForm: (props: {
        ref: React.RefObject<TFormRef>;
        key: string | number;
        initialData: TFormValues | null;
        formDisabled: boolean;
        onSubmit: (data: TFormValues) => void;
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

            <ConfirmationModals
                showFormConfirmModal={showFormConfirmModal}
                showCloseConfirmModal={showCloseConfirmModal}
                formConfirmTitle={formConfirmTitle}
                isSubmitting={isSubmitting}
                onConfirmClose={onConfirmClose}
                onCancelClose={onCancelClose}
                onCancelConfirmation={onCancelConfirmation}
                onConfirmAction={onConfirmAction}
                onClose={onClose}
            />
        </>
    );
};
