import { useMemo } from 'react';
import cn from 'classnames';
import { GenericModalWrapper } from '@/components/admin/generic-modal-wrapper/GenericModalWrapper';
import { useGenericModal } from '@/hooks/admin/use-generic-modal/useGenericModal';
import { FEEDBACK_TEXT } from '@/const/admin/feedback';
import { ModalMode, VisibilityStatus } from '@/types/admin/common';
import { FeedbackHistoryDto } from '@/types/admin/feedback';
import { FeedbackHistoryFormValues } from '@/validation/admin/feedback-history-schema/feedback-history-schema';
import { getNormalizedInputText } from '@/utils/functions/formatters/text-formatters';
import { FeedbackHistoryForm, FeedbackHistoryFormRef } from '../feedback-history-form/FeedbackHistoryForm';
import {
    getFeedbackConfirmTitle,
    getFeedbackErrorMessage,
    getFeedbackFormKey,
} from '../feedback-modal-config/feedbackModalConfig';
import styles from './AddFeedbackHistoryModal.module.scss';

export interface FeedbackHistoryPayload {
    title: string;
    story: string;
    image: FeedbackHistoryFormValues['image'];
    status: VisibilityStatus;
}

export interface AddFeedbackHistoryModalProps {
    mode: ModalMode;
    isOpen: boolean;
    onClose: () => void;
    historyToEdit?: FeedbackHistoryDto;
    onSubmit: (payload: FeedbackHistoryPayload, historyToEdit?: FeedbackHistoryDto) => Promise<FeedbackHistoryDto>;
    onSuccess: (history: FeedbackHistoryDto, mode: ModalMode) => void;
}

export const AddFeedbackHistoryModal = ({
    mode,
    isOpen,
    onClose,
    historyToEdit,
    onSubmit,
    onSuccess,
}: AddFeedbackHistoryModalProps) => {
    const isEditMode = mode === ModalMode.Edit;

    const modalConfig = useMemo(
        () => ({
            mode,
            isOpen,
            onClose,
            entity: historyToEdit,
            onSuccess: (history: FeedbackHistoryDto) => onSuccess(history, mode),
            apiCall: (payload: FeedbackHistoryPayload) => onSubmit(payload, historyToEdit),
            getConfirmTitle: getFeedbackConfirmTitle,
            getErrorMessage: getFeedbackErrorMessage,
            getFormKey: getFeedbackFormKey,
            transformFormData: (
                formData: FeedbackHistoryFormValues,
                status: VisibilityStatus,
            ): FeedbackHistoryPayload => ({
                title: getNormalizedInputText(formData.title),
                story: getNormalizedInputText(formData.story),
                image: formData.image,
                status,
            }),
        }),
        [mode, isOpen, onClose, historyToEdit, onSubmit, onSuccess],
    );

    const modalHookData = useGenericModal<FeedbackHistoryFormValues, FeedbackHistoryDto, FeedbackHistoryFormRef>(
        modalConfig,
    );

    const initialData = useMemo<FeedbackHistoryFormValues | null>(
        () =>
            isEditMode && historyToEdit
                ? { title: historyToEdit.title, story: historyToEdit.story, image: historyToEdit.image }
                : null,
        [isEditMode, historyToEdit],
    );

    const title = isEditMode ? FEEDBACK_TEXT.EDIT_HISTORY_MODAL.TITLE : FEEDBACK_TEXT.ADD_HISTORY_MODAL.TITLE;

    return (
        <GenericModalWrapper
            isOpen={isOpen}
            title={title}
            className={cn('feedback-form-modal', styles['add-feedback-history-modal'])}
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
            renderForm={(props) => (
                <FeedbackHistoryForm
                    ref={modalHookData.formRef}
                    key={props.key}
                    initialData={initialData}
                    formDisabled={props.formDisabled}
                    onSubmit={props.onSubmit}
                    onValidationChange={props.onValidationChange}
                />
            )}
        />
    );
};
