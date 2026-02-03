import cn from 'classnames';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { InputWithCharacterLimitGroup } from '@/components/admin/input-groups/input-with-character-limit-group/InputWithCharacterLimitGroup';
import { Button } from '@/components/admin/button/Button';
import { PROGRAMS_TEXT, PROGRAM_SECTION_VALIDATION } from '@/const/admin/programs';
import styles from './SingleTitleDescriptionAuthorPairs.module.scss';
import { DescriptionAuthorPairCard } from './description-author-pair-card/DescriptionAuthorPairCard';
import { ReactComponent as ArrowLeft } from '@/assets/icons/arrow-left.svg';
import { ReactComponent as ArrowRight } from '@/assets/icons/arrow-right.svg';
import { ReactComponent as PlusIcon } from '@/assets/icons/plus.svg';

export interface DescriptionAuthorPairData {
    description: string;
    author: string;
}

export interface SingleTitleDescriptionAuthorPairsProps {
    title?: string;
    pairs?: DescriptionAuthorPairData[];
    isTemplate?: boolean;
    isEditable?: boolean;
    onTitleChange?: (value: string) => void;
    onPairDescriptionChange?: (index: number, value: string) => void;
    onPairAuthorChange?: (index: number, value: string) => void;
    onAddPair?: () => void;
    canAddPair?: boolean;
}

const EPS = 2;

export const SingleTitleDescriptionAuthorPairs = ({
    title = '',
    pairs = [],
    isTemplate = false,
    isEditable = false,
    onTitleChange,
    onPairDescriptionChange,
    onPairAuthorChange,
    onAddPair,
    canAddPair = true,
}: SingleTitleDescriptionAuthorPairsProps) => {
    const viewportRef = useRef<HTMLDivElement | null>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    const normalizedPairs = useMemo(() => {
        if (!isTemplate) return pairs;

        const sampleDescription = PROGRAMS_TEXT.SECTION.DESCRIPTION_SAMPLE_TEXT_SHORT;
        const sampleAuthor = PROGRAMS_TEXT.SECTION.CARD.FORM.SAMPLE.AUTHOR;

        return Array.from({ length: 4 }, (_, i) => ({
            description: pairs[i]?.description ?? sampleDescription,
            author: pairs[i]?.author ?? sampleAuthor,
        }));
    }, [isTemplate, pairs]);

    const scrollStep = useMemo(() => {
        if (isTemplate) return 360 + 24;
        return 432 + 24;
    }, [isTemplate]);

    const updateNavState = useCallback(() => {
        const el = viewportRef.current;
        if (!el) return;

        const max = el.scrollWidth - el.clientWidth;
        setCanScrollLeft(el.scrollLeft > EPS);
        setCanScrollRight(max - el.scrollLeft > EPS);
    }, []);

    useEffect(() => {
        updateNavState();
        const onResize = () => updateNavState();
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, [updateNavState]);

    useEffect(() => {
        updateNavState();
    }, [updateNavState, normalizedPairs.length, pairs.length, isTemplate, isEditable]);

    const handleScroll = useCallback(() => {
        updateNavState();
    }, [updateNavState]);

    const scrollBy = useCallback(
        (direction: -1 | 1) => {
            const el = viewportRef.current;
            if (!el) return;

            el.scrollBy({
                left: direction * scrollStep,
                behavior: 'smooth',
            });

            setTimeout(updateNavState, 250);
        },
        [scrollStep, updateNavState],
    );

    const rootClassName = cn(styles.container, {
        [styles.template]: isTemplate && !isEditable,
        [styles.editable]: isEditable,
    });

    const content = (
        <>
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
                        maxLength={PROGRAM_SECTION_VALIDATION.title.max}
                        placeholder={PROGRAMS_TEXT.SECTION.FORM.TITLE.PLACEHOLDER}
                    />
                ) : (
                    <h2 className={styles.title}>{title}</h2>
                )}
            </div>

            <div className={styles['carousel-wrapper']}>
                {canScrollLeft && (
                    <button
                        type="button"
                        className={cn(styles['nav-button'], styles['nav-left'])}
                        onClick={() => scrollBy(-1)}
                        aria-label="previous"
                    >
                        <ArrowLeft />
                    </button>
                )}

                <div ref={viewportRef} className={styles['carousel-viewport']} onScroll={handleScroll}>
                    <div className={styles['carousel-track']}>
                        {normalizedPairs.map((p, idx) => (
                            <DescriptionAuthorPairCard
                                key={idx}
                                index={idx}
                                description={p.description}
                                author={p.author}
                                isEditable={isEditable}
                                onDescriptionChange={onPairDescriptionChange}
                                onAuthorChange={onPairAuthorChange}
                            />
                        ))}
                    </div>
                </div>

                {canScrollRight && (
                    <button
                        type="button"
                        className={cn(styles['nav-button'], styles['nav-right'])}
                        onClick={() => scrollBy(1)}
                        aria-label="next"
                    >
                        <ArrowRight />
                    </button>
                )}
            </div>

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
        </>
    );

    return (
        <div className={rootClassName}>
            {isTemplate && !isEditable ? <div className={styles['preview-scale']}>{content}</div> : content}
        </div>
    );
};
