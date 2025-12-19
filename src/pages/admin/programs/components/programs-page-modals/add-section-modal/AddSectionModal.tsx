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
    ProgramSectionTemplate.SingleImageTop,
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
                <div className={styles.container}>
                    <div className={styles['left-section']}>
                        <button
                            title="scroll-left-button"
                            className={styles['chevron-button']}
                            onClick={handlePrevious}
                            type="button"
                        >
                            <ChevronLeft />
                        </button>
                    </div>
                    <div className={styles['middle-section']}>
                        <div className={styles['template-content']} data-testid="add-section-modal-content">
                            {renderSection()}
                        </div>
                    </div>
                    <div className={styles['right-section']}>
                        <button
                            title="scroll-right-button"
                            className={styles['chevron-button']}
                            onClick={handleNext}
                            type="button"
                        >
                            <ChevronRight />
                        </button>
                    </div>
                </div>
            </Modal.Content>
            <Modal.Actions>
                <div className={styles['button-wrapper']}>
                    <Button buttonStyle="primary" onClick={handleSave}>
                        {PROGRAMS_TEXT.BUTTON.CHOOSE_SECTION}
                    </Button>
                </div>
            </Modal.Actions>
        </Modal>
    );
};
