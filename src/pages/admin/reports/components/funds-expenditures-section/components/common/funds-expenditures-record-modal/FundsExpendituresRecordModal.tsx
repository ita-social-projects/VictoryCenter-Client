import { ReactNode } from 'react';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { Button } from '@/components/admin/button/Button';
import { ConfirmationModal } from '@/components/admin/confirmation-modal/ConfirmationModal';
import { Modal } from '@/components/common/modal/Modal';
import { useDirtyModalCloseConfirmation } from '@/hooks/admin/use-dirty-modal-close-confirmation/useDirtyModalCloseConfirmation';
import styles from './FundsExpendituresRecordModal.module.scss';

interface FundsExpendituresRecordModalProps {
    isOpen: boolean;
    title: string;
    subtitle: string;
    submitButtonLabel: string;
    isSubmitDisabled: boolean;
    isDirty: boolean;
    onSubmit: () => void;
    onClose: () => void;
    closeConfirmationTitle: string;
    children: ReactNode;
}

export const FundsExpendituresRecordModal = ({
    isOpen,
    title,
    subtitle,
    submitButtonLabel,
    isSubmitDisabled,
    isDirty,
    onSubmit,
    onClose,
    closeConfirmationTitle,
    children,
}: FundsExpendituresRecordModalProps) => {
    const { isCloseConfirmOpen, handleRequestClose, handleConfirmClose, handleCancelClose } =
        useDirtyModalCloseConfirmation({
            isDirty,
            onClose,
        });

    return (
        <>
            <Modal isOpen={isOpen} onClose={handleRequestClose} className={styles.modal} maxWidth="650px">
                <Modal.Title>
                    <div className={styles.header}>
                        <h2 className={styles.title}>{title}</h2>
                        <p className={styles.subtitle}>{subtitle}</p>
                    </div>
                </Modal.Title>
                <Modal.Content>
                    <div className={styles.content}>
                        <div className={styles.panel}>{children}</div>
                    </div>
                </Modal.Content>
                <Modal.Actions>
                    <div className={styles.actions}>
                        <Button
                            buttonStyle="primary"
                            onClick={onSubmit}
                            disabled={isSubmitDisabled}
                            className={styles.submit}
                        >
                            {submitButtonLabel}
                        </Button>
                        <Button buttonStyle="secondary" onClick={handleRequestClose} className={styles.cancel}>
                            {COMMON_TEXT_ADMIN.BUTTON.CANCEL}
                        </Button>
                    </div>
                </Modal.Actions>
            </Modal>

            <ConfirmationModal
                isOpen={isCloseConfirmOpen}
                title={closeConfirmationTitle}
                onConfirm={handleConfirmClose}
                onCancel={handleCancelClose}
                onClose={handleCancelClose}
            />
        </>
    );
};
