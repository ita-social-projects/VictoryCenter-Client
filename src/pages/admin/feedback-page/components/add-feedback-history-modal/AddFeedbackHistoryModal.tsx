import { useMemo } from 'react';
import { FEEDBACK_TEXT } from '@/const/admin/feedback';
import { ModalMode, VisibilityStatus } from '@/types/admin/common';
import { FeedbackHistoryDto } from '@/types/admin/feedback';
import { FeedbackHistoryFormValues } from '@/validation/admin/feedback-history-schema/feedback-history-schema';
import { getNormalizedInputText } from '@/utils/functions/formatters/text-formatters';
import { FeedbackHistoryForm } from '../feedback-history-form/FeedbackHistoryForm';
import { FeedbackFormModal, FeedbackModalProps } from '../feedback-form-modal/FeedbackFormModal';
import styles from './AddFeedbackHistoryModal.module.scss';

export interface FeedbackHistoryPayload {
    title: string;
    story: string;
    image: FeedbackHistoryFormValues['image'];
    status: VisibilityStatus;
}

export interface AddFeedbackHistoryModalProps extends FeedbackModalProps<FeedbackHistoryDto, FeedbackHistoryPayload> {
    historyToEdit?: FeedbackHistoryDto;
}

const toHistoryPayload = (formData: FeedbackHistoryFormValues, status: VisibilityStatus): FeedbackHistoryPayload => ({
    title: getNormalizedInputText(formData.title),
    story: getNormalizedInputText(formData.story),
    image: formData.image,
    status,
});

export const AddFeedbackHistoryModal = ({ historyToEdit, ...modalProps }: AddFeedbackHistoryModalProps) => {
    const isEditMode = modalProps.mode === ModalMode.Edit;

    const initialData = useMemo<FeedbackHistoryFormValues | null>(
        () =>
            isEditMode && historyToEdit
                ? { title: historyToEdit.title, story: historyToEdit.story, image: historyToEdit.image }
                : null,
        [isEditMode, historyToEdit],
    );

    return (
        <FeedbackFormModal
            {...modalProps}
            entity={historyToEdit}
            title={isEditMode ? FEEDBACK_TEXT.EDIT_HISTORY_MODAL.TITLE : FEEDBACK_TEXT.ADD_HISTORY_MODAL.TITLE}
            className={styles['add-feedback-history-modal']}
            initialData={initialData}
            transformFormData={toHistoryPayload}
            renderForm={({ key, ...formProps }) => <FeedbackHistoryForm key={key} {...formProps} />}
        />
    );
};
