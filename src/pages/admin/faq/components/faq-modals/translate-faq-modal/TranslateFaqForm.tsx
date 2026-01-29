import { forwardRef } from 'react';
import { useFormManager } from '@/hooks/admin/use-form-manager/useFormManager';
import { Select } from '@/components/common/select/Select';
import { Button } from '@/components/admin/button/Button';
import { COMMON_TEXT_ADMIN, LANGUAGES } from '@/const/admin/common';
import { VisibilityStatus } from '@/types/admin/common';
import styles from './TranslateFaqForm.module.scss';
import './TranslateFaqForm.scss';
import cn from 'classnames';
import { InputWithCharacterLimitGroup } from '@/components/admin/input-groups/input-with-character-limit-group/InputWithCharacterLimitGroup';
import { TextAreaWithCharacterLimitGroup } from '@/components/admin/input-groups/text-area-with-character-limit-group/TextAreaWithCharacterLimitGroup';
import { FAQ_TEXT } from '@/const/admin/faq';

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
    const errors: TranslateFaqFormErrorState = {};
    if (!formState.question.trim()) errors.question = ['Question is required'];
    if (!formState.answer.trim()) errors.answer = 'Answer is required';
    return errors;
};

export const TranslateFaqForm = forwardRef<TranslateFaqFormRef, TranslateFaqFormProps>(
    ({ initialData = null, onSubmit, formDisabled, onValidationChange }: TranslateFaqFormProps, ref) => {
        const { formState, setFormState, errors, isSubmitting } = useFormManager<
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

        const handleAnswerChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
            setFormState((prev) => ({ ...prev, answer: e.target.value }));
        };

        return (
            <form
                onSubmit={(e) => e.preventDefault()}
                className={cn(styles.form, 'translate-faq-form')}
                data-testid="translate-faq-form"
                noValidate
            >
                <div className={styles['functional-group']}>
                    <div className={styles['language-select']}>
                        <Select<string>
                            className="language-select"
                            headClassName={styles['language-select-head']}
                            value="EN"
                            onValueChange={() => {}}
                        >
                            <Select.Option value="EN" name={LANGUAGES.EN} />
                        </Select>
                    </div>
                    <Button className={styles['generate-button']} buttonStyle="primary" disabled={isSubmitting}>
                        {COMMON_TEXT_ADMIN.BUTTON.GENERATE_TRANSLATION}
                    </Button>
                </div>

                <div className={cn(styles.root, 'common-faq-fields')}>
                    <div className={styles['form-group']}>
                        <InputWithCharacterLimitGroup
                            label={FAQ_TEXT.FORM?.LABEL?.QUESTION || 'Question'}
                            isRequired
                            value={formState.question}
                            onChange={handleQuestionChange}
                            id="question"
                            name="question"
                            maxLength={200}
                            disabled={isSubmitting || formDisabled}
                            error={errors.question && Array.isArray(errors.question) ? errors.question[0] : undefined}
                        />
                    </div>

                    <div className={styles['form-group']}>
                        <TextAreaWithCharacterLimitGroup
                            label={FAQ_TEXT.FORM?.LABEL?.ANSWER || 'Answer'}
                            id="answer"
                            name="answer"
                            value={formState.answer}
                            onChange={handleAnswerChange}
                            rows={8}
                            disabled={isSubmitting || formDisabled}
                            maxLength={1000}
                            error={errors.answer}
                        />
                    </div>
                </div>
            </form>
        );
    },
);
