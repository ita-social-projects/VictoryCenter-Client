import { Modal } from '@/components/common/modal/Modal';
import { Button } from '@/components/admin/button/Button';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import './AddSectionModal.scss';

export interface AddSectionModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const AddSectionModal = ({ isOpen, onClose }: AddSectionModalProps) => {
    const handleSave = () => {
        // TODO: Implement save logic
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} maxWidth="80vw">
            <Modal.Title>Додати секцію</Modal.Title>
            <Modal.Content>
                <div className="add-section-modal-content">{/* Content will be implemented here */}</div>
            </Modal.Content>
            <Modal.Actions>
                <Button buttonStyle="secondary" onClick={onClose}>
                    {COMMON_TEXT_ADMIN.BUTTON.CANCEL}
                </Button>
                <Button buttonStyle="primary" onClick={handleSave}>
                    {COMMON_TEXT_ADMIN.BUTTON.SAVE}
                </Button>
            </Modal.Actions>
        </Modal>
    );
};
