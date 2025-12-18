import { useState } from 'react';
import { Modal } from '@/components/common/modal/Modal';
import { Button } from '@/components/admin/button/Button';
import { PROGRAMS_TEXT } from '@/const/admin/programs';
import { ProgramSectionTemplate } from '@/types/common/program-sections';
import { renderProgramSection } from '@/utils/functions/render-program-section';
import { ReactComponent as ChevronLeft } from '@/assets/icons/chevron-left.svg';
import { ReactComponent as ChevronRight } from '@/assets/icons/chevron-right.svg';
import placeholderImage from '@/assets/images/common/section-photo-placeholder.png';
import styles from './AddSectionModal.module.scss';

export interface AddSectionModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const TEMPLATES = [
    ProgramSectionTemplate.QuadImagesBottom,
    ProgramSectionTemplate.DualImagesBottom,
    ProgramSectionTemplate.TextOnly,
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
        const selectedTemplateId = TEMPLATES[selectedTemplateIndex];
        // TODO: Implement save logic with selectedTemplateId
        console.log('Selected template:', selectedTemplateId);
        onClose();
    };

    const renderSection = () => {
        const templateId = TEMPLATES[selectedTemplateIndex];
        return renderProgramSection({
            templateId,
            data: {
                title: PROGRAMS_TEXT.SECTION.TITLE_SAMPLE_TEXT,
                description: PROGRAMS_TEXT.SECTION.DESCRIPTION_SAMPLE_TEXT,
                image1: placeholderImage,
                image2: placeholderImage,
                image3: placeholderImage,
                image4: placeholderImage,
            },
        });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} maxWidth="80vw">
            <Modal.Content>
                <div className={styles.content} data-testid="add-section-modal-content">
                    {renderSection()}
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
