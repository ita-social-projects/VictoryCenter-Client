import { useState } from 'react';
import { Modal } from '@/components/common/modal/Modal';
import { Button } from '@/components/admin/button/Button';
import { PROGRAMS_TEXT } from '@/const/admin/programs';
import { ProgramSectionMode, ProgramSectionTemplate } from '@/types/common/program-sections';
import { Swiper } from '@/components/public/swiper/Swiper';
import { renderProgramSection } from '@/utils/functions/render-program-section';
import placeholderImage from '@/assets/images/common/section-photo-placeholder.png';
import styles from './AddSectionModal.module.scss';
import swiperStyles from './AddSectionSwiper.module.scss';
import { ReactComponent as ChevronRight } from '@/assets/icons/chevron-right.svg';
import { ReactComponent as ChevronLeft } from '@/assets/icons/chevron-left.svg';
export interface AddSectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectTemplate: (templateId: ProgramSectionTemplate) => void;
}

const SWIPER_NAVIGATION_CONFIG = {
    classNamebuttonBlock: swiperStyles.buttonBlock,
    prev: {
        icon: ChevronLeft,
        ariaLabel: 'previous',
        variant: 'tertiary' as const,
        className: swiperStyles.left,
    },
    next: {
        icon: ChevronRight,
        ariaLabel: 'next',
        variant: 'tertiary' as const,
        className: swiperStyles.right,
    },
};

const TEMPLATES = [
    ProgramSectionTemplate.QuadImagesBottom,
    ProgramSectionTemplate.DualImagesBottom,
    ProgramSectionTemplate.TextOnly,
    ProgramSectionTemplate.TripleImagesBottom,
    ProgramSectionTemplate.SingleImageBottom,
    ProgramSectionTemplate.SingleImageTop,
    ProgramSectionTemplate.SingleImageRight,
];

export const AddSectionModal = ({ isOpen, onClose, onSelectTemplate }: AddSectionModalProps) => {
    const [selectedTemplateIndex, setSelectedTemplateIndex] = useState(0);

    const getPlaceholderImages = (templateId: ProgramSectionTemplate) => {
        const placeholderImageObject = {
            id: 0,
            url: placeholderImage,
            mimeType: 'image/png',
        };

        switch (templateId) {
            case ProgramSectionTemplate.QuadImagesBottom:
                return [placeholderImageObject, placeholderImageObject, placeholderImageObject, placeholderImageObject];
            case ProgramSectionTemplate.TripleImagesBottom:
                return [placeholderImageObject, placeholderImageObject, placeholderImageObject];
            case ProgramSectionTemplate.DualImagesBottom:
                return [placeholderImageObject, placeholderImageObject];
            case ProgramSectionTemplate.SingleImageBottom:
            case ProgramSectionTemplate.SingleImageTop:
            case ProgramSectionTemplate.SingleImageRight:
                return [placeholderImageObject];
            case ProgramSectionTemplate.TextOnly:
            default:
                return [];
        }
    };

    const handleSave = () => {
        const selectedTemplateId = TEMPLATES[selectedTemplateIndex];
        onSelectTemplate(selectedTemplateId);
        onClose();
    };

    const handleSlideChange = (activeIndex: number) => {
        setSelectedTemplateIndex(activeIndex);
    };

    const renderSection = (templateId: ProgramSectionTemplate) => {
        return renderProgramSection({
            templateId,
            data: {
                title: PROGRAMS_TEXT.SECTION.TITLE_SAMPLE_TEXT,
                description: PROGRAMS_TEXT.SECTION.DESCRIPTION_SAMPLE_TEXT,
                images: getPlaceholderImages(templateId),
            },
            mode: ProgramSectionMode.Template,
        });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} maxWidth="90vw" className={styles['modal-container']}>
            <Modal.Content>
                <div className={styles.container}>
                    <Swiper
                        items={TEMPLATES}
                        renderItem={(templateId) => (
                            <div className={styles['middle-section']}>
                                <div className={styles['template-content']} data-testid="add-section-modal-content">
                                    {renderSection(templateId)}
                                </div>
                            </div>
                        )}
                        slidesPerView={1}
                        onSlideChange={handleSlideChange}
                        navigationButtons={SWIPER_NAVIGATION_CONFIG}
                    />
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
