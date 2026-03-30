import { ConfirmationModal } from '@/components/admin/confirmation-modal/ConfirmationModal';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { COMPANY_PROFILE_TEXT } from '@/const/admin/company-profile';

export interface CompanyProfileDeleteSocialModalProps {
    isOpen: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

export const CompanyProfileDeleteSocialModal = ({
    isOpen,
    onConfirm,
    onCancel,
}: CompanyProfileDeleteSocialModalProps) => {
    return (
        <ConfirmationModal
            isOpen={isOpen}
            title={COMPANY_PROFILE_TEXT.MODAL.DELETE_SOCIAL_TITLE}
            onConfirm={onConfirm}
            onCancel={onCancel}
            onClose={onCancel}
            confirmText={COMMON_TEXT_ADMIN.BUTTON.YES}
            cancelText={COMMON_TEXT_ADMIN.BUTTON.NO}
        />
    );
};
