import { COMMON_TEXT_ADMIN } from '../../../../const/admin/common';
import { ConfirmationModal } from '../../confirmation-modal/ConfirmationModal';

export interface ConfirmationModalsProps {
    showFormConfirmModal: boolean;
    showCloseConfirmModal: boolean;
    formConfirmTitle: string;
    isSubmitting: boolean;
    onConfirmClose: () => void;
    onCancelClose: () => void;
    onCancelConfirmation: () => void;
    onConfirmAction: () => void;
    onClose: () => void;
}

export const ConfirmationModals = ({
    showFormConfirmModal,
    showCloseConfirmModal,
    formConfirmTitle,
    isSubmitting,
    onConfirmClose,
    onCancelClose,
    onCancelConfirmation,
    onConfirmAction,
    onClose,
}: ConfirmationModalsProps) => {
    const handleCancel = () => {
        onCancelConfirmation();
        onClose();
    };

    return (
        <>
            <ConfirmationModal
                isOpen={showFormConfirmModal}
                isButtonsDisabled={isSubmitting}
                title={formConfirmTitle}
                onConfirm={onConfirmAction}
                onCancel={handleCancel}
                onClose={onClose}
                confirmText={COMMON_TEXT_ADMIN.BUTTON.YES}
                cancelText={COMMON_TEXT_ADMIN.BUTTON.NO}
            />

            <ConfirmationModal
                isOpen={showCloseConfirmModal}
                isButtonsDisabled={false}
                title={COMMON_TEXT_ADMIN.QUESTION.CHANGES_WILL_BE_LOST_WISH_TO_CONTINUE}
                onConfirm={onConfirmClose}
                onCancel={onCancelClose}
                onClose={onClose}
                confirmText={COMMON_TEXT_ADMIN.BUTTON.YES}
                cancelText={COMMON_TEXT_ADMIN.BUTTON.NO}
            />
        </>
    );
};
