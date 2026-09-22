import { forwardRef, useEffect } from 'react';
import { VisibilityStatus } from '@/types/admin/common';
import { useFormManager } from '@/hooks/admin/use-form-manager/useFormManager';
import { InputWithCharacterLimitGroup } from '@/components/admin/input-groups/input-with-character-limit-group/InputWithCharacterLimitGroup';
import { TextAreaWithCharacterLimitGroup } from '@/components/admin/input-groups/text-area-with-character-limit-group/TextAreaWithCharacterLimitGroup';
import { FEEDBACK_REVIEW_VALIDATION, FEEDBACK_TEXT } from '@/const/admin/feedback';
import {
    FEEDBACK_REVIEW_TRANSLATION_VALIDATION_FUNCTIONS,
    FEEDBACK_REVIEW_TRANSLATION_BLUR_VALIDATION_FUNCTIONS,
} from '@/validation/admin/feedback-translation-schema/feedback-translation-schema';
import { getNormalizedInputTextWhileTyping } from '@/utils/functions/formatters/text-formatters';
import { createTranslationFieldHandlers } from '../translation-field-handlers/createTranslationFieldHandlers';
import styles from './TranslateFeedbackReviewForm.module.scss';

export interface TranslateFeedbackReviewFormValues {
    authorName: string;
    text: string;
}

export interface TranslateFeedbackReviewFormErrorState {
    authorName?: string;
    text?: string;
    [key: string]: string | undefined;
}

export interface TranslateFeedbackReviewFormRef {
    submit: (status?: VisibilityStatus) => Promise<void>;
    isValid: () => boolean;
    isDirty: () => boolean;
}

export interface TranslateFeedbackReviewFormProps {
    onSubmit: (data: TranslateFeedbackReviewFormValues) => void | Promise<void>;
    initialData?: TranslateFeedbackReviewFormValues | null;
    formDisabled?: boolean;
    onValidationChange?: (isValid: boolean) => void;
    onDirtyChange?: (isDirty: boolean) => void;
}

const DEFAULT_FORM_STATE: TranslateFeedbackReviewFormValues = {
    authorName: '',
    text: '',
};

const validateForm = (formState: TranslateFeedbackReviewFormValues): TranslateFeedbackReviewFormErrorState => ({
    authorName: FEEDBACK_REVIEW_TRANSLATION_BLUR_VALIDATION_FUNCTIONS.validateAuthorName(formState.authorName),
    text: FEEDBACK_REVIEW_TRANSLATION_BLUR_VALIDATION_FUNCTIONS.validateText(formState.text),
});

export const TranslateFeedbackReviewForm = forwardRef<TranslateFeedbackReviewFormRef, TranslateFeedbackReviewFormProps>(
    (
        {
            initialData = null,
            onSubmit,
            formDisabled,
            onValidationChange,
            onDirtyChange,
        }: TranslateFeedbackReviewFormProps,
        ref,
    ) => {
        const { formState, setFormState, errors, setErrors, isSubmitting } = useFormManager<
            TranslateFeedbackReviewFormValues,
            TranslateFeedbackReviewFormErrorState
        >({
            defaultFormState: DEFAULT_FORM_STATE,
            initialData,
            validateForm: (state) => validateForm(state),
            onValidationChange,
            ref,
            onSubmit: (data) => onSubmit(data),
        });

        useEffect(() => {
            const isDirty = JSON.stringify(formState) !== JSON.stringify(initialData ?? DEFAULT_FORM_STATE);
            onDirtyChange?.(isDirty);
        }, [formState, initialData, onDirtyChange]);

        const authorNameField = createTranslationFieldHandlers(
            (authorName) => setFormState((prev) => ({ ...prev, authorName })),
            (error) => setErrors((prev) => ({ ...prev, authorName: error })),
            FEEDBACK_REVIEW_TRANSLATION_VALIDATION_FUNCTIONS.validateAuthorName,
            FEEDBACK_REVIEW_TRANSLATION_BLUR_VALIDATION_FUNCTIONS.validateAuthorName,
        );

        const textField = createTranslationFieldHandlers(
            (text) => setFormState((prev) => ({ ...prev, text })),
            (error) => setErrors((prev) => ({ ...prev, text: error })),
            FEEDBACK_REVIEW_TRANSLATION_VALIDATION_FUNCTIONS.validateText,
            FEEDBACK_REVIEW_TRANSLATION_BLUR_VALIDATION_FUNCTIONS.validateText,
        );

        return (
            <form
                onSubmit={(e) => e.preventDefault()}
                className={styles.form}
                data-testid="translate-feedback-review-form"
                noValidate
            >
                <div className={styles['form-group']}>
                    <InputWithCharacterLimitGroup
                        label={FEEDBACK_TEXT.FORM.LABEL.NAME}
                        isRequired
                        value={formState.authorName}
                        onChange={authorNameField.handleChange}
                        onBlur={authorNameField.handleBlur(formState.authorName)}
                        id="feedback-review-translation-author-name"
                        name="authorName"
                        maxLength={FEEDBACK_REVIEW_VALIDATION.authorName.max}
                        disabled={isSubmitting || formDisabled}
                        error={errors.authorName}
                        maxLimitWarning={FEEDBACK_REVIEW_VALIDATION.authorName.getMaxError()}
                        normalizeValue={getNormalizedInputTextWhileTyping}
                        showCounterBelow
                    />
                </div>
                <div className={styles['form-group']}>
                    <TextAreaWithCharacterLimitGroup
                        label={FEEDBACK_TEXT.FORM.LABEL.REVIEW}
                        isRequired
                        id="feedback-review-translation-text"
                        name="text"
                        value={formState.text}
                        onChange={textField.handleChange}
                        onBlur={textField.handleBlur(formState.text)}
                        rows={6}
                        disabled={isSubmitting || formDisabled}
                        maxLength={FEEDBACK_REVIEW_VALIDATION.text.max}
                        error={errors.text}
                        maxLimitWarning={FEEDBACK_REVIEW_VALIDATION.text.getMaxError()}
                        normalizeValue={getNormalizedInputTextWhileTyping}
                    />
                </div>
            </form>
        );
    },
);

TranslateFeedbackReviewForm.displayName = 'TranslateFeedbackReviewForm';
