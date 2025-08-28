import { forwardRef, useCallback, useMemo } from 'react';
import { VisibilityStatus } from '../../../../../types/admin/common';
import { VisitorPage } from '../../../../../types/admin/faq';
import './FaqForm.scss';
import { useFormManager } from '../../../../../hooks/admin/use-form-manager/useFormManager';
import { MultiSelectInputGroup } from '../../../../../components/admin/input-groups/multi-select-input-group/MultiSelectInputGroup';
import { FAQ_TEXT, FAQ_VALIDATION } from '../../../../../const/admin/faq';
import { InputWithCharacterLimitGroup } from '../../../../../components/admin/input-groups/input-with-character-limit-group/InputWithCharacterLimitGroup';
import { FAQ_VALIDATION_FUNCTIONS } from '../../../../../validation/admin/faq-schema/faq-schema';
import { TextAreaWithCharacterLimitGroup } from '../../../../../components/admin/input-groups/text-area-with-character-limit-group/TextAreaWithCharacterLimitGroup';

export interface FaqFormValues {
    question: string;
    answer: string;
    pages: VisitorPage[];
}

export interface FaqFormErrors {
    question?: string;
    answer?: string;
    pages?: string;
    [key: string]: string | undefined;
}

export interface FaqFormRef {
    submit: (status: VisibilityStatus) => void;
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

const validateForm = (formState: FaqFormValues, isPublishing: boolean): FaqFormErrors => {
    return {
        // name: PROGRAM_VALIDATION_FUNCTIONS.validateName(formState.name, isPublishing),
        // categories: PROGRAM_VALIDATION_FUNCTIONS.validateCategories(formState.categories, isPublishing),
        // description: PROGRAM_VALIDATION_FUNCTIONS.validateDescription(formState.description, isPublishing),
        // img: PROGRAM_VALIDATION_FUNCTIONS.validateImg(formState.img, isPublishing),
    };
};

export const FaqForm = forwardRef<FaqFormRef, FaqFormProps>(
    ({ initialData = null, onSubmit, isFormDisabled, pages = [], onValidationChange }: FaqFormProps, ref) => {
        const defaultFormState = useMemo<FaqFormValues>(
            () => ({
                question: '',
                answer: '',
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

        // Question handlers
        const handleQuestionChange = useCallback(
            (e: React.ChangeEvent<HTMLInputElement>) => {
                const value = e.target.value;
                setFormState((prev) => ({ ...prev, question: value }));
            },
            [setFormState],
        );

        const handleQuestionBlur = useCallback(() => {
            const error = FAQ_VALIDATION_FUNCTIONS.validateQuestion(formState.question);
            setErrors((prev) => ({ ...prev, question: error }));
        }, [formState.question, setErrors]);

        // Answer handlers
        const handleAnswerChange = useCallback(
            (e: React.ChangeEvent<HTMLTextAreaElement>) => {
                const value = e.target.value;
                setFormState((prev) => ({ ...prev, answer: value }));
            },
            [setFormState],
        );

        const handleAnswerBlur = useCallback(() => {
            const error = FAQ_VALIDATION_FUNCTIONS.validateAnswer(formState.answer);
            setErrors((prev) => ({ ...prev, answer: error }));
        }, [formState.answer, setErrors]);

        // Pages handlers
        const handlePagesChange = useCallback(
            (selectedPages: VisitorPage[]) => {
                setFormState((prev) => ({ ...prev, pages: selectedPages }));
            },
            [setFormState],
        );

        const handlePagesBlur = useCallback(() => {
            //const error = PROGRAM_VALIDATION_FUNCTIONS.validateCategories(formState.categories, false);
            const error = '';
            setErrors((prev) => ({ ...prev, pages: error }));
        }, [formState.pages, setErrors]);

        return (
            <form className="program-form-main" data-testid="test-form" noValidate>
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
                    error={errors.categories}
                />

                {/* Question Field */}
                <InputWithCharacterLimitGroup
                    label={FAQ_TEXT.FORM.LABEL.QUESTION}
                    isRequired={true}
                    id="question"
                    name="question"
                    value={formState.question}
                    onChange={handleQuestionChange}
                    onBlur={handleQuestionBlur}
                    maxLength={FAQ_VALIDATION.question.max}
                    disabled={isSubmitting || isFormDisabled}
                    error={errors.question}
                />

                {/* Description Field */}
                <TextAreaWithCharacterLimitGroup
                    label={FAQ_TEXT.FORM.LABEL.ANSWER}
                    id="answer"
                    name="answer"
                    value={formState.answer}
                    onChange={handleAnswerChange}
                    onBlur={handleAnswerBlur}
                    rows={8}
                    disabled={isSubmitting || isFormDisabled}
                    maxLength={FAQ_VALIDATION.answer.max}
                    error={errors.answer}
                />
            </form>
        );
    },
);
