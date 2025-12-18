import React from 'react';
import { VisibilityStatus } from '@/types/admin/common';
import { ButtonValidationState } from '@/hooks/admin/use-generic-modal/useGenericModal';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { ConfirmationModal } from '@/components/admin/confirmation-modal/ConfirmationModal';
import { Modal } from '@/components/common/modal/Modal';
import { Button } from '@/components/admin/button/Button';

interface GenericModalWrapperProps<TFormValues, TFormRef> {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    fullScreen?: boolean;
    formRef: React.RefObject<TFormRef>;
    formKey: string | number;
    initialData: TFormValues | null;
    renderForm: (props: {
        ref: React.RefObject<TFormRef>;
        key: string | number;
        initialData: TFormValues | null;
        formDisabled: boolean;
        onSubmit: (data: TFormValues, status: VisibilityStatus) => void;
        onValidationChange: (isValid: boolean) => void;
    }) => React.ReactElement;
    categories?: any[];
    isSubmitting: boolean;
    error: string;
    buttonStates: ButtonValidationState;
    onDraftSubmit: () => void;
    onPublishSubmit: () => void;
    onFormSubmit: (data: TFormValues, status: VisibilityStatus) => void;
    onFormValidationChange: (isValid: boolean) => void;
    isActionConfirmationOpen: boolean;
    actionConfirmationTitle: string;
    onActionConfirm: () => void;
    onActionCancel: () => void;
    isExitConfirmationOpen: boolean;
    onExitConfirm: () => void;
    onExitCancel: () => void;
}

export const GenericModalWrapper = <TFormValues, TFormRef>({
    isOpen,
    title,
    formRef,
    formKey,
    initialData,
    isSubmitting,
    error,
    isActionConfirmationOpen,
    isExitConfirmationOpen,
    actionConfirmationTitle,
    buttonStates,
    onClose,
    onFormValidationChange,
    onFormSubmit,
    onDraftSubmit,
    onPublishSubmit,
    onActionConfirm,
    onActionCancel,
    onExitConfirm,
    onExitCancel,
    renderForm,
    categories,
    fullScreen = false,
}: GenericModalWrapperProps<TFormValues, TFormRef>) => {
    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose} fullscreen={fullScreen}>
                {title && <Modal.Title>{title}</Modal.Title>}
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
                        disabled={isSubmitting || !buttonStates.isDraftValid}
                    >
                        {COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_DRAFT}
                    </Button>
                    <Button
                        buttonStyle="primary"
                        onClick={onPublishSubmit}
                        disabled={isSubmitting || !buttonStates.isPublishValid}
                    >
                        {COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_PUBLISHED}
                    </Button>
                </Modal.Actions>
            </Modal>

            <ConfirmationModal
                isOpen={isActionConfirmationOpen}
                title={actionConfirmationTitle}
                isButtonsDisabled={isSubmitting}
                onConfirm={onActionConfirm}
                onCancel={onActionCancel}
                onClose={onActionCancel}
                confirmText={COMMON_TEXT_ADMIN.BUTTON.YES}
                cancelText={COMMON_TEXT_ADMIN.BUTTON.NO}
            />

            <ConfirmationModal
                isOpen={isExitConfirmationOpen}
                title={COMMON_TEXT_ADMIN.QUESTION.CHANGES_WILL_BE_LOST_WISH_TO_CONTINUE}
                isButtonsDisabled={false}
                onConfirm={onExitConfirm}
                onCancel={onExitCancel}
                onClose={onExitCancel}
                confirmText={COMMON_TEXT_ADMIN.BUTTON.YES}
                cancelText={COMMON_TEXT_ADMIN.BUTTON.NO}
            />
        </>
    );
};
