import { Button } from '../../../../../components/admin/button/Button';
import { Modal } from '../../../../../components/common/modal/Modal';
import { TEAM_MEMBERS_TEXT } from '../../../../../const/admin/team';
import { TeamMember, TeamMemberLocalization } from '../../../../../types/admin/team-members';
import {
    TranslateMemberForm,
    TranslateTeamMemberFormRef,
    TranslateTeamMemberFormValues,
} from '../translate-member-form/TranslateMemberForm';
import { useRef, useState } from 'react';
import { COMMON_TEXT_ADMIN } from '../../../../../const/admin/common';
import { ConfirmationModal } from '../../../../../components/admin/confirmation-modal/ConfirmationModal';
import styles from './TranslateTeamMemberModal.module.scss';
import { useAdminClient } from '../../../../../hooks/admin/use-admin-client/useAdminClient';
import { TeamMemberLocalizationsApi } from '../../../../../services/api/admin/team/team-member-localizations/team-member-localizations-api';
import { LocalizationLanguage } from '../../../../../types/common/language';
import { mapLocalizationDtoToModel } from '@/utils/functions/mappers/common/localization/localization-mappers';

interface TranslateTeamMemberModalProps {
    isOpen: boolean;
    onClose: () => void;
    memberToTranslate: TeamMember | null;
    onTranslateMember: (member: TeamMember) => void;
    language: LocalizationLanguage;
}

export const TranslateTeamMemberModal = ({
    isOpen,
    onClose,
    memberToTranslate,
    onTranslateMember,
    language,
}: TranslateTeamMemberModalProps) => {
    const formRef = useRef<TranslateTeamMemberFormRef>(null);

    const [showCloseConfirm, setShowCloseConfirm] = useState(false);
    const [isFormValid, setIsFormValid] = useState(false);

    const client = useAdminClient();

    if (!memberToTranslate) return null;

    const handleSubmit = () => {
        if (!formRef.current) return;
        if (!formRef.current.isValid()) return;

        formRef.current.submit();
    };

    const handleFormSubmit = async (data: TranslateTeamMemberFormValues) => {
        if (!memberToTranslate) return;

        const createdLocalizationDto = await TeamMemberLocalizationsApi.create(client, {
            entityId: memberToTranslate.id,
            languageId: language.id,
            fullName: data.fullName,
            description: data.description,
        });

        const createdLocalization = mapLocalizationDtoToModel<typeof createdLocalizationDto, TeamMemberLocalization>(
            createdLocalizationDto,
        );

        onTranslateMember({
            ...memberToTranslate,
            localizations: [...(memberToTranslate.localizations || []), createdLocalization],
        });
        onClose();
    };

    const handleRequestClose = () => {
        if (formRef.current?.isDirty()) {
            setShowCloseConfirm(true);
            return;
        }

        onClose();
    };

    const handleConfirmClose = () => {
        setShowCloseConfirm(false);
        onClose();
    };

    const handleCancelClose = () => {
        setShowCloseConfirm(false);
    };

    return (
        <>
            <Modal isOpen={isOpen} onClose={handleRequestClose}>
                <Modal.Title>{TEAM_MEMBERS_TEXT.FORM.TITLE.TRANSLATE_MEMBER}</Modal.Title>

                <Modal.Content>
                    <TranslateMemberForm
                        ref={formRef}
                        onSubmit={handleFormSubmit}
                        onValidationChange={setIsFormValid}
                    />
                </Modal.Content>

                <Modal.Actions>
                    <div className={styles['modal-scope']}>
                        <Button buttonStyle="primary" onClick={handleSubmit} disabled={!isFormValid}>
                            {TEAM_MEMBERS_TEXT.ACTIONS.TRANSLATE}
                        </Button>
                    </div>
                </Modal.Actions>
            </Modal>

            <ConfirmationModal
                isOpen={showCloseConfirm}
                title={COMMON_TEXT_ADMIN.QUESTION.CHANGES_WILL_BE_LOST_WISH_TO_CONTINUE}
                onConfirm={handleConfirmClose}
                onCancel={handleCancelClose}
                onClose={handleCancelClose}
            />
        </>
    );
};
