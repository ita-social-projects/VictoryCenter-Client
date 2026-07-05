import { useState } from 'react';
import { Button } from '@/components/admin/button/Button';
import { Modal } from '@/components/common/modal/Modal';
import { ConfirmationModal } from '@/components/admin/confirmation-modal/ConfirmationModal';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import styles from './LocalizationModal.module.scss';
import cn from 'classnames';

interface LocalizationModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    onSave: () => void;
    isSubmitting: boolean;
    isFormValid: boolean;
    saveButtonText?: string;
    checkIsDirty?: () => boolean;
    isDirty?: boolean;
    children: React.ReactNode;
    maxWidth?: string;
}

export const LocalizationModal = ({
    isOpen,
    onClose,
    title,
    onSave,
    isSubmitting,
    isFormValid,
    saveButtonText = COMMON_TEXT_ADMIN.BUTTON.SAVE_TRANSLATION,
    checkIsDirty,
    isDirty,
    children,
    maxWidth,
}: LocalizationModalProps) => {
    const [showCloseConfirm, setShowCloseConfirm] = useState(false);

    const handleRequestClose = () => {
        if (checkIsDirty && checkIsDirty()) {
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
            <Modal isOpen={isOpen} onClose={handleRequestClose} maxWidth={maxWidth}>
                <Modal.Title>{title}</Modal.Title>
                <Modal.Content>{children}</Modal.Content>
                <Modal.Actions>
                    <div className={cn(styles['modal-scope'], 'localization-modal')}>
                        <Button
                            buttonStyle="primary"
                            onClick={onSave}
                            disabled={!isFormValid || isSubmitting || !isDirty}
                            data-testid="save-localization-btn"
                            className={styles['save-localization-btn']}
                        >
                            {saveButtonText}
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
