import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useState } from 'react';
import { MultiSelectInput } from '../../../../../components/admin/multi-select-input/MultiSelectInput';
import { InputLabel } from '../../../../../components/admin/input-label/InputLabel';
import { InputWithCharacterLimit } from '../../../../../components/admin/input-with-character-limit/InputWithCharacterLimit';
import { TextAreaWithCharacterLimit } from '../../../../../components/admin/textarea-with-character-limit/TextAreaWithCharacterLimit';
import './FaqForm.scss';
import { VisibilityStatus } from '../../../../../types/admin/common';
import { VisitorPage } from '../../../../../types/admin/faq';
import { FAQ_VALIDATION_FUNCTIONS } from '../../../../../validation/admin/faq-schema/faq-schema';
import { FAQ_TEXT, FAQ_VALIDATION } from '../../../../../const/admin/faq';

export interface FaqFormValues {
    question: string;
    answer: string;
    pages: VisitorPage[];
}

export interface FormErrorState {
    question?: string;
    answer?: string;
    pages?: string[];
}

export interface FaqFormRef {
    submit: (status: VisibilityStatus) => void;
    isValid: (isPublishing?: boolean) => boolean;
    isDirty: () => boolean;
}

export interface FaqFormProps {
    onSubmit: (data: FaqFormValues, status: VisibilityStatus) => void;
    initialData?: FaqFormValues | null;
    formDisabled?: boolean;
    pages?: VisitorPage[];
    onValidationChange?: (isValid: boolean) => void;
}

const validateForm = (formState: FaqFormValues): FormErrorState => {
    return {
        question: FAQ_VALIDATION_FUNCTIONS.validateQuestion(formState.question),
        answer: FAQ_VALIDATION_FUNCTIONS.validateAnswer(formState.answer),
    };
};

const hasErrors = (errors: FormErrorState): boolean => {
    return Object.values(errors).some((error) => error !== undefined);
};

export const ProgramForm = forwardRef<FaqFormRef, FaqFormProps>(
    ({ initialData = null, onSubmit, formDisabled, pages = [], onValidationChange }: FaqFormProps, ref) => {
        const defaultFormState = useMemo<FaqFormValues>(
            () => ({
                question: '',
                answer: '',
                pages: [],
            }),
            [],
        );

        const [formState, setFormState] = useState<FaqFormValues>(defaultFormState);
        const [errors, setErrors] = useState<FormErrorState>({});
        const [initialFormState, setInitialFormState] = useState<FaqFormValues>(defaultFormState);
        const [isSubmitting, setIsSubmitting] = useState(false);

        const reset = useCallback(
            (data: FaqFormValues | null) => {
                const newState = data || defaultFormState;
                setFormState(newState);
                setInitialFormState(newState);
                setErrors({});
            },
            [defaultFormState],
        );

        const isDirty = useCallback(() => {
            return JSON.stringify(formState) !== JSON.stringify(initialFormState);
        }, [formState, initialFormState]);

        const isValid = useCallback(() => {
            const formErrors = validateForm(formState);
            return !hasErrors(formErrors);
        }, [formState]);

        useEffect(() => {
            const formErrors = validateForm(formState);
            const isFormValid = !hasErrors(formErrors);

            if (onValidationChange) {
                onValidationChange(isFormValid);
            }
        }, [formState, onValidationChange]);

        useEffect(() => {
            reset(initialData);
        }, [initialData, reset]);

        // Question handlers
        const handleQuestionChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value;
            setFormState((prev) => ({ ...prev, question: value }));
        }, []);

        const handleQuestionBlur = useCallback(() => {
            const error = FAQ_VALIDATION_FUNCTIONS.validateQuestion(formState.question);
            setErrors((prev) => ({ ...prev, question: error }));
        }, [formState.question]);

        // Answer handlers
        const handleAnswerChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
            const value = e.target.value;
            setFormState((prev) => ({ ...prev, answer: value }));
        }, []);

        const handleAnswerBlur = useCallback(() => {
            const error = FAQ_VALIDATION_FUNCTIONS.validateQuestion(formState.answer);
            setErrors((prev) => ({ ...prev, answer: error }));
        }, [formState.answer]);

        // Pages handlers
        const handlePagesChange = useCallback((selectedPages: VisitorPage[]) => {
            setFormState((prev) => ({ ...prev, pages: selectedPages }));
        }, []);

        const handlePagesBlur = useCallback(() => {
            //const error = FAQ_VALIDATION_FUNCTIONS.validateCategories(formState.categories, false);
            setErrors((prev) => ({ ...prev }));
        }, [formState.pages]);

        // Submit function
        const submit = useCallback(
            async (status: VisibilityStatus) => {
                if (isSubmitting) return;

                setIsSubmitting(true);

                try {
                    const formErrors = validateForm(formState);
                    setErrors(formErrors);

                    if (hasErrors(formErrors)) {
                        return;
                    }

                    await onSubmit(formState, status);
                } finally {
                    setIsSubmitting(false);
                }
            },
            [formState, onSubmit, isSubmitting],
        );

        useImperativeHandle(ref, () => ({
            submit,
            isDirty,
            isValid,
        }));

        return (
            <form className="program-form-main" data-testid="test-form" noValidate>
                {/* Categories Field */}
                <div className="form-group">
                    <InputLabel htmlFor={'pages'} text={FAQ_TEXT.FORM.LABEL.PAGE} isRequired />
                    <MultiSelectInput
                        value={formState.pages}
                        onChange={handlePagesChange}
                        onBlur={handlePagesBlur}
                        options={pages}
                        disabled={isSubmitting || formDisabled}
                        placeholder={FAQ_TEXT.FORM.LABEL.SELECT_PAGE}
                        getOptionId={(page: VisitorPage) => page.id}
                        getOptionName={(page: VisitorPage) => page.title}
                    />
                    {errors.pages && <span className="error">{errors.pages}</span>}
                </div>

                {/* Name Field */}
                <div className="form-group">
                    <InputLabel htmlFor={'question'} text={FAQ_TEXT.FORM.LABEL.QUESTION} isRequired />
                    <InputWithCharacterLimit
                        value={formState.question}
                        onChange={handleQuestionChange}
                        onBlur={handleQuestionBlur}
                        id="question"
                        name="question"
                        maxLength={FAQ_VALIDATION.question.max}
                        disabled={isSubmitting || formDisabled}
                    />
                    {errors.question && <span className="error">{errors.question}</span>}
                </div>

                {/* Description Field */}
                <div className="form-group">
                    <InputLabel htmlFor={'answer'} text={FAQ_TEXT.FORM.LABEL.ANSWER} />
                    <TextAreaWithCharacterLimit
                        value={formState.answer}
                        onChange={handleAnswerChange}
                        onBlur={handleAnswerBlur}
                        id="answer"
                        name="answer"
                        rows={8}
                        disabled={isSubmitting || formDisabled}
                        maxLength={FAQ_VALIDATION.answer.max}
                    />
                    {errors.answer && <span className="error">{errors.answer}</span>}
                </div>
            </form>
        );
    },
);
