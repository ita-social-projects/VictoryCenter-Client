import { useState } from 'react';
import { Modal } from '@/components/common/modal/Modal';
import { Button } from '@/components/admin/button/Button';
import { PROGRAMS_TEXT } from '@/const/admin/programs';
import { ProgramSectionTemplate } from '@/types/common/program-sections';
import { Swiper } from '@/components/public/swiper/Swiper';
import { renderProgramSection } from '@/utils/functions/render-program-section';
import placeholderImage from '@/assets/images/common/section-photo-placeholder.png';
import styles from './AddSectionModal.module.scss';
import swiperStyles from './AddSectionSwiper.module.scss';

export interface AddSectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectTemplate: (templateId: ProgramSectionTemplate) => void;
}

const TEMPLATES = [
    ProgramSectionTemplate.QuadImagesBottom,
    ProgramSectionTemplate.DualImagesBottom,
    ProgramSectionTemplate.TextOnly,
    ProgramSectionTemplate.TripleImagesBottom,
    ProgramSectionTemplate.SingleImageBottom,
    ProgramSectionTemplate.SingleImageTop,
    ProgramSectionTemplate.SingleImageRight,
    ProgramSectionTemplate.DualTitleDescription,
    ProgramSectionTemplate.TripleTitleDescription,
    ProgramSectionTemplate.QuadTitleDescription,
];

export const AddSectionModal = ({ isOpen, onClose, onSelectTemplate }: AddSectionModalProps) => {
    const [selectedTemplateIndex, setSelectedTemplateIndex] = useState(0);

    const getPlaceholderImages = (templateId: ProgramSectionTemplate) => {
        switch (templateId) {
            case ProgramSectionTemplate.QuadImagesBottom:
                return [placeholderImage, placeholderImage, placeholderImage, placeholderImage];
            case ProgramSectionTemplate.TripleImagesBottom:
                return [placeholderImage, placeholderImage, placeholderImage];
            case ProgramSectionTemplate.DualImagesBottom:
                return [placeholderImage, placeholderImage];
            case ProgramSectionTemplate.SingleImageBottom:
            case ProgramSectionTemplate.SingleImageTop:
            case ProgramSectionTemplate.SingleImageRight:
                return [placeholderImage];
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
        const cardSamples = PROGRAMS_TEXT.SECTION.CARD;
        const CARD_CONFIGS: Partial<Record<ProgramSectionTemplate, { title: string; description: string }[]>> = {
            [ProgramSectionTemplate.DualTitleDescription]: [
                {
                    title: cardSamples.TITLE_SAMPLE_TEXT.PROGRAM_GOALS,
                    description: cardSamples.DESCRIPTION_SAMPLE_TEXT.PROGRAM_GOALS,
                },
                {
                    title: cardSamples.TITLE_SAMPLE_TEXT.MAIN_METHODS,
                    description: cardSamples.DESCRIPTION_SAMPLE_TEXT.MAIN_METHODS,
                },
            ],
            [ProgramSectionTemplate.TripleTitleDescription]: [
                {
                    title: cardSamples.TITLE_SAMPLE_TEXT.PROGRAM_GOALS,
                    description: cardSamples.DESCRIPTION_SAMPLE_TEXT.PROGRAM_GOALS,
                },
                {
                    title: cardSamples.TITLE_SAMPLE_TEXT.MAIN_METHODS,
                    description: cardSamples.DESCRIPTION_SAMPLE_TEXT.MAIN_METHODS,
                },
                {
                    title: cardSamples.TITLE_SAMPLE_TEXT.PROGRAM_FORMAT,
                    description: cardSamples.DESCRIPTION_SAMPLE_TEXT.PROGRAM_FORMAT,
                },
            ],
            [ProgramSectionTemplate.QuadTitleDescription]: [
                {
                    title: cardSamples.TITLE_SAMPLE_TEXT.PROGRAM_GOALS,
                    description: cardSamples.DESCRIPTION_SAMPLE_TEXT.PROGRAM_GOALS,
                },
                {
                    title: cardSamples.TITLE_SAMPLE_TEXT.MAIN_METHODS,
                    description: cardSamples.DESCRIPTION_SAMPLE_TEXT.MAIN_METHODS,
                },
                {
                    title: cardSamples.TITLE_SAMPLE_TEXT.PROGRAM_GOALS,
                    description: cardSamples.DESCRIPTION_SAMPLE_TEXT.PROGRAM_GOALS,
                },
                {
                    title: cardSamples.TITLE_SAMPLE_TEXT.MAIN_METHODS,
                    description: cardSamples.DESCRIPTION_SAMPLE_TEXT.MAIN_METHODS,
                },
            ],
        };

        const cards = CARD_CONFIGS[templateId];

        return renderProgramSection({
            templateId,
            data: cards
                ? { cards }
                : {
                      title: PROGRAMS_TEXT.SECTION.TITLE_SAMPLE_TEXT,
                      description: PROGRAMS_TEXT.SECTION.DESCRIPTION_SAMPLE_TEXT,
                      images: getPlaceholderImages(templateId),
                  },
            isTemplate: true,
        });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} maxWidth="90vw">
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
                        className={swiperStyles['button-container']}
                        useChevrons={true}
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
