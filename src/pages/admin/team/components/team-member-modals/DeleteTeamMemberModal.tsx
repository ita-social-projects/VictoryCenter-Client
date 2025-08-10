import React, { useState } from 'react';
import { TeamMember } from '../../../../../types/admin/TeamMembers';
import { Modal } from '../../../../../components/common/modal/Modal';
import { Button } from '../../../../../components/common/button/Button';
import { TEAM_MEMBERS_TEXT } from '../../../../../const/admin/team';
import { TeamMembersApi } from '../../../../../services/data-fetch/admin-page-data-fetch/team-page-data-fetch/TeamMembersApi/TeamMembersApi';
import { useAdminClient } from '../../../../../utils/hooks/use-admin-client/useAdminClient';
import './team-member-modal.scss';
import { COMMON_TEXT_ADMIN } from '../../../../../const/admin/common';

interface DeleteTeamMemberModalProps {
    isOpen: boolean;
    onClose: () => void;
    memberToDelete: TeamMember | null;
    onDeleteMember: (member: TeamMember) => void;
}

export const DeleteTeamMemberModal = ({
    isOpen,
    onClose,
    memberToDelete,
    onDeleteMember,
}: DeleteTeamMemberModalProps) => {
    const client = useAdminClient();
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const handleConfirmDelete = async () => {
        if (!memberToDelete) return;

        try {
            setIsSubmitting(true);
            setError('');

            await TeamMembersApi.delete(client, memberToDelete.id);
            onDeleteMember(memberToDelete);
            onClose();
        } catch {
            setError(TEAM_MEMBERS_TEXT.FORM.MESSAGE.FAIL_TO_DELETE_MEMBER);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        if (isSubmitting) return;
        setError('');
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose}>
            <Modal.Title>{TEAM_MEMBERS_TEXT.FORM.TITLE.DELETE_MEMBER}</Modal.Title>
            <Modal.Content>{error && <div className="error-container">{error}</div>}</Modal.Content>
            <Modal.Actions>
                <Button onClick={handleClose} buttonStyle="secondary">
                    {COMMON_TEXT_ADMIN.BUTTON.NO}
                </Button>
                <Button onClick={handleConfirmDelete} buttonStyle="primary" className="btn-danger">
                    {COMMON_TEXT_ADMIN.BUTTON.YES}
                </Button>
            </Modal.Actions>
        </Modal>
    );
};
