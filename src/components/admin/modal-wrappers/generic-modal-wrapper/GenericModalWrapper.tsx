import { VisibilityStatus } from '../../../../types/admin/common';
import React from 'react';
import { COMMON_TEXT_ADMIN } from '../../../../const/admin/common';
import { Modal } from '../../../common/modal/Modal';
import { Button } from '../../button/Button';
import { ConfirmationModals, ConfirmationModalsProps } from '../confirmation-modals/ConfirmationModals';

interface GenericModalWrapperProps<TFormValues, TFormRef> extends ConfirmationModalsProps {
    isOpen: boolean;
    title: string;
    formRef: React.RefObject<TFormRef>;
    formKey: string | number;
    initialData: TFormValues | null;
    error: string;
    buttonStates: {
        draftValid: boolean;
        publishValid: boolean;
    };
    onFormValidationChange: (isValid: boolean) => void;
    onFormSubmit: (data: TFormValues, status: VisibilityStatus) => void;
    onDraftSubmit: () => void;
    onPublishSubmit: () => void;
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
