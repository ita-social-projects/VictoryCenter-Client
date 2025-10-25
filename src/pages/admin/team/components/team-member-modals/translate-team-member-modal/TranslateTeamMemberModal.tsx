import { useMemo } from 'react';
import { MemberForm, TeamMemberFormRef, TeamMemberFormValues } from '../../member-form/MemberForm';
import { TEAM_MEMBERS_TEXT } from '../../../../../../const/admin/team';
import { COMMON_TEXT_ADMIN } from '../../../../../../const/admin/common';
import { TeamCategory, TeamMember, TeamMemberCreateUpdateRequest } from '../../../../../../types/admin/team-members';
import { useAdminClient } from '../../../../../../hooks/admin/use-admin-client/useAdminClient';
import { TeamMembersApi } from '../../../../../../services/api/admin/team/team-members/team-members-api';
import { GenericModalWrapper } from '../../../../../../components/admin/generic-modal-wrapper/GenericModalWrapper';
import { useGenericModal } from '../../../../../../hooks/admin/use-generic-modal/useGenericModal';
import { VisibilityStatus, PendingAction, ModalMode } from '../../../../../../types/admin/common';

interface TranslateTeamMemberModalProps {
    isOpen: boolean;
    onClose: () => void;
    onTranslateMember: (memberData: TeamMember) => void;
    memberToEdit: TeamMember;
}

export const TranslateTeamMemberModal = ({
    isOpen,
    onClose,
    onTranslateMember,
    memberToEdit,
}: TranslateTeamMemberModalProps) => {
    const client = useAdminClient();

    const modalConfig = useMemo(
        () => ({
            isOpen,
            onClose,
            entity: memberToEdit,
            onSuccess: onTranslateMember || (() => {}),
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
                member: TeamMember,
            ): TeamMemberCreateUpdateRequest => ({
                id: member.id,
                fullName: formData.fullName,
                categoryId: formData.categoryId,
                description: formData.description,
                image: formData.image,
                status: status,
                imageId: formData.imageId,
            }),
        }),
        [isOpen, onClose, memberToEdit, onTranslateMember, client],
    );

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
            title={TEAM_MEMBERS_TEXT.FORM.TITLE.TRANSLATE_MEMBER}
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
