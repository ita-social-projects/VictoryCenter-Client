import { forwardRef, useEffect } from 'react';
import { VisibilityStatus } from '@/types/admin/common';
import { useFormManager } from '@/hooks/admin/use-form-manager/useFormManager';
import { InputWithCharacterLimitGroup } from '@/components/admin/input-groups/input-with-character-limit-group/InputWithCharacterLimitGroup';
import { TextAreaWithCharacterLimitGroup } from '@/components/admin/input-groups/text-area-with-character-limit-group/TextAreaWithCharacterLimitGroup';
import { FEEDBACK_HISTORY_VALIDATION, FEEDBACK_TEXT } from '@/const/admin/feedback';
import {
    FEEDBACK_HISTORY_TRANSLATION_VALIDATION_FUNCTIONS,
    FEEDBACK_HISTORY_TRANSLATION_BLUR_VALIDATION_FUNCTIONS,
} from '@/validation/admin/feedback-translation-schema/feedback-translation-schema';
import {
    getNormalizedInputText,
    getNormalizedInputTextWhileTyping,
} from '@/utils/functions/formatters/text-formatters';
import styles from './TranslateFeedbackHistoryForm.module.scss';

export interface TranslateFeedbackHistoryFormValues {
    title: string;
    story: string;
}

export interface TranslateFeedbackHistoryFormErrorState {
    title?: string;
    story?: string;
    [key: string]: string | undefined;
}

export interface TranslateFeedbackHistoryFormRef {
    submit: (status?: VisibilityStatus) => Promise<void>;
    isValid: () => boolean;
    isDirty: () => boolean;
}

export interface TranslateFeedbackHistoryFormProps {
    onSubmit: (data: TranslateFeedbackHistoryFormValues) => void | Promise<void>;
    initialData?: TranslateFeedbackHistoryFormValues | null;
    formDisabled?: boolean;
    onValidationChange?: (isValid: boolean) => void;
    onDirtyChange?: (isDirty: boolean) => void;
}

const DEFAULT_FORM_STATE: TranslateFeedbackHistoryFormValues = {
    title: '',
    story: '',
};

const validateForm = (formState: TranslateFeedbackHistoryFormValues): TranslateFeedbackHistoryFormErrorState => ({
    title: FEEDBACK_HISTORY_TRANSLATION_BLUR_VALIDATION_FUNCTIONS.validateTitle(formState.title),
    story: FEEDBACK_HISTORY_TRANSLATION_BLUR_VALIDATION_FUNCTIONS.validateStory(formState.story),
});

export const TranslateFeedbackHistoryForm = forwardRef<
    TranslateFeedbackHistoryFormRef,
    TranslateFeedbackHistoryFormProps
>(
    (
        {
            initialData = null,
            onSubmit,
            formDisabled,
            onValidationChange,
            onDirtyChange,
        }: TranslateFeedbackHistoryFormProps,
        ref,
    ) => {
        const { formState, setFormState, errors, setErrors, isSubmitting } = useFormManager<
            TranslateFeedbackHistoryFormValues,
            TranslateFeedbackHistoryFormErrorState
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

        const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value;
            setFormState((prev) => ({ ...prev, title: value }));
            setErrors((prev) => ({
                ...prev,
                title: FEEDBACK_HISTORY_TRANSLATION_VALIDATION_FUNCTIONS.validateTitle(value),
            }));
        };

        const handleTitleBlur = () => {
            const normalised = getNormalizedInputText(formState.title);
            setFormState((prev) => ({ ...prev, title: normalised }));
            setErrors((prev) => ({
                ...prev,
                title: FEEDBACK_HISTORY_TRANSLATION_BLUR_VALIDATION_FUNCTIONS.validateTitle(normalised),
            }));
        };

        const handleStoryChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
            const value = e.target.value;
            setFormState((prev) => ({ ...prev, story: value }));
            setErrors((prev) => ({
                ...prev,
                story: FEEDBACK_HISTORY_TRANSLATION_VALIDATION_FUNCTIONS.validateStory(value),
            }));
        };

        const handleStoryBlur = () => {
            const normalised = getNormalizedInputText(formState.story);
            setFormState((prev) => ({ ...prev, story: normalised }));
            setErrors((prev) => ({
                ...prev,
                story: FEEDBACK_HISTORY_TRANSLATION_BLUR_VALIDATION_FUNCTIONS.validateStory(normalised),
            }));
        };

        return (
            <form
                onSubmit={(e) => e.preventDefault()}
                className={styles.form}
                data-testid="translate-feedback-history-form"
                noValidate
            >
                <div className={styles['form-group']}>
                    <InputWithCharacterLimitGroup
                        label={FEEDBACK_TEXT.FORM.LABEL.TITLE}
                        isRequired
                        value={formState.title}
                        onChange={handleTitleChange}
                        onBlur={handleTitleBlur}
                        id="feedback-history-translation-title"
                        name="title"
                        maxLength={FEEDBACK_HISTORY_VALIDATION.title.max}
                        disabled={isSubmitting || formDisabled}
                        error={errors.title}
                        maxLimitWarning={FEEDBACK_HISTORY_VALIDATION.title.getMaxError()}
                        normalizeValue={getNormalizedInputTextWhileTyping}
                        showCounterBelow
                    />
                </div>
                <div className={styles['form-group']}>
                    <TextAreaWithCharacterLimitGroup
                        label={FEEDBACK_TEXT.FORM.LABEL.STORY}
                        isRequired
                        id="feedback-history-translation-story"
                        name="story"
                        value={formState.story}
                        onChange={handleStoryChange}
                        onBlur={handleStoryBlur}
                        rows={6}
                        disabled={isSubmitting || formDisabled}
                        maxLength={FEEDBACK_HISTORY_VALIDATION.story.max}
                        error={errors.story}
                        maxLimitWarning={FEEDBACK_HISTORY_VALIDATION.story.getMaxError()}
                        normalizeValue={getNormalizedInputTextWhileTyping}
                    />
                </div>
            </form>
        );
    },
);

TranslateFeedbackHistoryForm.displayName = 'TranslateFeedbackHistoryForm';
