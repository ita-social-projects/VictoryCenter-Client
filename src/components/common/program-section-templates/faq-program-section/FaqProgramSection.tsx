import { useId, useState, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import cn from 'classnames';
import { FaqCard } from '@/components/public/faq-section/faq-card/FaqCard';
import { TextAreaWithCharacterLimitGroup } from '@/components/admin/input-groups/text-area-with-character-limit-group/TextAreaWithCharacterLimitGroup';
import { Button } from '@/components/admin/button/Button';
import { FAQ_TEXT, FAQ_VALIDATION } from '@/const/admin/faq';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { PROGRAMS_TEXT } from '@/const/admin/programs';
import { useProgramSectionValidation } from '@/hooks/admin/use-program-section-validation';
import { PublishedFaqQuestion } from '@/types/public/faq-section';
import { FaqQuestion } from '@/types/admin/faq';
import { ProgramSectionMode, ProgramSectionTemplate } from '@/types/common/program-sections';
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
    faqPairs?: FaqQuestion[];
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

    const [newQuestion, setNewQuestion] = useState('');
    const [newAnswer, setNewAnswer] = useState('');
    const [newQuestionError, setNewQuestionError] = useState<string | undefined>(undefined);
    const [newAnswerError, setNewAnswerError] = useState<string | undefined>(undefined);

    const isNewPairValid = useMemo(() => {
        return !validateFaqQuestion(newQuestion) && !validateFaqAnswer(newAnswer);
    }, [newQuestion, newAnswer]);

    const handleNewQuestionChange = useCallback(
        (e: React.ChangeEvent<HTMLTextAreaElement>) => {
            const v = e.target.value;
            setNewQuestion(v);
            if (newQuestionError !== undefined) {
                setNewQuestionError(validateFaqQuestion(v));
            }
        },
        [newQuestionError],
    );

    const handleNewAnswerChange = useCallback(
        (e: React.ChangeEvent<HTMLTextAreaElement>) => {
            const v = e.target.value;
            setNewAnswer(v);
            if (newAnswerError !== undefined) {
                setNewAnswerError(validateFaqAnswer(v));
            }
        },
        [newAnswerError],
    );

    const handleNewQuestionBlur = useCallback(() => {
        setNewQuestionError(validateFaqQuestion(newQuestion));
    }, [newQuestion]);

    const handleNewAnswerBlur = useCallback(() => {
        setNewAnswerError(validateFaqAnswer(newAnswer));
    }, [newAnswer]);

    const handleAddClick = useCallback(() => {
        const qError = validateFaqQuestion(newQuestion);
        const aError = validateFaqAnswer(newAnswer);

        if (qError || aError) {
            setNewQuestionError(qError);
            setNewAnswerError(aError);
            return;
        }

        onAddFaqPair?.(newQuestion, newAnswer);
        setNewQuestion('');
        setNewAnswer('');
        setNewQuestionError(undefined);
        setNewAnswerError(undefined);
    }, [onAddFaqPair, newQuestion, newAnswer]);

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
                            value={title || COMMON_TEXT_ADMIN.TAB.FAQ}
                            onChange={handleTitleChange}
                            onBlur={handleTitleBlur}
                            maxLength={titleMaxLength}
                            rows={1}
                            error={titleError}
                            currentLength={getTrimmedInputText(title || COMMON_TEXT_ADMIN.TAB.FAQ).length}
                            className={styles['title-input-group']}
                        />
                    </div>

                    <div className={styles['right-section']}>
                        {faqPairs.map((pair, index) => (
                            <EditableFaqCard
                                key={pair.id || index}
                                index={index}
                                idPrefix={idPrefix}
                                questionText={pair.questionText}
                                answerText={pair.answerText}
                                onQuestionChange={(i, val) => onFaqQuestionChange?.(i, val)}
                                onAnswerChange={(i, val) => onFaqAnswerChange?.(i, val)}
                                onDelete={(i) => onDeleteFaqPair?.(i)}
                            />
                        ))}

                        <div className={styles['new-pair']}>
                            <TextAreaWithCharacterLimitGroup
                                label={FAQ_TEXT.FORM.LABEL.QUESTION}
                                isRequired
                                id={`${idPrefix}-faq-new-question`}
                                name={`${idPrefix}-faq-new-question`}
                                value={newQuestion}
                                onChange={handleNewQuestionChange}
                                onBlur={handleNewQuestionBlur}
                                maxLength={FAQ_VALIDATION.question.max}
                                rows={2}
                                currentLength={getTrimmedInputText(newQuestion).length}
                                error={newQuestionError}
                            />
                            <TextAreaWithCharacterLimitGroup
                                label={FAQ_TEXT.FORM.LABEL.ANSWER}
                                isRequired
                                id={`${idPrefix}-faq-new-answer`}
                                name={`${idPrefix}-faq-new-answer`}
                                value={newAnswer}
                                onChange={handleNewAnswerChange}
                                onBlur={handleNewAnswerBlur}
                                maxLength={FAQ_VALIDATION.answer.max}
                                rows={3}
                                currentLength={getTrimmedInputText(newAnswer).length}
                                error={newAnswerError}
                            />
                        </div>

                        <div className={styles['actions-row']}>
                            <Button
                                buttonStyle="primary"
                                className={styles['add-button']}
                                onClick={handleAddClick}
                                type="button"
                                disabled={!isNewPairValid}
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
