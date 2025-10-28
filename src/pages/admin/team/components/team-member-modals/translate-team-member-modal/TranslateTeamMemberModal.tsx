import { useMemo } from 'react';
import { TEAM_MEMBERS_TEXT } from '../../../../../../const/admin/team';
import { TeamMember } from '../../../../../../types/admin/team-members';
import { useAdminClient } from '../../../../../../hooks/admin/use-admin-client/useAdminClient';
import { useGenericModal } from '../../../../../../hooks/admin/use-generic-modal/useGenericModal';
import { TranslateMemberForm, TranslateTeamMemberFormRef } from '../../translate-member-form/TranslateMemberForm';
import { ModalMode } from '../../../../../../types/admin/common';
import { LocalizationModalWrapper } from '../../../../../../components/admin/localization-modal-wrapper/LocalizationModalWrapper';

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
            mode: ModalMode.Add,
            isOpen,
            onClose,
            entity: memberToEdit,
            onSuccess: onTranslateMember || (() => {}),
            apiCall: () => {},
            getConfirmTitle: () => {},
            getErrorMessage: () => {},
            getFormKey: () => {},
            transformFormData: () => {},
        }),
        [isOpen, onClose, memberToEdit, onTranslateMember, client],
    );

    const modalHookData = useGenericModal<TranslateTeamMemberModalProps, TeamMember, TranslateTeamMemberFormRef>(
        modalConfig as any,
    );

    return (
        <LocalizationModalWrapper
            isOpen={isOpen}
            onClose={modalHookData.handleClose}
            onFormValidationChange={modalHookData.handleFormValidationChange}
            onFormSubmit={() => {}}
            onPublishSubmit={modalHookData.handlePublishSubmit}
            onConfirmAction={modalHookData.handleConfirmAction}
            onCancelConfirmation={modalHookData.handleCancelConfirmation}
            onConfirmClose={modalHookData.handleConfirmClose}
            onCancelClose={modalHookData.handleCancelClose}
            {...modalHookData}
            title={TEAM_MEMBERS_TEXT.FORM.TITLE.TRANSLATE_MEMBER}
            initialData={{}}
            renderForm={(props) => (
                <TranslateMemberForm
                    ref={modalHookData.formRef}
                    key={props.key}
                    formDisabled={props.formDisabled}
                    onSubmit={props.onSubmit}
                    onValidationChange={props.onValidationChange}
                />
            )}
        />
    );
};
