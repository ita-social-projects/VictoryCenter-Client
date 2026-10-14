import { ReactElement, RefObject, useMemo } from 'react';
import cn from 'classnames';
import { GenericModalWrapper } from '@/components/admin/generic-modal-wrapper/GenericModalWrapper';
import { GenericFormRef, GenericFormValues, useGenericModal } from '@/hooks/admin/use-generic-modal/useGenericModal';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { FEEDBACK_TEXT } from '@/const/admin/feedback';
import { ModalMode, VisibilityStatus } from '@/types/admin/common';

export interface FeedbackModalProps<TEntity, TPayload> {
    mode: ModalMode;
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (payload: TPayload, entity?: TEntity) => Promise<TEntity>;
    onSuccess: (entity: TEntity, mode: ModalMode) => void;
    onError: (mode: ModalMode) => void;
}

interface FeedbackFormRenderProps<TFormValues> {
    ref: RefObject<GenericFormRef | null>;
    key: string | number;
    initialData: TFormValues | null;
    formDisabled: boolean;
    onSubmit: (data: TFormValues, status: VisibilityStatus) => void;
    onValidationChange: (isValid: boolean) => void;
}

interface FeedbackFormModalProps<TFormValues, TEntity, TPayload> extends FeedbackModalProps<TEntity, TPayload> {
    entity?: TEntity;
    title: string;
    className?: string;
    initialData: TFormValues | null;
    transformFormData: (formData: TFormValues, status: VisibilityStatus) => TPayload;
    renderForm: (props: FeedbackFormRenderProps<TFormValues>) => ReactElement;
}

const getConfirmTitle = (mode: ModalMode): string =>
    mode === ModalMode.Edit ? COMMON_TEXT_ADMIN.QUESTION.PUBLISH_CHANGES : FEEDBACK_TEXT.PUBLISH_MODAL.TITLE_NEW;

const getErrorMessage = (): string => '';

const getFormKey = (mode: ModalMode, entity?: { id: number }): string | number =>
    mode === ModalMode.Edit && entity ? entity.id : 'add';

export const FeedbackFormModal = <
    TFormValues extends GenericFormValues,
    TEntity extends { id: number; status: VisibilityStatus },
    TPayload,
>({
    mode,
    isOpen,
    onClose,
    onSubmit,
    onSuccess,
    onError,
    entity,
    title,
    className,
    initialData,
    transformFormData,
    renderForm,
}: FeedbackFormModalProps<TFormValues, TEntity, TPayload>) => {
    const modalConfig = useMemo(
        () => ({
            mode,
            isOpen,
            onClose,
            entity,
            onSuccess: (savedEntity: TEntity) => onSuccess(savedEntity, mode),
            apiCall: async (payload: TPayload) => {
                try {
                    return await onSubmit(payload, entity);
                } catch (error) {
                    onError(mode);
                    throw error;
                }
            },
            getConfirmTitle,
            getErrorMessage,
            getFormKey,
            transformFormData: (formData: TFormValues, status: VisibilityStatus, editedEntity?: TEntity) =>
                transformFormData(formData, editedEntity?.status ?? status),
        }),
        [mode, isOpen, onClose, entity, onSuccess, onSubmit, onError, transformFormData],
    );

    const modalHookData = useGenericModal<TFormValues, TEntity>(modalConfig);

    return (
        <GenericModalWrapper
            isOpen={isOpen}
            title={title}
            className={cn('feedback-form-modal', className)}
            showDraftButton={false}
            onClose={modalHookData.handleClose}
            onFormValidationChange={modalHookData.handleFormValidationChange}
            onFormSubmit={modalHookData.handleFormSubmit}
            onDraftSubmit={modalHookData.handleDraftSubmit}
            onPublishSubmit={modalHookData.handlePublishSubmit}
            onExitConfirm={modalHookData.handleConfirmClose}
            onExitCancel={modalHookData.handleCancelClose}
            onActionConfirm={modalHookData.handleConfirmAction}
            onActionCancel={modalHookData.handleCancelConfirmation}
            formRef={modalHookData.formRef}
            formKey={modalHookData.formKey}
            buttonStates={modalHookData.buttonStates}
            isSubmitting={modalHookData.isSubmitting}
            error={modalHookData.error}
            isActionConfirmationOpen={modalHookData.showFormConfirmModal}
            isExitConfirmationOpen={modalHookData.showCloseConfirmModal}
            actionConfirmationTitle={modalHookData.formConfirmTitle}
            initialData={initialData}
            renderForm={renderForm}
        />
    );
};
