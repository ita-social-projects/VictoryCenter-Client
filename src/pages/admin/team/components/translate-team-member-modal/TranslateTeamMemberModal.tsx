import { Button } from '@/components/admin/button/Button';
import { Modal } from '@/components/common/modal/Modal';
import { TEAM_MEMBERS_TEXT } from '@/const/admin/team';
import { TeamMember } from '@/types/admin/team-members';
import {
    TranslateMemberForm,
    TranslateTeamMemberFormRef,
    TranslateTeamMemberFormValues,
} from '../translate-member-form/TranslateMemberForm';
import { useRef, useState } from 'react';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { ConfirmationModal } from '@/components/admin/confirmation-modal/ConfirmationModal';
import styles from './TranslateTeamMemberModal.module.scss';
import { LocalizationLanguage } from '@/types/common/language';
import './TranslateTeamMemberModal.scss';
import { useTranslateTeamMember } from '@/hooks/admin/use-translate-team-member/useTranslateTeamMember';
import cn from 'classnames';

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

    const { translateMember, isSubmitting, error } = useTranslateTeamMember({
        member: memberToTranslate,
        language,
        onSuccess: (updatedMember) => {
            onTranslateMember(updatedMember);
            onClose();
        },
    });

    if (!memberToTranslate) return null;

    const handleSubmit = () => {
        if (!formRef.current?.isValid()) return;
        formRef.current.submit();
    };

    const handleFormSubmit = async (data: TranslateTeamMemberFormValues) => {
        await translateMember(data);
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
                <Modal.Title>{COMMON_TEXT_ADMIN.BUTTON.SAVE_TRANSLATION}</Modal.Title>

                <Modal.Content>
                    {error && <div className="translate-member-error">{error}</div>}
                    <TranslateMemberForm
                        ref={formRef}
                        onSubmit={handleFormSubmit}
                        onValidationChange={setIsFormValid}
                    />
                </Modal.Content>

                <Modal.Actions>
                    <div className={cn(styles['modal-scope'], 'translate-team-member-modal')}>
                        <Button
                            buttonStyle="primary"
                            onClick={handleSubmit}
                            disabled={!isFormValid || isSubmitting}
                            data-testid="translate-submit-btn"
                        >
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
