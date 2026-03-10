import { useCallback, useMemo, useRef, useState } from 'react';
import { ProgramForm, ProgramFormRef, ProgramFormValues } from '../../program-form/ProgramForm';
import {
    HippotherapyProgram,
    ProgramCategory,
    CreateHippotherapyProgramDto,
    UpdateHippotherapyProgramDto,
    SectionCancelActionType,
} from '@/types/admin/programs';
import { VisibilityStatus, PendingAction, ModalMode } from '@/types/admin/common';
import { CreateHippotherapyProgramSectionDto, ProgramSectionTemplate } from '@/types/common/program-sections';
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
import { mapHippotherapyProgramDtoToModel } from '@/utils/functions/mappers/admin/programs/programs-mappers';
import './ProgramModal.scss';

export interface BaseProgramModalProps {
    isOpen: boolean;
    onClose: () => void;
    categories: ProgramCategory[];
}

interface AddModalProps extends BaseProgramModalProps {
    mode: ModalMode.Add;
    onAddProgram: (program: HippotherapyProgram) => void;
}

interface EditModalProps extends BaseProgramModalProps {
    mode: ModalMode.Edit;
    programToEdit: HippotherapyProgram;
    onEditProgram: (program: HippotherapyProgram) => void;
}

export type ProgramModalProps = AddModalProps | EditModalProps;

export const ProgramModal = (props: ProgramModalProps) => {
    const { isOpen, onClose, mode, categories } = props;
    const client = useAdminClient();
    const isEditMode = mode === ModalMode.Edit;
    const program = isEditMode ? props.programToEdit : undefined;
    const onSuccess = isEditMode ? props.onEditProgram : props.onAddProgram;
    const { modalState, openModalActions, closeModalActions } = useModalsState();
    const [sectionToReplace, setSectionToReplace] = useState<number | null>(null);
    const [isSectionRemoveModalOpen, setIsSectionRemoveModalOpen] = useState(false);
    const [isSectionRevertModalOpen, setIsSectionRevertModalOpen] = useState(false);
    const [pendingCancelActionType, setPendingCancelActionType] = useState<SectionCancelActionType | null>(null);
    const sectionDiscardActionRef = useRef<(() => void) | null>(null);

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
            apiCall: async (data: CreateHippotherapyProgramDto) => {
                const result = isEditMode
                    ? await ProgramsApi.editProgram(data as UpdateHippotherapyProgramDto, client)
                    : await ProgramsApi.addProgram(client, data);

                return mapHippotherapyProgramDtoToModel(result);
            },
            getConfirmTitle: (
                mode: ModalMode,
                program: HippotherapyProgram | undefined,
                pendingAction: PendingAction | null,
            ) => {
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
            getFormKey: (mode: ModalMode, program?: HippotherapyProgram) => {
                return mode === ModalMode.Edit && program?.id ? program.id : 'add';
            },
            transformFormData: (
                formData: ProgramFormValues,
                status: VisibilityStatus,
                program?: HippotherapyProgram,
            ): CreateHippotherapyProgramDto => {
                const base: CreateHippotherapyProgramDto = {
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
                };
                if (mode === ModalMode.Edit && program) {
                    return { ...base, id: program.id } as UpdateHippotherapyProgramDto;
                }
                return base;
            },
            closeOnDraftCancel: true,
        }),
        [isEditMode, isOpen, mode, onClose, onSuccess, program, client, initialData],
    );

    const modalHookData = useGenericModal<ProgramFormValues, HippotherapyProgram, ProgramFormRef>(modalConfig);

    const handleLanguageChange = useCallback((_: string) => {
        // TODO: Implement language selection
    }, []);

    const handleTemplateSelect = useCallback(
        (templateId: ProgramSectionTemplate) => {
            if (!modalHookData.formRef?.current) {
                setSectionToReplace(null);
                return;
            }

            if (sectionToReplace !== null) {
                const currentSections = modalHookData.formRef.current.getSections
                    ? modalHookData.formRef.current.getSections()
                    : [];
                const oldSection = currentSections[sectionToReplace];
                const newSection: CreateHippotherapyProgramSectionDto = {
                    template: templateId,
                    order: oldSection?.order ?? 0,
                    contents: getInitialSectionContents(templateId),
                };
                modalHookData.formRef.current.replaceSection(sectionToReplace, newSection);
            } else {
                const currentSections = (
                    modalHookData.formRef.current.getSections ? modalHookData.formRef.current.getSections() : []
                ).filter(Boolean);
                const nextOrder =
                    currentSections.length === 0 ? 0 : Math.max(...currentSections.map((s) => s.order)) + 1;
                const newSection: CreateHippotherapyProgramSectionDto = {
                    template: templateId,
                    order: nextOrder,
                    contents: getInitialSectionContents(templateId),
                };
                modalHookData.formRef.current.addSection(newSection);
            }

            setSectionToReplace(null);
        },
        [modalHookData.formRef, sectionToReplace],
    );

    const handleRequestCancelSection = useCallback(
        (request: { type: SectionCancelActionType; onDiscard: () => void }) => {
            sectionDiscardActionRef.current = request.onDiscard;
            setPendingCancelActionType(request.type);

            switch (request.type) {
                case SectionCancelActionType.RemoveSection:
                    setIsSectionRemoveModalOpen(true);
                    break;
                case SectionCancelActionType.RevertSection:
                case SectionCancelActionType.RevertAfterReplace:
                case SectionCancelActionType.DiscardNewSection:
                    setIsSectionRevertModalOpen(true);
                    break;
                default:
                    break;
            }
        },
        [],
    );

    const handleCloseSectionRemoveModal = useCallback(() => {
        setIsSectionRemoveModalOpen(false);
        setPendingCancelActionType(null);
        sectionDiscardActionRef.current = null;
    }, []);

    const handleCloseSectionRevertModal = useCallback(() => {
        setIsSectionRevertModalOpen(false);
        setPendingCancelActionType(null);
        sectionDiscardActionRef.current = null;
    }, []);

    const handleConfirmRemoveSection = useCallback(() => {
        sectionDiscardActionRef.current?.();
        handleCloseSectionRemoveModal();
    }, [handleCloseSectionRemoveModal]);

    const handleConfirmRevertSection = useCallback(() => {
        sectionDiscardActionRef.current?.();
        handleCloseSectionRevertModal();
    }, [handleCloseSectionRevertModal]);

    const handleCloseAddSectionModal = useCallback(() => {
        closeModalActions.closeAddSectionModal();
        setSectionToReplace(null);
    }, [closeModalActions]);

    const handleReplaceSection = useCallback(
        (sectionIndex: number) => {
            setSectionToReplace(sectionIndex);
            openModalActions.openAddSectionModal();
        },
        [openModalActions],
    );

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
                isActionConfirmationOpen={false}
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
                        onReplaceSection={handleReplaceSection}
                        onRequestCancelSection={handleRequestCancelSection}
                    />
                )}
            />

            <ConfirmationModal
                isOpen={modalHookData.showFormConfirmModal}
                onClose={modalHookData.handleDismissConfirmation}
                title={modalHookData.formConfirmTitle}
                onConfirm={modalHookData.handleConfirmAction}
                onCancel={modalHookData.handleCancelConfirmation}
            />

            <AddSectionModal
                isOpen={modalState.isAddSectionModalOpen}
                onClose={handleCloseAddSectionModal}
                onSelectTemplate={handleTemplateSelect}
            />

            <ConfirmationModal
                isOpen={isSectionRemoveModalOpen}
                onClose={handleCloseSectionRemoveModal}
                title={PROGRAMS_TEXT.SECTION.MODAL.DELETE_SECTION_TITLE}
                onConfirm={handleConfirmRemoveSection}
                onCancel={handleCloseSectionRemoveModal}
            />

            <ConfirmationModal
                isOpen={isSectionRevertModalOpen}
                onClose={handleCloseSectionRevertModal}
                title={
                    pendingCancelActionType === SectionCancelActionType.RevertAfterReplace
                        ? PROGRAMS_TEXT.SECTION.MODAL.REPLACE_TEMPLATE_TITLE
                        : pendingCancelActionType === SectionCancelActionType.DiscardNewSection
                          ? PROGRAMS_TEXT.SECTION.MODAL.UNSAVED_CHANGES_TITLE
                          : COMMON_TEXT_ADMIN.QUESTION.CHANGES_WILL_BE_LOST_WISH_TO_CONTINUE
                }
                onConfirm={handleConfirmRevertSection}
                onCancel={handleCloseSectionRevertModal}
            />
        </div>
    );
};
