import { useId, useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import cn from 'classnames';
import { FaqCard } from '@/components/public/faq-section/faq-card/FaqCard';
import { TextAreaWithCharacterLimitGroup } from '@/components/admin/input-groups/text-area-with-character-limit-group/TextAreaWithCharacterLimitGroup';
import { Button } from '@/components/admin/button/Button';
import { PROGRAMS_TEXT } from '@/const/admin/programs';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { useProgramSectionValidation } from '@/hooks/admin/use-program-section-validation';
import { PublishedFaqQuestion } from '@/types/public/faq-section';
import { FaqSectionQuestionDto, ProgramSectionMode, ProgramSectionTemplate } from '@/types/common/program-sections';
import { ContentType } from '@/types/common/programs';
import { getProgramSectionTemplateMaxLength } from '@/utils/functions/program-section-template-validation/programSectionTemplateValidation';
import { getTrimmedInputText } from '@/utils/functions/formatters/text-formatters';
import { PROGRAM_SECTION_VALIDATION_FUNCTIONS } from '@/validation/admin/program-schema/program-schema';
import { ReactComponent as PlusIcon } from '@/assets/icons/plus.svg';
import { EditableFaqCard } from './editable-faq-card/EditableFaqCard';
import styles from './FaqProgramSection.module.scss';

const { validateFaqQuestion, validateFaqAnswer } = PROGRAM_SECTION_VALIDATION_FUNCTIONS;

export interface FaqProgramSectionProps {
    questions?: PublishedFaqQuestion[];
    mode?: ProgramSectionMode;
    title?: string;
    onTitleChange?: (value: string) => void;
    faqPairs?: FaqSectionQuestionDto[];
    onFaqQuestionChange?: (index: number, value: string) => void;
    onFaqAnswerChange?: (index: number, value: string) => void;
    onAddFaqPair?: (questionText: string, answerText: string) => void;
    onDeleteFaqPair?: (index: number) => void;
    validationResetKey?: number;
}

const TEMPLATE = ProgramSectionTemplate.SingleTitleQuestionAnswerPairs;

export const FaqProgramSection = ({
    questions = [],
    mode = ProgramSectionMode.View,
    title,
    onTitleChange,
    faqPairs = [],
    onFaqQuestionChange,
    onFaqAnswerChange,
    onAddFaqPair,
    onDeleteFaqPair,
    validationResetKey,
}: FaqProgramSectionProps) => {
    const { t } = useTranslation('programsPage');
    const idPrefix = useId();

    const displayTitle = title || t('COMMON_QUESTIONS');
    const isTemplate = mode === ProgramSectionMode.Template;
    const isEditable = mode === ProgramSectionMode.Edit;

    const titleMaxLength = getProgramSectionTemplateMaxLength(TEMPLATE, ContentType.Title);

    const { titleError, handleTitleChange, handleTitleBlur } = useProgramSectionValidation({
        template: TEMPLATE,
        onTitleChange,
        resetKey: validationResetKey,
    });

    const [expandedIndex, setExpandedIndex] = useState<number | null>(faqPairs.length === 1 ? 0 : null);
    const [autoFocusIndex, setAutoFocusIndex] = useState<number | null>(null);
    const initialPairAddedRef = useRef(false);

    useEffect(() => {
        if (isEditable && faqPairs.length === 0 && !initialPairAddedRef.current) {
            initialPairAddedRef.current = true;
            onAddFaqPair?.('', '');
            setExpandedIndex(0);
            setAutoFocusIndex(0);
        }
    }, [isEditable, faqPairs.length, onAddFaqPair]);

    const isAddDisabled =
        faqPairs.length > 0 &&
        faqPairs.some((pair) => !!validateFaqQuestion(pair.questionText) || !!validateFaqAnswer(pair.answerText));

    const handleAddClick = useCallback(() => {
        onAddFaqPair?.('', '');
        const newIndex = faqPairs.length;
        setExpandedIndex(newIndex);
        setAutoFocusIndex(newIndex);
    }, [onAddFaqPair, faqPairs.length]);

    const handleExpandToggle = useCallback((index: number) => {
        setExpandedIndex((prev) => (prev === index ? null : index));
    }, []);

    const handleDelete = useCallback(
        (index: number) => {
            onDeleteFaqPair?.(index);
            setExpandedIndex((prev) => {
                if (prev === null) return null;
                if (prev === index) return null;
                if (prev > index) return prev - 1;
                return prev;
            });
            setAutoFocusIndex(null);
        },
        [onDeleteFaqPair],
    );

    const viewQuestions: PublishedFaqQuestion[] = useMemo(() => {
        if (questions.length > 0) return questions;

        return faqPairs.map((pair, index) => ({
            id: pair.id ?? -(index + 1),
            questionText: pair.questionText,
            answerText: pair.answerText,
        }));
    }, [questions, faqPairs]);

    const rootClassName = cn(styles['faq-section'], {
        [styles['template']]: isTemplate,
        [styles['editable']]: isEditable,
    });

    if (isEditable) {
        return (
            <div className={rootClassName}>
                <div className={styles['faq-block']}>
                    <div className={styles['left-section']}>
                        <TextAreaWithCharacterLimitGroup
                            label={PROGRAMS_TEXT.SECTION.FORM.TITLE.TEXT}
                            isRequired
                            id={`${idPrefix}-faq-title`}
                            name={`${idPrefix}-faq-title`}
                            value={title ?? ''}
                            onChange={handleTitleChange}
                            onBlur={handleTitleBlur}
                            maxLength={titleMaxLength}
                            rows={1}
                            error={titleError}
                            currentLength={getTrimmedInputText(title ?? '').length}
                            className={styles['title-input-group']}
                            maxLimitWarning={COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMaxError(titleMaxLength)}
                        />
                    </div>

                    <div className={styles['right-section']}>
                        <div className={styles['cards-list']}>
                            {faqPairs.map((pair, index) => (
                                <EditableFaqCard
                                    key={pair.id || index}
                                    index={index}
                                    idPrefix={idPrefix}
                                    questionText={pair.questionText}
                                    answerText={pair.answerText}
                                    isExpanded={expandedIndex === index}
                                    autoFocus={autoFocusIndex === index}
                                    canDelete={faqPairs.length > 1}
                                    onQuestionChange={(i, val) => onFaqQuestionChange?.(i, val)}
                                    onAnswerChange={(i, val) => onFaqAnswerChange?.(i, val)}
                                    onDelete={handleDelete}
                                    onExpandToggle={handleExpandToggle}
                                />
                            ))}
                        </div>

                        <div className={styles['actions-row']}>
                            <Button
                                buttonStyle="primary"
                                className={styles['add-button']}
                                onClick={handleAddClick}
                                type="button"
                                disabled={isAddDisabled}
                            >
                                {PROGRAMS_TEXT.BUTTON.ADD}
                                <PlusIcon />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={rootClassName}>
            <div className={styles['faq-block']}>
                <h2 className={styles['title']}>{displayTitle}</h2>
                <div className={styles['questions-container']}>
                    {viewQuestions.map((faq, index) => (
                        <FaqCard key={faq.id || index} faq={faq} className={styles['faq-card-program-section']} />
                    ))}
                </div>
            </div>
        </div>
    );
};
