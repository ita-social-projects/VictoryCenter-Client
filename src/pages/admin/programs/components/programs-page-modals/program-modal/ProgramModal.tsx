import { useMemo } from 'react';
import { ProgramForm, ProgramFormRef, ProgramFormValues } from '../../program-form/ProgramForm';
import { Program, ProgramCategory, ProgramCreateUpdate } from '../../../../../../types/admin/programs';
import { VisibilityStatus } from '../../../../../../types/admin/common';
import { PROGRAMS_TEXT } from '../../../../../../const/admin/programs';
import { COMMON_TEXT_ADMIN } from '../../../../../../const/admin/common';
import { ProgramsApi } from '../../../../../../services/api/admin/programs/programs-api';
import '../ProgramModal.scss';
import { useGenericModal } from '../../../../../../hooks/admin/use-generic-modal/useGenericModal';
import { GenericModalWrapper } from '../../../../../../components/admin/generic-modal-wrapper/GenericModalWrapper';

interface BaseProps {
    isOpen: boolean;
    onClose: () => void;
    categories: ProgramCategory[];
}

interface AddModalProps extends BaseProps {
    mode: 'add';
    onAddProgram: (program: Program) => void;
}

interface EditModalProps extends BaseProps {
    mode: 'edit';
    programToEdit: Program;
    onEditProgram: (program: Program) => void;
}

export type ProgramModalProps = AddModalProps | EditModalProps;

export const ProgramModal = (props: ProgramModalProps) => {
    const { isOpen, onClose, mode, categories } = props;
    const isEditMode = mode === 'edit';
    const program = isEditMode ? props.programToEdit : undefined;
    const onSuccess = isEditMode ? props.onEditProgram : props.onAddProgram;

    const modalConfig = useMemo(
        () => ({
            mode,
            isOpen,
            onClose,
            entity: program,
            onSuccess: onSuccess || (() => {}),
            apiCall: async (data: ProgramCreateUpdate) => {
                return isEditMode ? await ProgramsApi.editProgram(data) : await ProgramsApi.addProgram(data);
            },
            getConfirmTitle: (
                mode: 'add' | 'edit',
                program: Program | undefined,
                pendingAction: 'publish' | 'draft' | null,
            ) => {
                if (mode === 'edit' && program) {
                    if (program.status === VisibilityStatus.Published)
                        return pendingAction === 'draft'
                            ? COMMON_TEXT_ADMIN.QUESTION.REMOVE_FROM_PUBLICATION
                            : COMMON_TEXT_ADMIN.QUESTION.PUBLISH_CHANGES;
                    return pendingAction === 'draft'
                        ? COMMON_TEXT_ADMIN.QUESTION.SAVE_CHANGES
                        : PROGRAMS_TEXT.QUESTION.PUBLISH_PROGRAM;
                }
                return pendingAction === 'draft'
                    ? PROGRAMS_TEXT.QUESTION.DRAFT_PROGRAM
                    : PROGRAMS_TEXT.QUESTION.PUBLISH_PROGRAM;
            },
            getErrorMessage: (mode: 'add' | 'edit') => {
                return mode === 'edit'
                    ? PROGRAMS_TEXT.FORM.MESSAGE.FAIL_TO_UPDATE_PROGRAM
                    : PROGRAMS_TEXT.FORM.MESSAGE.FAIL_TO_CREATE_PROGRAM;
            },
            getFormKey: (mode: 'add' | 'edit', program?: Program) => {
                return mode === 'edit' && program?.id ? program.id : 'add';
            },
            transformFormData: (
                formData: ProgramFormValues,
                status: VisibilityStatus,
                program?: Program,
            ): ProgramCreateUpdate => ({
                id: mode === 'edit' && program ? program.id : null,
                name: formData.name,
                description: formData.description,
                img: formData.img,
                status: status,
                categoryIds: formData.categories.map((x) => x.id),
            }),
        }),
        [isEditMode, isOpen, mode, onClose, onSuccess, program],
    );

    const modalHookData = useGenericModal<ProgramFormValues, Program, ProgramFormRef>(modalConfig);

    const initialData = useMemo<ProgramFormValues | null>(() => {
        if (!isEditMode || !program) return null;

        return {
            name: program.name,
            description: program.description,
            categories: program.categories,
            img: program.img,
        };
    }, [program, isEditMode]);

    const title = isEditMode ? PROGRAMS_TEXT.FORM.TITLE.EDIT_PROGRAM : PROGRAMS_TEXT.FORM.TITLE.ADD_PROGRAM;

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
            categories={categories}
            renderForm={(props) => (
                <ProgramForm
                    ref={modalHookData.formRef}
                    key={props.key}
                    initialData={initialData}
                    isFormDisabled={props.formDisabled}
                    onSubmit={props.onSubmit}
                    categories={categories}
                    onValidationChange={props.onValidationChange}
                />
            )}
        />
    );
};
