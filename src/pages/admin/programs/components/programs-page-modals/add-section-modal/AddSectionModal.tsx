import { useState } from 'react';
import { Modal } from '@/components/common/modal/Modal';
import { Button } from '@/components/admin/button/Button';
import { PROGRAMS_TEXT } from '@/const/admin/programs';
import { ProgramSectionTemplate } from '@/types/common/program-sections';
import { QuadImagesBottom } from '@/components/common/program-section-templates/quad-images-bottom/QuadImagesBottom';
import { DualImagesBottom } from '@/components/common/program-section-templates/dual-images-bottom/DualImagesBottom';
import { TextOnly } from '@/components/common/program-section-templates/text-only/TextOnly';
import { ReactComponent as ChevronLeft } from '@/assets/icons/chevron-left.svg';
import { ReactComponent as ChevronRight } from '@/assets/icons/chevron-right.svg';
import styles from './AddSectionModal.module.scss';

export interface AddSectionModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const TEMPLATES = [
    { id: ProgramSectionTemplate.QuadImagesBottom, component: QuadImagesBottom },
    { id: ProgramSectionTemplate.DualImagesBottom, component: DualImagesBottom },
    { id: ProgramSectionTemplate.TextOnly, component: TextOnly },
];

export const AddSectionModal = ({ isOpen, onClose }: AddSectionModalProps) => {
    const [selectedTemplateIndex, setSelectedTemplateIndex] = useState(0);

    const handlePrevious = () => {
        setSelectedTemplateIndex((prev) => (prev === 0 ? TEMPLATES.length - 1 : prev - 1));
    };

    const handleNext = () => {
        setSelectedTemplateIndex((prev) => (prev === TEMPLATES.length - 1 ? 0 : prev + 1));
    };

    const handleSave = () => {
        const selectedTemplate = TEMPLATES[selectedTemplateIndex];
        // TODO: Implement save logic with selectedTemplate.id
        console.log('Selected template:', selectedTemplate.id);
        onClose();
    };

    const SelectedTemplateComponent = TEMPLATES[selectedTemplateIndex].component;

    return (
        <Modal isOpen={isOpen} onClose={onClose} maxWidth="80vw">
            <Modal.Title>{PROGRAMS_TEXT.BUTTON.ADD_SECTION}</Modal.Title>
            <Modal.Content>
                <div className={styles.content} data-testid="add-section-modal-content">
                    <SelectedTemplateComponent />
                </div>
            </Modal.Content>
            <Modal.Actions>
                <div className={styles.actions}>
                    <button
                        title="scroll-left-button"
                        className={`${styles.chevronButton} ${styles.chevronButtonLeft}`}
                        onClick={handlePrevious}
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
                        onClick={handleNext}
                        type="button"
                    >
                        <ChevronRight />
                    </button>
                </div>
            </Modal.Actions>
        </Modal>
    );
};
