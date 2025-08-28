import { useMemo } from 'react';
import { COMMON_TEXT_ADMIN } from '../../../../../../const/admin/common';
import { FAQ_TEXT } from '../../../../../../const/admin/faq';
import { useGenericModal } from '../../../../../../hooks/admin/use-generic-modal/useGenericModal';
import { FaqApi } from '../../../../../../services/api/admin/faq/faq-api';
import { VisibilityStatus } from '../../../../../../types/admin/common';
import { FaqCreateUpdate, FaqQuestion, VisitorPage } from '../../../../../../types/admin/faq';
import { FaqForm, FaqFormRef, FaqFormValues } from '../../faq-form/FaqForm';
import { GenericModalWrapper } from '../../../../../../components/admin/generic-modal-wrapper/GenericModalWrapper';
import '../FaqModal.scss';
import { useAdminClient } from '../../../../../../hooks/admin/use-admin-client/useAdminClient';

interface BaseProps {
    isOpen: boolean;
    onClose: () => void;
    pages: VisitorPage[];
}

interface AddModalProps extends BaseProps {
    mode: 'add';
    onAddFaq: (faq: FaqQuestion) => void;
}

interface EditModalProps extends BaseProps {
    mode: 'edit';
    faqToEdit: FaqQuestion;
    onEditFaq: (faq: FaqQuestion) => void;
}

export type FaqModalProps = AddModalProps | EditModalProps;

export const FaqModal = (props: FaqModalProps) => {
    const client = useAdminClient();
    const { isOpen, onClose, mode, pages } = props;
    const isEditMode = mode === 'edit';
    const faq = isEditMode ? props.faqToEdit : undefined;
    const onSuccess = isEditMode ? props.onEditFaq : props.onAddFaq;

    const modalConfig = useMemo(
        () => ({
            mode,
            isOpen,
            onClose,
            entity: faq,
            onSuccess: onSuccess || (() => {}),
            apiCall: async (data: FaqCreateUpdate) => {
                return isEditMode ? await FaqApi.update(client, data) : await FaqApi.post(client, data);
            },
            getConfirmTitle: (
                mode: 'add' | 'edit',
                faq: FaqQuestion | undefined,
                pendingAction: 'publish' | 'draft' | null,
            ) => {
                if (mode === 'edit' && faq) {
                    if (faq.status === VisibilityStatus.Published)
                        return pendingAction === 'draft'
                            ? COMMON_TEXT_ADMIN.QUESTION.REMOVE_FROM_PUBLICATION
                            : COMMON_TEXT_ADMIN.QUESTION.PUBLISH_CHANGES;
                    return pendingAction === 'draft'
                        ? COMMON_TEXT_ADMIN.QUESTION.SAVE_CHANGES
                        : FAQ_TEXT.QUESTION.PUBLISH_FAQ;
                }
                return pendingAction === 'draft' ? FAQ_TEXT.QUESTION.DRAFT_FAQ : FAQ_TEXT.QUESTION.PUBLISH_FAQ;
            },
            getErrorMessage: (mode: 'add' | 'edit') => {
                return mode === 'edit'
                    ? FAQ_TEXT.FORM.MESSAGE.FAIL_TO_UPDATE_FAQ
                    : FAQ_TEXT.FORM.MESSAGE.FAIL_TO_CREATE_FAQ;
            },
            getFormKey: (mode: 'add' | 'edit', faq?: FaqQuestion) => {
                return mode === 'edit' && faq?.id ? faq.id : 'add';
            },
            transformFormData: (
                formData: FaqFormValues,
                status: VisibilityStatus,
                faq?: FaqQuestion,
            ): FaqCreateUpdate => ({
                id: mode === 'edit' && faq ? faq.id : null,
                questionText: formData.question,
                answerText: formData.answer,
                pageIds: formData.pages.map((p) => p.id),
                status: status,
            }),
        }),
        [isEditMode, isOpen, mode, onClose, onSuccess, faq, client],
    );

    const modalHookData = useGenericModal<FaqFormValues, FaqQuestion, FaqFormRef>(modalConfig);

    const initialData = useMemo<FaqFormValues | null>(() => {
        if (!isEditMode || !faq) return null;

        return {
            question: faq.questionText,
            answer: faq.answerText,
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
