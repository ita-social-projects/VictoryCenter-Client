import { ConfirmationModal } from '@/components/admin/confirmation-modal/ConfirmationModal';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';

export interface MainPagePublishModalProps {
    isOpen: boolean;
    onConfirm: () => void;
    onCancel: () => void;
    isButtonsDisabled?: boolean;
}

export const MainPagePublishModal = ({ isOpen, onConfirm, onCancel, isButtonsDisabled }: MainPagePublishModalProps) => {
    return (
        <ConfirmationModal
            isOpen={isOpen}
            title={COMMON_TEXT_ADMIN.QUESTION.PUBLISH_CHANGES}
            onConfirm={onConfirm}
            onCancel={onCancel}
            onClose={onCancel}
            confirmText={COMMON_TEXT_ADMIN.BUTTON.YES}
            cancelText={COMMON_TEXT_ADMIN.BUTTON.NO}
            isButtonsDisabled={isButtonsDisabled}
        />
    );
};
