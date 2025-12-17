import { Modal } from '@/components/common/modal/Modal';
import { Button } from '@/components/admin/button/Button';
import { PROGRAMS_TEXT } from '@/const/admin/programs';
import { ReactComponent as ChevronLeft } from '@/assets/icons/chevron-left.svg';
import { ReactComponent as ChevronRight } from '@/assets/icons/chevron-right.svg';
import styles from './AddSectionModal.module.scss';

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
            <Modal.Title>{PROGRAMS_TEXT.BUTTON.ADD_SECTION}</Modal.Title>
            <Modal.Content>
                <div className={styles.content} data-testid="add-section-modal-content">
                    {/* Content will be implemented here */}
                </div>
            </Modal.Content>
            <Modal.Actions>
                <div className={styles.actions}>
                    <button
                        title="scroll-left-button"
                        className={`${styles.chevronButton} ${styles.chevronButtonLeft}`}
                        onClick={() => {} /* TODO: Previous section */}
                        type="button"
                    >
                        <ChevronLeft />
                    </button>
                    <Button buttonStyle="primary" onClick={handleSave}>
                        {PROGRAMS_TEXT.BUTTON.CHOOSE_SECTION}
                    </Button>
                    <button
                        title="scroll-right-button"
                        className={`${styles.chevronButton} ${styles.chevronButtonRight}`}
                        onClick={() => {} /* TODO: Next section */}
                        type="button"
                    >
                        <ChevronRight />
                    </button>
                </div>
            </Modal.Actions>
        </Modal>
    );
};
