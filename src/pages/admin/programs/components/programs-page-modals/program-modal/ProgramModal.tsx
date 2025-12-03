import { useCallback, useMemo, useState } from 'react';
import { ProgramForm, ProgramFormRef, ProgramFormValues } from '../../program-form/ProgramForm';
import { Program, ProgramCategory, ProgramCreateUpdate } from '../../../../../../types/admin/programs';
import { VisibilityStatus, PendingAction, ModalMode } from '../../../../../../types/admin/common';
import { PROGRAMS_TEXT } from '../../../../../../const/admin/programs';
import { COMMON_TEXT_ADMIN } from '../../../../../../const/admin/common';
import { ProgramsApi } from '../../../../../../services/api/admin/programs/programs-api';
import { useGenericModal } from '../../../../../../hooks/admin/use-generic-modal/useGenericModal';
import { GenericModalWrapper } from '../../../../../../components/admin/generic-modal-wrapper/GenericModalWrapper';
import { useAdminClient } from '../../../../../../hooks/admin/use-admin-client/useAdminClient';

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

    const [selectedLanguage, setSelectedLanguage] = useState<string>('Українська');

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
            meetingCount: program.meetingCount,
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
                previewImage: formData.previewImage && 'base64' in formData.previewImage ? formData.previewImage : null,
                backgroundImage:
                    formData.backgroundImage && 'base64' in formData.backgroundImage ? formData.backgroundImage : null,
                status: status,
                categoryIds: formData.categories.map((x) => x.id),
                previewImageId: initialData?.previewImageId ?? null,
                backgroundImageId: initialData?.backgroundImageId ?? null,
                location: formData.location,
                participantsCount: formData.participantsCount,
                meetingCount: formData.meetingCount,
            }),
        }),
        [isEditMode, isOpen, mode, onClose, onSuccess, program, client, initialData],
    );

    const modalHookData = useGenericModal<ProgramFormValues, Program, ProgramFormRef>(modalConfig);

    const handleLanguageChange = useCallback((language: string) => {
        setSelectedLanguage(language);
    }, []);

    const handleAddNewSection = useCallback(() => {
        // TODO: Implement add new section logic
    }, []);

    return (
        <GenericModalWrapper
            isOpen={isOpen}
            onClose={modalHookData.handleClose}
            onFormValidationChange={modalHookData.handleFormValidationChange}
            onFormSubmit={modalHookData.handleFormSubmit}
            onDraftSubmit={modalHookData.handleDraftSubmit}
            onPublishSubmit={modalHookData.handlePublishSubmit}
            onActionConfirm={modalHookData.handleConfirmAction}
            onActionCancel={modalHookData.handleCancelConfirmation}
            onExitConfirm={modalHookData.handleConfirmClose}
            onExitCancel={modalHookData.handleCancelClose}
            buttonStates={modalHookData.buttonStates}
            formRef={modalHookData.formRef}
            isSubmitting={modalHookData.isSubmitting}
            error={modalHookData.error}
            isActionConfirmationOpen={modalHookData.showFormConfirmModal}
            isExitConfirmationOpen={modalHookData.showCloseConfirmModal}
            formKey={modalHookData.formKey}
            actionConfirmationTitle={modalHookData.formConfirmTitle}
            categories={categories}
            initialData={initialData}
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
                    selectedLanguage={selectedLanguage}
                    onLanguageChange={handleLanguageChange}
                    onAddSection={handleAddNewSection}
                />
            )}
        />
    );
};
