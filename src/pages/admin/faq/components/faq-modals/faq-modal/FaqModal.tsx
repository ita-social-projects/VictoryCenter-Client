import { useMemo } from 'react';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { FAQ_TEXT } from '@/const/admin/faq';
import { useGenericModal } from '@/hooks/admin/use-generic-modal/useGenericModal';
import { FaqApi } from '@/services/api/admin/faq/faq-api';
import { VisibilityStatus, ModalMode, PendingAction } from '@/types/admin/common';
import { FaqCreateUpdate, FaqQuestion, VisitorPage } from '@/types/admin/faq';
import { FaqForm, FaqFormRef, FaqFormValues } from '../../faq-form/FaqForm';
import { GenericModalWrapper } from '@/components/admin/generic-modal-wrapper/GenericModalWrapper';
import { useAdminClient } from '@/hooks/admin/use-admin-client/useAdminClient';
import { mapFaqQuestionDtoToModel } from '@/utils/functions/mappers/admin/faq-mappers';

interface BaseProps {
    isOpen: boolean;
    onClose: () => void;
    pages: VisitorPage[];
}

interface AddModalProps extends BaseProps {
    mode: ModalMode.Add;
    onAddFaq: (faq: FaqQuestion) => void;
}

interface EditModalProps extends BaseProps {
    mode: ModalMode.Edit;
    faqToEdit: FaqQuestion;
    onEditFaq: (faq: FaqQuestion) => void;
}

export type FaqModalProps = AddModalProps | EditModalProps;

export const FaqModal = (props: FaqModalProps) => {
    const client = useAdminClient();
    const { isOpen, onClose, mode, pages } = props;
    const isEditMode = mode === ModalMode.Edit;
    const faq = isEditMode ? props.faqToEdit : undefined;
    const onSuccess = isEditMode ? props.onEditFaq : props.onAddFaq;

    const modalConfig = useMemo(
        () => ({
            mode: isEditMode ? ModalMode.Edit : ModalMode.Add,
            isOpen,
            onClose,
            entity: faq,
            onSuccess: onSuccess || (() => {}),
            apiCall: async (data: FaqCreateUpdate) => {
                const response = isEditMode ? await FaqApi.update(client, data) : await FaqApi.post(client, data);
                return mapFaqQuestionDtoToModel(response, pages);
            },
            getConfirmTitle: (mode: ModalMode, faq: FaqQuestion | undefined, pendingAction: PendingAction | null) => {
                if (mode === ModalMode.Edit && faq) {
                    if (faq.status === VisibilityStatus.Published)
                        return pendingAction === PendingAction.Draft
                            ? COMMON_TEXT_ADMIN.QUESTION.REMOVE_FROM_PUBLICATION
                            : COMMON_TEXT_ADMIN.QUESTION.PUBLISH_CHANGES;
                    return pendingAction === PendingAction.Draft
                        ? COMMON_TEXT_ADMIN.QUESTION.SAVE_CHANGES
                        : FAQ_TEXT.QUESTION.PUBLISH_FAQ;
                }
                return pendingAction === PendingAction.Draft
                    ? FAQ_TEXT.QUESTION.DRAFT_FAQ
                    : FAQ_TEXT.QUESTION.PUBLISH_FAQ;
            },
            getErrorMessage: (mode: ModalMode) => {
                return mode === ModalMode.Edit
                    ? FAQ_TEXT.FORM.MESSAGE.FAIL_TO_UPDATE_FAQ
                    : FAQ_TEXT.FORM.MESSAGE.FAIL_TO_CREATE_FAQ;
            },
            getFormKey: (mode: ModalMode, faq?: FaqQuestion) => {
                return mode === ModalMode.Edit && faq?.id ? faq.id : 'add';
            },
            transformFormData: (
                formData: FaqFormValues,
                status: VisibilityStatus,
                faq?: FaqQuestion,
            ): FaqCreateUpdate => ({
                id: isEditMode && faq ? faq.id : null,
                questionText: formData.questionText,
                answerText: formData.answerText,
                pageIds: formData.pages.map((p) => p.id),
                status: status,
            }),
        }),
        [isEditMode, isOpen, onClose, onSuccess, faq, client, pages],
    );

    const modalHookData = useGenericModal<FaqFormValues, FaqQuestion, FaqFormRef>(modalConfig);

    const initialData = useMemo<FaqFormValues | null>(() => {
        if (!isEditMode || !faq) return null;

        return {
            questionText: faq.questionText,
            answerText: faq.answerText,
            pages: faq.pages,
        };
    }, [faq, isEditMode]);

    const title = isEditMode ? FAQ_TEXT.FORM.TITLE.EDIT_FAQ : FAQ_TEXT.FORM.TITLE.ADD_FAQ;

    return (
        <GenericModalWrapper
            isOpen={isOpen}
            title={title}
            onClose={modalHookData.handleClose}
            onFormValidationChange={modalHookData.handleFormValidationChange}
            onFormSubmit={modalHookData.handleFormSubmit}
            onDraftSubmit={modalHookData.handleDraftSubmit}
            onPublishSubmit={modalHookData.handlePublishSubmit}
            onConfirmAction={modalHookData.handleConfirmAction}
            onCancelConfirmation={modalHookData.handleCancelConfirmation}
            onConfirmClose={modalHookData.handleConfirmClose}
            onCancelClose={modalHookData.handleCancelClose}
            {...modalHookData}
            initialData={initialData}
            categories={pages}
            renderForm={(props) => (
                <FaqForm
                    ref={modalHookData.formRef}
                    key={props.key}
                    initialData={initialData}
                    isFormDisabled={props.formDisabled}
                    onSubmit={props.onSubmit}
                    pages={pages}
                    onValidationChange={props.onValidationChange}
                />
            )}
        />
    );
};
