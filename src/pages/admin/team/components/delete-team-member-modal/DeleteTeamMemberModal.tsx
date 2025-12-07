import { useState } from 'react';
import { Modal } from '@components/common/modal/Modal';
import { TEAM_MEMBERS_TEXT } from '@const/admin/team';
import { COMMON_TEXT_ADMIN } from '@const/admin/common';
import { TeamMember } from '@app-types/admin/team-members';
import { useAdminClient } from '@hooks/admin/use-admin-client/useAdminClient';
import { TeamMembersApi } from '@api/admin/team/team-members/team-members-api';
import { Button } from '@components/admin/button/Button';
import './DeleteTeamMemberModal.scss';

export interface DeleteTeamMemberModalProps {
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
        if (isSubmitting || !memberToDelete) return;

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
            <Modal.Content>{error && <div className="delete-team-member-error-container">{error}</div>}</Modal.Content>
            <Modal.Actions>
                <Button
                    onClick={handleClose}
                    buttonStyle="secondary"
                    className="confirmation-btn"
                    disabled={isSubmitting}
                >
                    {COMMON_TEXT_ADMIN.BUTTON.NO}
                </Button>
                <Button
                    onClick={handleConfirmDelete}
                    buttonStyle="primary"
                    className="confirmation-btn"
                    disabled={isSubmitting || !memberToDelete}
                >
                    {COMMON_TEXT_ADMIN.BUTTON.YES}
                </Button>
            </Modal.Actions>
        </Modal>
    );
};
