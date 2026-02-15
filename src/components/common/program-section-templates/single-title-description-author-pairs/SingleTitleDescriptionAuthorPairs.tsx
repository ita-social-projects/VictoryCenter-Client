import cn from 'classnames';
import { useMemo } from 'react';
import { InputWithCharacterLimitGroup } from '@/components/admin/input-groups/input-with-character-limit-group/InputWithCharacterLimitGroup';
import { Button } from '@/components/admin/button/Button';
import { PROGRAMS_TEXT } from '@/const/admin/programs';
import styles from './SingleTitleDescriptionAuthorPairs.module.scss';
import { DescriptionAuthorPairCard } from './description-author-pair-card/DescriptionAuthorPairCard';
import { ReactComponent as ArrowLeft } from '@/assets/icons/arrow-left.svg';
import { ReactComponent as ArrowRight } from '@/assets/icons/arrow-right.svg';
import { ReactComponent as PlusIcon } from '@/assets/icons/plus.svg';
import { CardCarousel } from './card-carousel/CardCarousel';
import { ProgramSectionMode, ProgramSectionTemplate } from '@/types/common/program-sections';
import { ContentType } from '@/types/common/programs';
import { getProgramSectionTemplateMaxLength } from '@/utils/functions/program-section-template-validation/programSectionTemplateValidation';

export interface DescriptionAuthorPairData {
    description: string;
    author: string;
}

export interface SingleTitleDescriptionAuthorPairsProps {
    title?: string;
    pairs?: DescriptionAuthorPairData[];
    mode?: ProgramSectionMode;
    onTitleChange?: (value: string) => void;
    onPairDescriptionChange?: (index: number, value: string) => void;
    onPairAuthorChange?: (index: number, value: string) => void;
    onAddPair?: () => void;
    onDeletePair?: (index: number) => void;
    canAddPair?: boolean;
}

const TEMPLATE_PAIRS_COUNT = 5;
const TEMPLATE = ProgramSectionTemplate.SingleTitleDescriptionAuthorPairs;

export const SingleTitleDescriptionAuthorPairs = ({
    title = '',
    pairs = [],
    mode = ProgramSectionMode.Published,
    onTitleChange,
    onPairDescriptionChange,
    onPairAuthorChange,
    onAddPair,
    onDeletePair,
    canAddPair = true,
}: SingleTitleDescriptionAuthorPairsProps) => {
    const isEditable = mode === ProgramSectionMode.Edit;
    const isTemplate = mode === ProgramSectionMode.Template;

    const titleMaxLength = getProgramSectionTemplateMaxLength(TEMPLATE, ContentType.Title);

    const normalizedPairs = useMemo(() => {
        if (!isTemplate) return pairs;

        const sampleDescription = PROGRAMS_TEXT.SECTION.DESCRIPTION_SAMPLE_TEXT_SHORT;
        const sampleAuthor = PROGRAMS_TEXT.SECTION.CARD.FORM.SAMPLE.AUTHOR;

        return Array.from({ length: TEMPLATE_PAIRS_COUNT }, (_, i) => ({
            description: pairs[i]?.description ?? sampleDescription,
            author: pairs[i]?.author ?? sampleAuthor,
        }));
    }, [isTemplate, pairs]);

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
                        onChange={(e) => onTitleChange?.(e.target.value)}
                        maxLength={titleMaxLength}
                        placeholder={PROGRAMS_TEXT.SECTION.FORM.TITLE.PLACEHOLDER}
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
                {normalizedPairs.map((p, idx) => (
                    <DescriptionAuthorPairCard
                        key={idx}
                        index={idx}
                        description={p.description}
                        author={p.author}
                        isEditable={isEditable}
                        onDescriptionChange={onPairDescriptionChange}
                        onAuthorChange={onPairAuthorChange}
                        onDelete={onDeletePair}
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
        </div>
    );
};
