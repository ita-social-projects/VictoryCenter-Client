import { useCallback, useMemo, useState } from 'react';
import { ProgramForm, ProgramFormRef, ProgramFormValues } from '../../program-form/ProgramForm';
import { Program, ProgramCategory, ProgramCreateUpdate } from '@/types/admin/programs';
import { VisibilityStatus, PendingAction, ModalMode } from '@/types/admin/common';
import { ProgramSection, ProgramSectionTemplate } from '@/types/common/program-sections';
import { PROGRAMS_TEXT } from '@/const/admin/programs';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { ProgramsApi } from '@/services/api/admin/programs/programs-api';
import { useGenericModal } from '@/hooks/admin/use-generic-modal/useGenericModal';
import { GenericModalWrapper } from '@/components/admin/generic-modal-wrapper/GenericModalWrapper';
import { useAdminClient } from '@/hooks/admin/use-admin-client/useAdminClient';
import { useModalsState } from '@/hooks/admin/use-modals-state/useModalsState';
import { AddSectionModal } from '../add-section-modal/AddSectionModal';
import { ConfirmationModal } from '@/components/admin/confirmation-modal/ConfirmationModal';
import { getInitialSectionContents } from '@/utils/functions/render-program-section';
import './ProgramModal.scss';

export interface BaseProgramModalProps {
    isOpen: boolean;
    onClose: () => void;
    categories: ProgramCategory[];
}

interface AddModalProps extends BaseProgramModalProps {
    mode: ModalMode.Add;
    onAddProgram: (program: Program) => void;
}

interface EditModalProps extends BaseProgramModalProps {
    mode: ModalMode.Edit;
    programToEdit: Program;
    onEditProgram: (program: Program) => void;
}

export type ProgramModalProps = AddModalProps | EditModalProps;

export const ProgramModal = (props: ProgramModalProps) => {
    const { isOpen, onClose, mode, categories } = props;
    const client = useAdminClient();
    const isEditMode = mode === ModalMode.Edit;
    const program = isEditMode ? props.programToEdit : undefined;
    const onSuccess = isEditMode ? props.onEditProgram : props.onAddProgram;
    const { modalState, openModalActions, closeModalActions } = useModalsState();
    const [isSectionUnsavedModalOpen, setIsSectionUnsavedModalOpen] = useState(false);
    const [sectionDiscardAction, setSectionDiscardAction] = useState<(() => void) | null>(null);

    const initialData = useMemo<ProgramFormValues | null>(() => {
        if (!isEditMode || !program) return null;

        return {
            name: program.name,
            description: program.description,
            categories: program.categories.map((c) => ({ ...c, programsCount: c.programsCount ?? 0 })),
            previewImage: program.previewImage,
            previewImageId: program.previewImage && 'id' in program.previewImage ? program.previewImage.id : null,
            backgroundImage: program.backgroundImage || null,
            backgroundImageId:
                program.backgroundImage && 'id' in program.backgroundImage ? program.backgroundImage.id : null,
            location: program.location,
            participantsCount: program.participantsCount,
            meetingCount: program.meetingsCount,
            sections: program.sections || [],
        };
    }, [program, isEditMode]);

    const modalConfig = useMemo(
        () => ({
            mode,
            isOpen,
            onClose,
            entity: program,
            onSuccess: onSuccess || (() => {}),
            apiCall: async (data: ProgramCreateUpdate) => {
                return isEditMode
                    ? await ProgramsApi.editProgram(data, client)
                    : await ProgramsApi.addProgram(client, data);
            },
            getConfirmTitle: (mode: ModalMode, program: Program | undefined, pendingAction: PendingAction | null) => {
                if (mode === ModalMode.Edit && program) {
                    if (program.status === VisibilityStatus.Published)
                        return pendingAction === PendingAction.Draft
                            ? COMMON_TEXT_ADMIN.QUESTION.REMOVE_FROM_PUBLICATION
                            : COMMON_TEXT_ADMIN.QUESTION.PUBLISH_CHANGES;
                    return pendingAction === PendingAction.Draft
                        ? COMMON_TEXT_ADMIN.QUESTION.SAVE_CHANGES
                        : PROGRAMS_TEXT.QUESTION.PUBLISH_PROGRAM;
                }
                return pendingAction === PendingAction.Draft
                    ? PROGRAMS_TEXT.QUESTION.DRAFT_PROGRAM
                    : PROGRAMS_TEXT.QUESTION.PUBLISH_PROGRAM;
            },
            getErrorMessage: (mode: ModalMode) => {
                return mode === ModalMode.Edit
                    ? PROGRAMS_TEXT.FORM.MESSAGE.FAIL_TO_UPDATE_PROGRAM
                    : PROGRAMS_TEXT.FORM.MESSAGE.FAIL_TO_CREATE_PROGRAM;
            },
            getFormKey: (mode: ModalMode, program?: Program) => {
                return mode === ModalMode.Edit && program?.id ? program.id : 'add';
            },
            transformFormData: (
                formData: ProgramFormValues,
                status: VisibilityStatus,
                program?: Program,
            ): ProgramCreateUpdate => ({
                id: mode === ModalMode.Edit && program ? program.id : null,
                name: formData.name,
                description: formData.description,
                previewImage: formData.previewImage,
                backgroundImage: formData.backgroundImage,
                status: status,
                categoryIds: formData.categories.map((x) => x.id),
                previewImageId: initialData?.previewImageId ?? null,
                backgroundImageId: initialData?.backgroundImageId ?? null,
                location: formData.location,
                participantsCount: formData.participantsCount,
                meetingsCount: formData.meetingCount,
                sections: formData.sections,
            }),
        }),
        [isEditMode, isOpen, mode, onClose, onSuccess, program, client, initialData],
    );

    const modalHookData = useGenericModal<ProgramFormValues, Program, ProgramFormRef>(modalConfig);

    const handleLanguageChange = useCallback((_: string) => {
        // TODO: Implement language selection
    }, []);

    const handleTemplateSelect = useCallback(
        (templateId: ProgramSectionTemplate) => {
            if (modalHookData.formRef?.current) {
                const currentSections = modalHookData.formRef.current.getSections
                    ? modalHookData.formRef.current.getSections()
                    : [];
                const nextOrder =
                    currentSections.length === 0 ? 0 : Math.max(...currentSections.map((s) => s.order)) + 1;
                const newSection: ProgramSection = {
                    template: templateId,
                    order: nextOrder,
                    contents: getInitialSectionContents(templateId),
                };
                modalHookData.formRef.current.addSection(newSection);
            }
        },
        [modalHookData.formRef],
    );

    const handleRequestCancelSection = useCallback(
        (onConfirmDiscard: (() => void) | number) => {
            if (typeof onConfirmDiscard === 'number') {
                const sectionIndex = onConfirmDiscard;
                setSectionDiscardAction(() => () => {
                    if (!modalHookData.formRef.current) return;
                    if (isEditMode) {
                        modalHookData.formRef.current.revertSection(sectionIndex);
                    } else {
                        modalHookData.formRef.current.removeSection(sectionIndex);
                    }
                });
            } else {
                setSectionDiscardAction(() => onConfirmDiscard);
            }
            setIsSectionUnsavedModalOpen(true);
        },
        [isEditMode, modalHookData.formRef],
    );

    const handleCloseSectionUnsavedModal = useCallback(() => {
        setIsSectionUnsavedModalOpen(false);
        setSectionDiscardAction(null);
    }, []);

    const handleConfirmDiscardSection = useCallback(() => {
        sectionDiscardAction?.();
        handleCloseSectionUnsavedModal();
    }, [sectionDiscardAction, handleCloseSectionUnsavedModal]);

    return (
        <div className="program-modal">
            <GenericModalWrapper
                isOpen={isOpen}
                onClose={modalHookData.handleClose}
                onFormSubmit={modalHookData.handleFormSubmit}
                onFormValidationChange={modalHookData.handleFormValidationChange}
                onPublishSubmit={modalHookData.handlePublishSubmit}
                onDraftSubmit={modalHookData.handleDraftSubmit}
                onActionCancel={modalHookData.handleCancelConfirmation}
                onActionConfirm={modalHookData.handleConfirmAction}
                onExitCancel={modalHookData.handleCancelClose}
                onExitConfirm={modalHookData.handleConfirmClose}
                buttonStates={modalHookData.buttonStates}
                formRef={modalHookData.formRef}
                isSubmitting={modalHookData.isSubmitting}
                error={modalHookData.error}
                isExitConfirmationOpen={modalHookData.showCloseConfirmModal}
                isActionConfirmationOpen={modalHookData.showFormConfirmModal}
                formKey={modalHookData.formKey}
                actionConfirmationTitle={modalHookData.formConfirmTitle}
                initialData={initialData}
                categories={categories}
                fullScreen={true}
                renderForm={(props) => (
                    <ProgramForm
                        ref={modalHookData.formRef}
                        key={props.key}
                        initialData={initialData}
                        isFormDisabled={props.formDisabled}
                        onSubmit={props.onSubmit}
                        categories={categories}
                        onValidationChange={props.onValidationChange}
                        onLanguageChange={handleLanguageChange}
                        onAddSection={openModalActions.openAddSectionModal}
                        onRequestCancelSection={handleRequestCancelSection}
                        isEditMode={isEditMode}
                    />
                )}
            />
            <AddSectionModal
                isOpen={modalState.isAddSectionModalOpen}
                onClose={closeModalActions.closeAddSectionModal}
                onSelectTemplate={handleTemplateSelect}
            />
            <ConfirmationModal
                isOpen={isSectionUnsavedModalOpen}
                onClose={handleCloseSectionUnsavedModal}
                title={
                    isEditMode
                        ? COMMON_TEXT_ADMIN.QUESTION.CHANGES_WILL_BE_LOST_WISH_TO_CONTINUE
                        : PROGRAMS_TEXT.SECTION.MODAL.UNSAVED_CHANGES_TITLE
                }
                onConfirm={handleConfirmDiscardSection}
                onCancel={handleCloseSectionUnsavedModal}
            />
        </div>
    );
};
