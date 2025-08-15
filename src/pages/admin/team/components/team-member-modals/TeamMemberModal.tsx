import React, { useMemo } from 'react';
import { MemberForm, TeamMemberFormRef, TeamMemberFormValues } from '../member-form/MemberForm';
import { TEAM_MEMBERS_TEXT } from '../../../../../const/admin/team';
import { COMMON_TEXT_ADMIN } from '../../../../../const/admin/common';
import { TeamCategory, TeamMember, TeamMemberCreateUpdateRequest } from '../../../../../types/admin/team-members';
import { useAdminClient } from '../../../../../hooks/admin/use-admin-client/useAdminClient';
import { VisibilityStatus } from '../../../../../types/admin/common';
import { TeamMembersApi } from '../../../../../services/api/admin/team/team-members/team-members-api';
import './TeamMemberModal.scss';
import { GenericModalWrapper } from '../../../../../components/admin/generic-modal-wrapper/GenericModalWrapper';
import { useGenericModal } from '../../../../../hooks/admin/use-generic-modal/useGenericModal';

interface TeamMemberModalProps {
    mode: 'add' | 'edit';
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
    const isEditMode = mode === 'edit';
    const onSuccess = isEditMode ? onEditMember : onAddMember;

    const modalConfig = useMemo(
        () => ({
            mode,
            isOpen,
            onClose,
            entity: memberToEdit,
            onSuccess: onSuccess!,
            apiCall: async (data: TeamMemberCreateUpdateRequest) => {
                return isEditMode
                    ? await TeamMembersApi.updateMember(client, data.id!, data)
                    : await TeamMembersApi.postMember(client, data);
            },
            getConfirmTitle: (
                mode: 'add' | 'edit',
                member: TeamMember | undefined,
                pendingAction: 'publish' | 'draft' | null,
            ) => {
                if (mode === 'edit' && member) {
                    if (member.status === VisibilityStatus.Published)
                        return pendingAction === 'draft'
                            ? COMMON_TEXT_ADMIN.QUESTION.REMOVE_FROM_PUBLICATION
                            : COMMON_TEXT_ADMIN.QUESTION.PUBLISH_CHANGES;
                    return pendingAction === 'draft'
                        ? COMMON_TEXT_ADMIN.QUESTION.SAVE_CHANGES
                        : TEAM_MEMBERS_TEXT.QUESTION.PUBLISH_MEMBER;
                }
                return pendingAction === 'draft'
                    ? TEAM_MEMBERS_TEXT.QUESTION.DRAFT_MEMBER
                    : TEAM_MEMBERS_TEXT.QUESTION.PUBLISH_MEMBER;
            },
            getErrorMessage: (mode: 'add' | 'edit') => {
                return mode === 'edit'
                    ? TEAM_MEMBERS_TEXT.FORM.MESSAGE.FAIL_TO_UPDATE_MEMBER
                    : TEAM_MEMBERS_TEXT.FORM.MESSAGE.FAIL_TO_CREATE_MEMBER;
            },
            getFormKey: (mode: 'add' | 'edit', member?: TeamMember) => {
                return mode === 'edit' && member?.id ? member.id : 'add';
            },
            transformFormData: (
                formData: TeamMemberFormValues,
                status: VisibilityStatus,
                member?: TeamMember,
            ): TeamMemberCreateUpdateRequest => ({
                id: mode === 'edit' && member ? member.id : null,
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

        let imageId: number | null = null;

        if (memberToEdit.image && "id" in memberToEdit.image) {
            imageId = Number(memberToEdit.image.id);
        }

        return {
            fullName: memberToEdit.fullName,
            description: memberToEdit.description,
            categoryId: memberToEdit.categoryId,
            image: memberToEdit.image,
            imageId: imageId ?? null,
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
