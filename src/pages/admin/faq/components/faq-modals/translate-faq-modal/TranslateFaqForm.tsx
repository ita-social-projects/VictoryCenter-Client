import { forwardRef } from 'react';
import { useFormManager } from '@/hooks/admin/use-form-manager/useFormManager';
import { VisibilityStatus } from '@/types/admin/common';
import styles from './TranslateFaqForm.module.scss';
import cn from 'classnames';
import { InputWithCharacterLimitGroup } from '@/components/admin/input-groups/input-with-character-limit-group/InputWithCharacterLimitGroup';
import { TextAreaWithCharacterLimitGroup } from '@/components/admin/input-groups/text-area-with-character-limit-group/TextAreaWithCharacterLimitGroup';
import { FAQ_TEXT, FAQ_VALIDATION } from '@/const/admin/faq';
import { TranslationControls } from '@/components/admin/translation-controls/TranslationControls';
import { FAQ_VALIDATION_FUNCTIONS } from '@/validation/admin/faq-schema/faq-schema'; // Импорт валидации

export interface TranslateFaqFormValues {
    question: string;
    answer: string;
}

export interface TranslateFaqFormErrorState {
    question?: string[];
    answer?: string;
    [key: string]: string | string[] | undefined;
}

export interface TranslateFaqFormRef {
    submit: (status?: VisibilityStatus) => Promise<void>;
    isValid: () => boolean;
    isDirty: () => boolean;
}

export interface TranslateFaqFormProps {
    onSubmit: (data: TranslateFaqFormValues, status?: VisibilityStatus) => void | Promise<void>;
    initialData?: TranslateFaqFormValues | null;
    formDisabled?: boolean;
    onValidationChange?: (isValid: boolean) => void;
}

const DEFAULT_FORM_STATE: TranslateFaqFormValues = {
    question: '',
    answer: '',
};

const validateForm = (formState: TranslateFaqFormValues, _isPublishing: boolean): TranslateFaqFormErrorState => {
    return {
        question: FAQ_VALIDATION_FUNCTIONS.validateQuestion(formState.question),
        answer: FAQ_VALIDATION_FUNCTIONS.validateAnswer(formState.answer),
    };
};

export const TranslateFaqForm = forwardRef<TranslateFaqFormRef, TranslateFaqFormProps>(
    ({ initialData = null, onSubmit, formDisabled, onValidationChange }: TranslateFaqFormProps, ref) => {
        const { formState, setFormState, errors, setErrors, isSubmitting } = useFormManager<
            TranslateFaqFormValues,
            TranslateFaqFormErrorState
        >({
            defaultFormState: DEFAULT_FORM_STATE,
            initialData,
            validateForm,
            onValidationChange,
            ref,
            onSubmit: (data, _status) => onSubmit(data),
        });

        const handleQuestionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            setFormState((prev) => ({ ...prev, question: e.target.value }));
        };

        const handleQuestionBlur = () => {
            const error = FAQ_VALIDATION_FUNCTIONS.validateQuestion(formState.question);
            setErrors((prev) => ({ ...prev, question: error }));
        };

        const handleAnswerChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
            setFormState((prev) => ({ ...prev, answer: e.target.value }));
        };

        const handleAnswerBlur = () => {
            const error = FAQ_VALIDATION_FUNCTIONS.validateAnswer(formState.answer);
            setErrors((prev) => ({ ...prev, answer: error }));
        };

        return (
            <form
                onSubmit={(e) => e.preventDefault()}
                className={cn(styles.form, 'translate-faq-form')}
                data-testid="translate-faq-form"
                noValidate
            >
                <TranslationControls isSubmitting={isSubmitting} />

                <div className={cn(styles.root, 'common-faq-fields')}>
                    <div className={styles['form-group']}>
                        <InputWithCharacterLimitGroup
                            label={FAQ_TEXT.FORM?.LABEL?.QUESTION || 'Question'}
                            isRequired
                            value={formState.question}
                            onChange={handleQuestionChange}
                            onBlur={handleQuestionBlur}
                            id="question"
                            name="question"
                            maxLength={FAQ_VALIDATION.question.max}
                            disabled={isSubmitting || formDisabled}
                            error={errors.question && Array.isArray(errors.question) ? errors.question[0] : undefined}
                        />
                    </div>

                    <div className={styles['form-group']}>
                        <TextAreaWithCharacterLimitGroup
                            label={FAQ_TEXT.FORM?.LABEL?.ANSWER || 'Answer'}
                            id="answer"
                            name="answer"
                            isRequired
                            value={formState.answer}
                            onChange={handleAnswerChange}
                            onBlur={handleAnswerBlur}
                            rows={8}
                            disabled={isSubmitting || formDisabled}
                            maxLength={FAQ_VALIDATION.answer.max}
                            error={errors.answer}
                        />
                    </div>
                </div>
            </form>
        );
    },
);
