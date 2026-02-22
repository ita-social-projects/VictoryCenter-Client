import { useId, useState, useCallback } from 'react';
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
import { ReactComponent as PlusIcon } from '@/assets/icons/plus.svg';
import { EditableFaqCard } from './editable-faq-card/EditableFaqCard';
import styles from './FaqProgramSection.module.scss';

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

    const handleAddClick = useCallback(() => {
        onAddFaqPair?.(newQuestion, newAnswer);
        setNewQuestion('');
        setNewAnswer('');
    }, [onAddFaqPair, newQuestion, newAnswer]);

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
                                onChange={(e) => setNewQuestion(e.target.value)}
                                maxLength={FAQ_VALIDATION.question.max}
                                rows={2}
                                currentLength={getTrimmedInputText(newQuestion).length}
                            />
                            <TextAreaWithCharacterLimitGroup
                                label={FAQ_TEXT.FORM.LABEL.ANSWER}
                                isRequired
                                id={`${idPrefix}-faq-new-answer`}
                                name={`${idPrefix}-faq-new-answer`}
                                value={newAnswer}
                                onChange={(e) => setNewAnswer(e.target.value)}
                                maxLength={FAQ_VALIDATION.answer.max}
                                rows={4}
                                currentLength={getTrimmedInputText(newAnswer).length}
                            />
                        </div>

                        <div className={styles['actions-row']}>
                            <Button
                                buttonStyle="primary"
                                className={styles['add-button']}
                                onClick={handleAddClick}
                                type="button"
                            >
                                <span className={styles['add-button-text']}>{FAQ_TEXT.BUTTON.ADD_FAQ}</span>
                                <PlusIcon className={styles['add-button-icon']} />
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
                    {questions.map((faq, index) => (
                        <FaqCard key={faq.id || index} faq={faq} className={styles['faq-card-program-section']} />
                    ))}
                </div>
            </div>
        </div>
    );
};
