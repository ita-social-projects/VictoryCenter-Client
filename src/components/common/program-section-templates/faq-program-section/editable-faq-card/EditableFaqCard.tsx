import { useState } from 'react';
import cn from 'classnames';
import { TextAreaWithCharacterLimitGroup } from '@/components/admin/input-groups/text-area-with-character-limit-group/TextAreaWithCharacterLimitGroup';
import { FAQ_TEXT, FAQ_VALIDATION } from '@/const/admin/faq';
import { getTrimmedInputText } from '@/utils/functions/formatters/text-formatters';
import { ReactComponent as ArrowIcon } from '@/assets/icons/arrow-down-right.svg';
import styles from './EditableFaqCard.module.scss';

interface EditableFaqCardProps {
    index: number;
    idPrefix: string;
    questionText: string;
    answerText: string;
    onQuestionChange: (index: number, value: string) => void;
    onAnswerChange: (index: number, value: string) => void;
    onDelete: (index: number) => void;
}

export const EditableFaqCard = ({
    index,
    idPrefix,
    questionText,
    answerText,
    onQuestionChange,
    onAnswerChange,
    onDelete,
}: EditableFaqCardProps) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className={cn(styles['card'], { [styles['card--expanded']]: isExpanded })}>
            <div className={styles['card-top-row']}>
                <button
                    type="button"
                    className={styles['delete-button']}
                    onClick={() => onDelete(index)}
                    aria-label="Delete question"
                />
            </div>
            <div className={styles['card-header']}>
                <TextAreaWithCharacterLimitGroup
                    label={FAQ_TEXT.FORM.LABEL.QUESTION}
                    isRequired
                    id={`${idPrefix}-faq-question-${index}`}
                    name={`${idPrefix}-faq-question-${index}`}
                    value={questionText}
                    onChange={(e) => onQuestionChange(index, e.target.value)}
                    maxLength={FAQ_VALIDATION.question.max}
                    rows={1}
                    currentLength={getTrimmedInputText(questionText).length}
                    className={styles['question-input']}
                />
                <div className={styles['expand-container']}>
                    <button
                        type="button"
                        className={cn(styles['expand-button'], { [styles['expand-button--open']]: isExpanded })}
                        onClick={() => setIsExpanded((prev) => !prev)}
                        aria-label={isExpanded ? 'Collapse answer' : 'Expand answer'}
                    >
                        <ArrowIcon />
                    </button>
                </div>
            </div>

            {isExpanded && (
                <div className={styles['card-body']}>
                    <TextAreaWithCharacterLimitGroup
                        label={FAQ_TEXT.FORM.LABEL.ANSWER}
                        isRequired
                        id={`${idPrefix}-faq-answer-${index}`}
                        name={`${idPrefix}-faq-answer-${index}`}
                        value={answerText}
                        onChange={(e) => onAnswerChange(index, e.target.value)}
                        maxLength={FAQ_VALIDATION.answer.max}
                        rows={4}
                        currentLength={getTrimmedInputText(answerText).length}
                    />
                </div>
            )}
        </div>
    );
};
