import { useMemo } from 'react';
import { TEAM_MEMBERS_TEXT } from '../../../../../../const/admin/team';
import { COMMON_TEXT_ADMIN } from '../../../../../../const/admin/common';
import { TeamCategory, TeamMember, TeamMemberCreateUpdateRequest } from '../../../../../../types/admin/team-members';
import { useAdminClient } from '../../../../../../hooks/admin/use-admin-client/useAdminClient';
import { TeamMembersApi } from '../../../../../../services/api/admin/team/team-members/team-members-api';
import { GenericModalWrapper } from '../../../../../../components/admin/modal-wrappers/generic-modal-wrapper/GenericModalWrapper';
import { useGenericModal } from '../../../../../../hooks/admin/use-generic-modal/useGenericModal';
import { VisibilityStatus, PendingAction, ModalMode } from '../../../../../../types/admin/common';
import { TeamMemberFormValues, TeamMemberFormRef, MemberForm } from '../../forms/member-form/MemberForm';

interface TeamMemberModalProps {
    mode: ModalMode;
    isOpen: boolean;
    onClose: () => void;
    onAddMember?: (memberData: TeamMember) => void;
    onEditMember?: (memberData: TeamMember) => void;
    memberToEdit?: TeamMember;
    categories: TeamCategory[];
}

export const TeamMemberModal = ({
    mode,
    isOpen,
    onClose,
    onAddMember,
    onEditMember,
    memberToEdit,
    categories,
}: TeamMemberModalProps) => {
    const client = useAdminClient();
    const isEditMode = mode === ModalMode.Edit;
    const onSuccess = isEditMode ? onEditMember : onAddMember;

    const modalConfig = useMemo(
        () => ({
            mode,
            isOpen,
            onClose,
            entity: memberToEdit,
            onSuccess: onSuccess || (() => {}),
            apiCall: async (data: TeamMemberCreateUpdateRequest) => {
                return isEditMode
                    ? await TeamMembersApi.updateMember(client, data.id!, data)
                    : await TeamMembersApi.postMember(client, data);
            },
            getConfirmTitle: (mode: ModalMode, member: TeamMember | undefined, pendingAction: PendingAction | null) => {
                if (mode === ModalMode.Edit && member) {
                    if (member.status === VisibilityStatus.Published)
                        return pendingAction === PendingAction.Draft
                            ? COMMON_TEXT_ADMIN.QUESTION.REMOVE_FROM_PUBLICATION
                            : COMMON_TEXT_ADMIN.QUESTION.PUBLISH_CHANGES;
                    return pendingAction === PendingAction.Draft
                        ? COMMON_TEXT_ADMIN.QUESTION.SAVE_CHANGES
                        : TEAM_MEMBERS_TEXT.QUESTION.PUBLISH_MEMBER;
                }
                return pendingAction === PendingAction.Draft
                    ? TEAM_MEMBERS_TEXT.QUESTION.DRAFT_MEMBER
                    : TEAM_MEMBERS_TEXT.QUESTION.PUBLISH_MEMBER;
            },
            getErrorMessage: (mode: ModalMode) => {
                return mode === ModalMode.Edit
                    ? TEAM_MEMBERS_TEXT.FORM.MESSAGE.FAIL_TO_UPDATE_MEMBER
                    : TEAM_MEMBERS_TEXT.FORM.MESSAGE.FAIL_TO_CREATE_MEMBER;
            },
            getFormKey: (mode: ModalMode, member?: TeamMember) => {
                return mode === ModalMode.Edit && member?.id ? member.id : 'add';
            },
            transformFormData: (
                formData: TeamMemberFormValues,
                status: VisibilityStatus,
                member?: TeamMember,
            ): TeamMemberCreateUpdateRequest => ({
                id: mode === ModalMode.Edit && member ? member.id : null,
                fullName: formData.fullName,
                categoryId: formData.categoryId,
                description: formData.description,
                image: formData.image,
                status: status,
                imageId: formData.imageId,
            }),
        }),
        [mode, isOpen, onClose, memberToEdit, onSuccess, client, isEditMode],
    );

    const modalHookData = useGenericModal<TeamMemberFormValues, TeamMember, TeamMemberFormRef>(modalConfig);

    const initialData = useMemo<TeamMemberFormValues | null>(() => {
        if (!isEditMode || !memberToEdit) return null;

        return {
            fullName: memberToEdit.fullName,
            description: memberToEdit.description,
            categoryId: memberToEdit.categoryId,
            image: memberToEdit.image,
            imageId: memberToEdit.image && 'id' in memberToEdit.image ? memberToEdit.image.id : null,
        };
    }, [memberToEdit, isEditMode]);

    const title = isEditMode ? TEAM_MEMBERS_TEXT.FORM.TITLE.EDIT_MEMBER : TEAM_MEMBERS_TEXT.FORM.TITLE.ADD_MEMBER;

    return (
        <GenericModalWrapper
            isOpen={isOpen}
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
            title={title}
            initialData={initialData}
            categories={categories}
            renderForm={(props) => (
                <MemberForm
                    ref={modalHookData.formRef}
                    key={props.key}
                    initialData={initialData}
                    formDisabled={props.formDisabled}
                    onSubmit={props.onSubmit}
                    categories={categories}
                    onValidationChange={props.onValidationChange}
                />
            )}
        />
    );
};
