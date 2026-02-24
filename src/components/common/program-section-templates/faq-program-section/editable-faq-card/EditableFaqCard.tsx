import { useCallback, useEffect, useRef, useState } from 'react';
import cn from 'classnames';
import { TextAreaWithCharacterLimitGroup } from '@/components/admin/input-groups/text-area-with-character-limit-group/TextAreaWithCharacterLimitGroup';
import { FAQ_TEXT, FAQ_VALIDATION } from '@/const/admin/faq';
import { getTrimmedInputText } from '@/utils/functions/formatters/text-formatters';
import { PROGRAM_SECTION_VALIDATION_FUNCTIONS } from '@/validation/admin/program-schema/program-schema';
import { ReactComponent as ArrowIcon } from '@/assets/icons/arrow-down-right.svg';
import styles from './EditableFaqCard.module.scss';

const { validateFaqQuestion, validateFaqAnswer } = PROGRAM_SECTION_VALIDATION_FUNCTIONS;

interface EditableFaqCardProps {
    index: number;
    idPrefix: string;
    questionText: string;
    answerText: string;
    isExpanded: boolean;
    autoFocus?: boolean;
    onQuestionChange: (index: number, value: string) => void;
    onAnswerChange: (index: number, value: string) => void;
    onDelete: (index: number) => void;
    onExpandToggle: (index: number) => void;
}

export const EditableFaqCard = ({
    index,
    idPrefix,
    questionText,
    answerText,
    isExpanded,
    autoFocus = false,
    onQuestionChange,
    onAnswerChange,
    onDelete,
    onExpandToggle,
}: EditableFaqCardProps) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const [questionError, setQuestionError] = useState<string | undefined>(undefined);
    const [answerError, setAnswerError] = useState<string | undefined>(undefined);

    useEffect(() => {
        if (autoFocus && cardRef.current) {
            const textarea = cardRef.current.querySelector('textarea');
            textarea?.focus();
        }
    }, [autoFocus]);

    const handleQuestionChange = useCallback(
        (e: React.ChangeEvent<HTMLTextAreaElement>) => {
            const v = e.target.value;
            onQuestionChange(index, v);
            if (questionError !== undefined) {
                setQuestionError(validateFaqQuestion(v));
            }
        },
        [index, onQuestionChange, questionError],
    );

    const handleAnswerChange = useCallback(
        (e: React.ChangeEvent<HTMLTextAreaElement>) => {
            const v = e.target.value;
            onAnswerChange(index, v);
            if (answerError !== undefined) {
                setAnswerError(validateFaqAnswer(v));
            }
        },
        [index, onAnswerChange, answerError],
    );

    const handleQuestionBlur = useCallback(() => {
        setQuestionError(validateFaqQuestion(questionText));
    }, [questionText]);

    const handleAnswerBlur = useCallback(() => {
        setAnswerError(validateFaqAnswer(answerText));
    }, [answerText]);

    return (
        <div ref={cardRef} className={cn(styles['card'], { [styles['card--expanded']]: isExpanded })}>
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
                    onChange={handleQuestionChange}
                    onBlur={handleQuestionBlur}
                    maxLength={FAQ_VALIDATION.question.max}
                    rows={2}
                    currentLength={getTrimmedInputText(questionText).length}
                    className={styles['question-input']}
                    error={questionError}
                />
                <div className={styles['expand-container']}>
                    <button
                        type="button"
                        className={cn(styles['expand-button'], { [styles['expand-button--open']]: isExpanded })}
                        onClick={() => onExpandToggle(index)}
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
                        onChange={handleAnswerChange}
                        onBlur={handleAnswerBlur}
                        maxLength={FAQ_VALIDATION.answer.max}
                        rows={3}
                        currentLength={getTrimmedInputText(answerText).length}
                        error={answerError}
                    />
                </div>
            )}
        </div>
    );
};
