import { useState } from 'react';
import { useAdminClient } from '../../../../../hooks/admin/use-admin-client/useAdminClient';
import { PartnerSection } from '../../../../../types/admin/partners';
import { PartnersApi } from '../../../../../services/api/admin/partners/partners-api';
import { PARTNERS_TEXT } from '../../../../../const/admin/partners';
import { Modal } from '../../../../../components/common/modal/Modal';
import { Button } from '../../../../../components/admin/button/Button';
import { COMMON_TEXT_ADMIN } from '../../../../../const/admin/common';

interface DeletePartnerSectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    sectionToDelete: PartnerSection | null;
    onDeleteSection: (section: PartnerSection) => void;
}

export const DeletePartnerSectionModal = ({
    isOpen,
    onClose,
    sectionToDelete,
    onDeleteSection,
}: DeletePartnerSectionModalProps) => {
    const client = useAdminClient();
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const handleConfirmDelete = async () => {
        if (isSubmitting || !sectionToDelete) return;

        try {
            setIsSubmitting(true);
            setError('');

            await PartnersApi.deleteSection(client, sectionToDelete.id);
            onDeleteSection(sectionToDelete);
            onClose();
        } catch {
            setError(PARTNERS_TEXT.FORM.MESSAGE.FAIL_TO_DELETE_PARTNER_SECTION);
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
            <Modal.Title>{PARTNERS_TEXT.FORM.TITLE.DELETE_SECTION}</Modal.Title>
            <Modal.Content>
                {error && <div className="delete-partner-section-error-container">{error}</div>}
            </Modal.Content>
            <Modal.Actions>
                <Button onClick={handleClose} buttonStyle="secondary" disabled={isSubmitting}>
                    {COMMON_TEXT_ADMIN.BUTTON.NO}
                </Button>
                <Button
                    onClick={handleConfirmDelete}
                    buttonStyle="primary"
                    className="btn-danger"
                    disabled={isSubmitting || !sectionToDelete}
                >
                    {COMMON_TEXT_ADMIN.BUTTON.YES}
                </Button>
            </Modal.Actions>
        </Modal>
    );
};
