import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { TeamCategory, TeamMember, TeamMemberCreateUpdateRequest } from '../../../../../types/admin/TeamMembers';
import { Modal } from '../../../../../components/common/modal/Modal';
import { MemberForm, TeamMemberFormRef, TeamMemberFormValues } from '../member-form/MemberForm';
import { TEAM_MEMBERS_TEXT } from '../../../../../const/admin/team';
import { Button } from '../../../../../components/common/button/Button';
import { COMMON_TEXT_ADMIN } from '../../../../../const/admin/common';
import { QuestionModal } from '../../../../../components/common/question-modal/QuestionModal';
import { VisibilityStatus } from '../../../../../types/admin/Common';
import { TeamMembersApi } from '../../../../../services/data-fetch/admin-page-data-fetch/team-page-data-fetch/TeamMembersApi/TeamMembersApi';
import { useAdminClient } from '../../../../../utils/hooks/use-admin-client/useAdminClient';

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
    const member = isEditMode ? memberToEdit : null;
    const onSuccess = isEditMode ? onEditMember : onAddMember;
    const formRef = useRef<TeamMemberFormRef>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [showFormConfirmModal, setShowFormConfirmModal] = useState(false);
    const [showCloseConfirmModal, setShowCloseConfirmModal] = useState(false);
    const [pendingAction, setPendingAction] = useState<'publish' | 'draft' | null>(null);
    const [pendingFormData, setPendingFormData] = useState<TeamMemberFormValues | null>(null);
    const [isFormValid, setIsFormValid] = useState(false);

    const initialData = useMemo<TeamMemberFormValues | null>(() => {
        if (!isEditMode || !member) return null;

        return {
            fullName: member.fullName,
            description: member.description,
            categoryId: member.categoryId,
            image: member.image,
            imageId: member.image?.id ?? null,
        };
    }, [member, isEditMode]);

    useEffect(() => {
        if (!isOpen) return;
        setError('');
        setShowFormConfirmModal(false);
        setShowCloseConfirmModal(false);
        setPendingAction(null);
        setPendingFormData(null);
        setIsFormValid(false);
    }, [isOpen]);

    const handleConfirmAction = useCallback(async () => {
        if (!pendingFormData || !pendingAction) return;

        setShowFormConfirmModal(false);
        setIsSubmitting(true);
        setError('');

        try {
            const status: VisibilityStatus =
                pendingAction === 'publish' ? VisibilityStatus.Published : VisibilityStatus.Draft;
            const memberData: TeamMemberCreateUpdateRequest = {
                id: isEditMode && member ? member.id : null,
                fullName: pendingFormData.fullName,
                categoryId: pendingFormData.categoryId,
                description: pendingFormData.description,
                image: pendingFormData.image,
                status: status,
                imageId: pendingFormData.imageId,
            };

            const resultMember = isEditMode
                ? await TeamMembersApi.updateMember(client, memberData.id!, memberData)
                : await TeamMembersApi.postMember(client, memberData);

            if (onSuccess) {
                onSuccess(resultMember);
            }
            onClose();
        } catch {
            const errorMessage = isEditMode
                ? TEAM_MEMBERS_TEXT.FORM.MESSAGE.FAIL_TO_UPDATE_MEMBER
                : TEAM_MEMBERS_TEXT.FORM.MESSAGE.FAIL_TO_CREATE_MEMBER;
            setError(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    }, [pendingFormData, pendingAction, isEditMode, member, client, onSuccess, onClose]);

    const getFormConfirmTitle = useCallback(() => {
        if (isEditMode && member) {
            if (member.status === VisibilityStatus.Published)
                return pendingAction === 'draft'
                    ? COMMON_TEXT_ADMIN.QUESTION.REMOVE_FROM_PUBLICATION
                    : TEAM_MEMBERS_TEXT.QUESTION.PUBLISH_MEMBER;
            return pendingAction === 'draft'
                ? COMMON_TEXT_ADMIN.QUESTION.SAVE_CHANGES
                : TEAM_MEMBERS_TEXT.QUESTION.PUBLISH_MEMBER;
        }
        return pendingAction === 'draft'
            ? TEAM_MEMBERS_TEXT.QUESTION.DRAFT_MEMBER
            : TEAM_MEMBERS_TEXT.QUESTION.PUBLISH_MEMBER;
    }, [isEditMode, member, pendingAction]);

    const getFormKey = useCallback(() => {
        if (isEditMode && member?.id) {
            return member.id;
        }
        return 'add';
    }, [isEditMode, member?.id]);

    const handleFormSubmit = useCallback((data: TeamMemberFormValues, status: VisibilityStatus) => {
        const currentIsValid = formRef.current?.isValid(false) || false;

        if (!currentIsValid) {
            return;
        }

        setPendingFormData(data);
        setPendingAction(status === VisibilityStatus.Published ? 'publish' : 'draft');
        setShowFormConfirmModal(true);
    }, []);

    const handleFormValidationChange = useCallback((isValid: boolean) => {
        setIsFormValid(isValid);
    }, []);

    const handleDraftSubmit = useCallback(() => {
        formRef.current?.submit(VisibilityStatus.Draft);
    }, []);

    const handlePublishSubmit = useCallback(() => {
        formRef.current?.submit(VisibilityStatus.Published);
    }, []);

    const resetPendingState = useCallback(() => {
        setPendingAction(null);
        setPendingFormData(null);
    }, []);

    const handleCancelConfirmation = useCallback(() => {
        setShowFormConfirmModal(false);
        resetPendingState();
        setIsSubmitting(false);
    }, [resetPendingState]);

    const handleConfirmClose = useCallback(() => {
        setShowCloseConfirmModal(false);
        onClose();
    }, [onClose]);

    const handleCancelClose = useCallback(() => {
        setShowCloseConfirmModal(false);
    }, []);

    const handleClose = useCallback(() => {
        if (formRef.current?.isDirty()) {
            setShowCloseConfirmModal(true);
        } else if (!isSubmitting) {
            onClose();
        }
    }, [isSubmitting, onClose]);

    return (
        <>
            <Modal isOpen={isOpen} onClose={handleClose}>
                <Modal.Title>
                    {isEditMode ? TEAM_MEMBERS_TEXT.FORM.TITLE.EDIT_MEMBER : TEAM_MEMBERS_TEXT.FORM.TITLE.ADD_MEMBER}
                </Modal.Title>
                <Modal.Content>
                    <MemberForm
                        ref={formRef}
                        key={getFormKey()}
                        initialData={initialData}
                        formDisabled={isSubmitting}
                        onSubmit={handleFormSubmit}
                        categories={categories}
                        onValidationChange={handleFormValidationChange}
                    />
                    {error && <div className="error-container">{error}</div>}
                </Modal.Content>
                <Modal.Actions>
                    <Button buttonStyle="secondary" onClick={handleDraftSubmit} disabled={isSubmitting || !isFormValid}>
                        {COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_DRAFTED}
                    </Button>
                    <Button buttonStyle="primary" onClick={handlePublishSubmit} disabled={isSubmitting || !isFormValid}>
                        {COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_PUBLISHED}
                    </Button>
                </Modal.Actions>
            </Modal>

            <QuestionModal
                isOpen={showFormConfirmModal}
                isButtonsDisabled={isSubmitting}
                title={getFormConfirmTitle()}
                onConfirm={handleConfirmAction}
                onCancel={handleCancelConfirmation}
                onClose={handleCancelConfirmation}
                confirmText={COMMON_TEXT_ADMIN.BUTTON.YES}
                cancelText={COMMON_TEXT_ADMIN.BUTTON.NO}
            />

            <QuestionModal
                isOpen={showCloseConfirmModal}
                isButtonsDisabled={false}
                title={COMMON_TEXT_ADMIN.QUESTION.CHANGES_WILL_BE_LOST_WISH_TO_CONTINUE}
                onConfirm={handleConfirmClose}
                onCancel={handleCancelClose}
                onClose={handleCancelClose}
                confirmText={COMMON_TEXT_ADMIN.BUTTON.YES}
                cancelText={COMMON_TEXT_ADMIN.BUTTON.NO}
            />
        </>
    );
};
