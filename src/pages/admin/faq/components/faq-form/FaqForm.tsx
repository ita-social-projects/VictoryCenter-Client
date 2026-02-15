import { forwardRef, useCallback, useMemo } from 'react';
import { VisibilityStatus } from '@/types/admin/common';
import { VisitorPage } from '@/types/admin/faq';
import './FaqForm.scss';
import { useFormManager } from '@/hooks/admin/use-form-manager/useFormManager';
import { MultiSelectInputGroup } from '@/components/admin/input-groups/multi-select-input-group/MultiSelectInputGroup';
import { FAQ_TEXT, FAQ_VALIDATION } from '@/const/admin/faq';
import { InputWithCharacterLimitGroup } from '@/components/admin/input-groups/input-with-character-limit-group/InputWithCharacterLimitGroup';
import { FAQ_VALIDATION_FUNCTIONS } from '@/validation/admin/faq-schema/faq-schema';
import { TextAreaWithCharacterLimitGroup } from '@/components/admin/input-groups/text-area-with-character-limit-group/TextAreaWithCharacterLimitGroup';

export interface FaqFormValues {
    questionText: string;
    answerText: string;
    pages: VisitorPage[];
}

export interface FaqFormErrors {
    questionText?: string[];
    answerText?: string;
    pages?: string;
    [key: string]: string | string[] | undefined;
}

export interface FaqFormRef {
    submit: (status: VisibilityStatus) => Promise<void>;
    isValid: (isPublishing?: boolean) => boolean;
    isDirty: () => boolean;
}

export interface FaqFormProps {
    onSubmit: (data: FaqFormValues, status: VisibilityStatus) => void;
    initialData?: FaqFormValues | null;
    isFormDisabled?: boolean;
    pages?: VisitorPage[];
    onValidationChange?: (isValid: boolean) => void;
}

const validateForm = (formState: FaqFormValues): FaqFormErrors => {
    return {
        questionText: FAQ_VALIDATION_FUNCTIONS.validateQuestion(formState.questionText),
        answerText: FAQ_VALIDATION_FUNCTIONS.validateAnswer(formState.answerText),
        pages: FAQ_VALIDATION_FUNCTIONS.validatePages(formState.pages),
    };
};

export const FaqForm = forwardRef<FaqFormRef, FaqFormProps>(
    ({ initialData = null, onSubmit, isFormDisabled, pages = [], onValidationChange }: FaqFormProps, ref) => {
        const defaultFormState = useMemo<FaqFormValues>(
            () => ({
                questionText: '',
                answerText: '',
                pages: [],
            }),
            [],
        );

        const { formState, setFormState, errors, setErrors, isSubmitting } = useFormManager<
            FaqFormValues,
            FaqFormErrors
        >({
            defaultFormState,
            initialData,
            validateForm,
            onSubmit,
            onValidationChange,
            ref,
        });

        const handleQuestionChange = useCallback(
            (e: React.ChangeEvent<HTMLInputElement>) => {
                const value = e.target.value;
                setFormState((prev) => ({ ...prev, questionText: value }));
            },
            [setFormState],
        );

        const handleQuestionBlur = useCallback(() => {
            const error = FAQ_VALIDATION_FUNCTIONS.validateQuestion(formState.questionText);
            setErrors((prev) => ({ ...prev, questionText: error }));
        }, [formState.questionText, setErrors]);

        // Answer handlers
        const handleAnswerChange = useCallback(
            (e: React.ChangeEvent<HTMLTextAreaElement>) => {
                const value = e.target.value;
                setFormState((prev) => ({ ...prev, answerText: value }));
            },
            [setFormState],
        );

        const handleAnswerBlur = useCallback(() => {
            const error = FAQ_VALIDATION_FUNCTIONS.validateAnswer(formState.answerText);
            setErrors((prev) => ({ ...prev, answerText: error }));
        }, [formState.answerText, setErrors]);

        // Pages handlers
        const handlePagesChange = useCallback(
            (selectedPages: VisitorPage[]) => {
                setFormState((prev) => ({ ...prev, pages: selectedPages }));
            },
            [setFormState],
        );

        const handlePagesBlur = useCallback(() => {
            const error = FAQ_VALIDATION_FUNCTIONS.validatePages(formState.pages);
            setErrors((prev) => ({ ...prev, pages: error }));
        }, [formState.pages, setErrors]);

        return (
            <form className="faq-form-main" data-testid="test-form" noValidate autoComplete="off">
                {/* Pages Field */}
                <MultiSelectInputGroup
                    label={FAQ_TEXT.FORM.LABEL.PAGE}
                    isRequired={true}
                    id="pages"
                    options={pages}
                    value={formState.pages}
                    onChange={handlePagesChange}
                    onBlur={handlePagesBlur}
                    disabled={isSubmitting || isFormDisabled}
                    placeholder={FAQ_TEXT.FORM.LABEL.SELECT_PAGE}
                    getOptionId={(page: VisitorPage) => page.id}
                    getOptionName={(page: VisitorPage) => page.title}
                    error={errors.pages}
                />

                {/* Question Field */}
                <InputWithCharacterLimitGroup
                    label={FAQ_TEXT.FORM.LABEL.QUESTION}
                    isRequired={true}
                    id="question"
                    name="question"
                    value={formState.questionText}
                    onChange={handleQuestionChange}
                    onBlur={handleQuestionBlur}
                    maxLength={FAQ_VALIDATION.question.max}
                    disabled={isSubmitting || isFormDisabled}
                    error={errors.questionText && errors.questionText.length > 0 ? errors.questionText[0] : undefined}
                />

                {/* Description Field */}
                <TextAreaWithCharacterLimitGroup
                    label={FAQ_TEXT.FORM.LABEL.ANSWER}
                    isRequired={true}
                    id="answer"
                    name="answer"
                    value={formState.answerText}
                    onChange={handleAnswerChange}
                    onBlur={handleAnswerBlur}
                    rows={8}
                    disabled={isSubmitting || isFormDisabled}
                    maxLength={FAQ_VALIDATION.answer.max}
                    error={errors.answerText}
                />
            </form>
        );
    },
);
