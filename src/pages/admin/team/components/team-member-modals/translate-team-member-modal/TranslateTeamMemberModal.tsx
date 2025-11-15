import { useMemo } from 'react';
import { TEAM_MEMBERS_TEXT } from '../../../../../../const/admin/team';
import { TeamMember } from '../../../../../../types/admin/team-members';
import { useGenericModal } from '../../../../../../hooks/admin/use-generic-modal/useGenericModal';
import { ModalMode } from '../../../../../../types/admin/common';
import { LocalizationModalWrapper } from '../../../../../../components/admin/modal-wrappers/localization-modal-wrapper/LocalizationModalWrapper';
import { TranslateMemberForm, TranslateTeamMemberFormRef } from '../../forms/translate-member-form/TranslateMemberForm';

interface TranslateTeamMemberModalProps {
    isOpen: boolean;
    onClose: () => void;
    onTranslateMember: (memberData: TeamMember) => void;
    memberToTranslate: TeamMember | null;
}

export const TranslateTeamMemberModal = ({
    isOpen,
    onClose,
    onTranslateMember,
    memberToTranslate,
}: TranslateTeamMemberModalProps) => {
    const modalConfig = useMemo(
        () => ({
            mode: ModalMode.Add,
            isOpen,
            onClose,
            entity: memberToTranslate,
            onSuccess: onTranslateMember || (() => {}),
            apiCall: () => {},
            getConfirmTitle: () => {},
            getErrorMessage: () => {},
            getFormKey: () => {},
            transformFormData: () => {},
        }),
        [isOpen, onClose, memberToTranslate, onTranslateMember],
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
