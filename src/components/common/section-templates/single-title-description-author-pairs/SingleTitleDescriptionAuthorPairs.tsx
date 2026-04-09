import cn from 'classnames';
import { useCallback, useMemo, useState } from 'react';
import { InputWithCharacterLimitGroup } from '@/components/admin/input-groups/input-with-character-limit-group/InputWithCharacterLimitGroup';
import { Button } from '@/components/admin/button/Button';
import { PROGRAMS_TEXT } from '@/const/admin/programs';
import styles from './SingleTitleDescriptionAuthorPairs.module.scss';
import { DescriptionAuthorPairCard } from './description-author-pair-card/DescriptionAuthorPairCard';
import { ReactComponent as ArrowLeft } from '@/assets/icons/arrow-left.svg';
import { ReactComponent as ArrowRight } from '@/assets/icons/arrow-right.svg';
import { ReactComponent as PlusIcon } from '@/assets/icons/plus.svg';
import { CardCarousel } from './card-carousel/CardCarousel';
import { SectionMode, SectionTemplate } from '@/types/common/program-sections';
import { ContentType } from '@/types/common/section-contents';
import { getProgramSectionTemplateMaxLength } from '@/utils/functions/program-section-template-validation/programSectionTemplateValidation';
import { PROGRAM_SECTION_VALIDATION_FUNCTIONS } from '@/validation/admin/program-schema/program-schema';
import { ConfirmationModal } from '@/components/admin/confirmation-modal/ConfirmationModal';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';

export interface DescriptionAuthorPairData {
    description: string;
    author: string;
}

export interface SingleTitleDescriptionAuthorPairsProps {
    title?: string;
    pairs?: DescriptionAuthorPairData[];
    mode?: SectionMode;
    onTitleChange?: (value: string) => void;
    onPairDescriptionChange?: (index: number, value: string) => void;
    onPairAuthorChange?: (index: number, value: string) => void;
    onAddPair?: () => void;
    onDeletePair?: (index: number) => void;
    canAddPair?: boolean;
}

const TEMPLATE_PAIRS_COUNT = 5;
const TEMPLATE = SectionTemplate.SingleTitleDescriptionAuthorPairs;

export const SingleTitleDescriptionAuthorPairs = ({
    title = '',
    pairs = [],
    mode = SectionMode.View,
    onTitleChange,
    onPairDescriptionChange,
    onPairAuthorChange,
    onAddPair,
    onDeletePair,
    canAddPair = true,
}: SingleTitleDescriptionAuthorPairsProps) => {
    const isEditable = mode === SectionMode.Edit;
    const isTemplate = mode === SectionMode.Template;

    const [titleError, setTitleError] = useState<string | undefined>(undefined);
    const [pendingDeletePairIndex, setPendingDeletePairIndex] = useState<number | null>(null);

    const titleMaxLength = getProgramSectionTemplateMaxLength(TEMPLATE, ContentType.Title);

    const validate = useCallback((value: string, type: ContentType) => {
        return PROGRAM_SECTION_VALIDATION_FUNCTIONS.validateContentText(value, type, true, TEMPLATE);
    }, []);

    const normalizedPairs = useMemo(() => {
        if (!isTemplate) return pairs;

        const sampleDescription = PROGRAMS_TEXT.SECTION.DESCRIPTION_SAMPLE_TEXT_SHORT;
        const sampleAuthor = PROGRAMS_TEXT.SECTION.CARD.FORM.SAMPLE.AUTHOR;

        return Array.from({ length: TEMPLATE_PAIRS_COUNT }, (_, i) => ({
            description: pairs[i]?.description ?? sampleDescription,
            author: pairs[i]?.author ?? sampleAuthor,
        }));
    }, [isTemplate, pairs]);

    const handleTitleBlur = useCallback(() => {
        if (!isEditable) return;
        setTitleError(validate(title, ContentType.Title));
    }, [isEditable, title, validate]);

    const handleTitleChange = useCallback(
        (value: string) => {
            const uppercasedTitle = value.toUpperCase();
            onTitleChange?.(uppercasedTitle);

            if (titleError !== undefined) {
                setTitleError(validate(uppercasedTitle, ContentType.Title));
            }
        },
        [onTitleChange, titleError, validate],
    );

    const requestDeletePair = useCallback(
        (index: number) => {
            if (!isEditable) return;
            if (!onDeletePair) return;
            if (pairs.length <= 1) return;
            setPendingDeletePairIndex(index);
        },
        [isEditable, onDeletePair, pairs.length],
    );

    const handleCancelDeletePair = useCallback(() => setPendingDeletePairIndex(null), []);

    const handleConfirmDeletePair = useCallback(() => {
        if (pendingDeletePairIndex === null) return;
        onDeletePair?.(pendingDeletePairIndex);
        setPendingDeletePairIndex(null);
    }, [pendingDeletePairIndex, onDeletePair]);

    const rootClassName = cn(styles.container, {
        [styles.template]: isTemplate,
        [styles.editable]: isEditable,
    });

    const carouselVariant = isTemplate ? 'template' : isEditable ? 'editable' : 'default';

    return (
        <div className={rootClassName}>
            <div className={styles['title-block']}>
                {isEditable ? (
                    <InputWithCharacterLimitGroup
                        className={styles['title-input-group']}
                        label={PROGRAMS_TEXT.SECTION.FORM.TITLE.TEXT}
                        isRequired
                        id="single-title-description-author-pairs-title"
                        name="single-title-description-author-pairs-title"
                        value={title}
                        onChange={(e) => handleTitleChange(e.target.value)}
                        onBlur={handleTitleBlur}
                        maxLength={titleMaxLength}
                        placeholder={PROGRAMS_TEXT.SECTION.SINGLE_TITLE_DESCRIPTION_AUTHOR_PAIRS.TITLE_PLACEHOLDER}
                        error={titleError}
                        maxLimitWarning={COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMaxError(titleMaxLength)}
                        showCounterBelow={true}
                    />
                ) : (
                    <h2 className={styles.title}>{title}</h2>
                )}
            </div>

            <CardCarousel
                itemsCount={normalizedPairs.length}
                LeftIcon={ArrowLeft}
                RightIcon={ArrowRight}
                variant={carouselVariant}
            >
                {normalizedPairs.map((pair, index) => (
                    <DescriptionAuthorPairCard
                        key={index}
                        index={index}
                        description={pair.description}
                        author={pair.author}
                        isEditable={isEditable}
                        onDescriptionChange={onPairDescriptionChange}
                        onAuthorChange={onPairAuthorChange}
                        onDelete={requestDeletePair}
                    />
                ))}
            </CardCarousel>

            {isEditable && (
                <div className={styles['actions-row']}>
                    <Button
                        buttonStyle="primary"
                        className={styles['add-card-button']}
                        onClick={onAddPair}
                        disabled={!canAddPair}
                        type="button"
                    >
                        <span className={styles['add-card-text']}>{PROGRAMS_TEXT.SECTION.CARD.BUTTON.ADD_CARD}</span>
                        <PlusIcon className={styles['add-card-icon']} />
                    </Button>
                </div>
            )}

            <ConfirmationModal
                isOpen={pendingDeletePairIndex !== null}
                title={PROGRAMS_TEXT.SECTION.SINGLE_TITLE_DESCRIPTION_AUTHOR_PAIRS.MODAL.DELETE_BLOCK_CONFIRMATION}
                isButtonsDisabled={false}
                onConfirm={handleConfirmDeletePair}
                onCancel={handleCancelDeletePair}
                onClose={handleCancelDeletePair}
                confirmText={COMMON_TEXT_ADMIN.BUTTON.YES}
                cancelText={COMMON_TEXT_ADMIN.BUTTON.NO}
            />
        </div>
    );
};
