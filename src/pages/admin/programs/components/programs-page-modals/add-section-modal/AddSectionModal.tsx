import { useState } from 'react';
import { Modal } from '@/components/common/modal/Modal';
import { Button } from '@/components/admin/button/Button';
import { PROGRAMS_TEXT } from '@/const/admin/programs';
import { SECTIONS_TEXT } from '@/const/admin/sections';
import { SectionMode, SectionTemplate } from '@/types/common/sections';
import { Swiper } from '@/components/public/swiper/Swiper';
import { renderProgramSection } from '@/utils/functions/render-program-section';
import { MockQuestions } from '@/utils/mock-data/public/programs-page';
import placeholderImage from '@/assets/images/section-photo-placeholder.png';
import styles from './AddSectionModal.module.scss';
import swiperStyles from './AddSectionSwiper.module.scss';
import { ReactComponent as ChevronRight } from '@/assets/icons/chevron-right.svg';
import { ReactComponent as ChevronLeft } from '@/assets/icons/chevron-left.svg';

export interface AddSectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectTemplate: (templateId: SectionTemplate) => void;
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
    SectionTemplate.QuadImagesBottom,
    SectionTemplate.DualImagesBottom,
    SectionTemplate.TextOnly,
    SectionTemplate.TripleImagesBottom,
    SectionTemplate.SingleImageBottom,
    SectionTemplate.SingleImageTop,
    SectionTemplate.SingleImageRight,
    SectionTemplate.SingleTitleQuintupleDescription,
    SectionTemplate.DualTitleDescriptionPairs,
    SectionTemplate.TripleTitleDescriptionPairs,
    SectionTemplate.QuadTitleDescriptionPairs,
    SectionTemplate.SingleTitleDescriptionAuthorPairs,
    SectionTemplate.SingleTitleQuestionAnswerPairs,
];

export const AddSectionModal = ({ isOpen, onClose, onSelectTemplate }: AddSectionModalProps) => {
    const [selectedTemplateIndex, setSelectedTemplateIndex] = useState(0);

    const getPlaceholderImages = (templateId: SectionTemplate) => {
        const placeholderImageObject = {
            id: 0,
            url: placeholderImage,
            mimeType: 'image/png',
        };

        switch (templateId) {
            case SectionTemplate.QuadImagesBottom:
                return [placeholderImageObject, placeholderImageObject, placeholderImageObject, placeholderImageObject];
            case SectionTemplate.TripleImagesBottom:
                return [placeholderImageObject, placeholderImageObject, placeholderImageObject];
            case SectionTemplate.DualImagesBottom:
                return [placeholderImageObject, placeholderImageObject];
            case SectionTemplate.SingleImageBottom:
            case SectionTemplate.SingleImageTop:
            case SectionTemplate.SingleImageRight:
                return [placeholderImageObject];
            case SectionTemplate.TextOnly:
            case SectionTemplate.SingleTitleQuintupleDescription:
            case SectionTemplate.DualTitleDescriptionPairs:
            case SectionTemplate.TripleTitleDescriptionPairs:
            case SectionTemplate.QuadTitleDescriptionPairs:
            case SectionTemplate.SingleTitleDescriptionAuthorPairs:
            case SectionTemplate.SingleTitleQuestionAnswerPairs:
                return [];
            default:
                return [];
        }
    };

    const getPlaceholderDescriptions = (templateId: SectionTemplate) => {
        if (templateId === SectionTemplate.SingleTitleQuintupleDescription) {
            return Array.from({ length: 5 }, () => SECTIONS_TEXT.SECTION.DESCRIPTION_SAMPLE_TEXT_SHORT);
        }
        return undefined;
    };

    const getCardSamples = (templateId: SectionTemplate) => {
        const cardSamples = PROGRAMS_TEXT.SECTION.CARD;

        const CARD_CONFIGS: Partial<Record<SectionTemplate, { title: string; description: string }[]>> = {
            [SectionTemplate.DualTitleDescriptionPairs]: [
                {
                    title: cardSamples.TITLE_SAMPLE_TEXT.PROGRAM_GOALS,
                    description: cardSamples.DESCRIPTION_SAMPLE_TEXT.PROGRAM_GOALS,
                },
                {
                    title: cardSamples.TITLE_SAMPLE_TEXT.MAIN_METHODS,
                    description: cardSamples.DESCRIPTION_SAMPLE_TEXT.MAIN_METHODS,
                },
            ],
            [SectionTemplate.TripleTitleDescriptionPairs]: [
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
            [SectionTemplate.QuadTitleDescriptionPairs]: [
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

        return CARD_CONFIGS[templateId];
    };

    const handleSave = () => {
        const selectedTemplateId = TEMPLATES[selectedTemplateIndex];
        onSelectTemplate(selectedTemplateId);
        onClose();
    };

    const handleSlideChange = (activeIndex: number) => {
        setSelectedTemplateIndex(activeIndex);
    };

    const renderSection = (templateId: SectionTemplate) => {
        const cards = getCardSamples(templateId);
        if (templateId === SectionTemplate.SingleTitleQuestionAnswerPairs) {
            return renderProgramSection({
                templateId,
                data: {
                    faqQuestions: MockQuestions.questions.map((q, index) => ({
                        id: index,
                        questionText: q.question,
                        answerText: q.answer,
                        localizations: [],
                    })),
                },
                mode: SectionMode.Template,
            });
        }

        return renderProgramSection({
            templateId,
            data: cards
                ? { cards }
                : {
                      title: SECTIONS_TEXT.SECTION.TITLE_SAMPLE_TEXT,
                      description: SECTIONS_TEXT.SECTION.DESCRIPTION_SAMPLE_TEXT,
                      descriptions: getPlaceholderDescriptions(templateId),
                      images: getPlaceholderImages(templateId),
                  },
            mode: SectionMode.Template,
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
