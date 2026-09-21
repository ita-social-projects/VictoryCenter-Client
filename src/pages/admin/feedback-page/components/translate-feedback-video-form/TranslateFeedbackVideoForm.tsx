import { forwardRef, useEffect } from 'react';
import { VisibilityStatus } from '@/types/admin/common';
import { useFormManager } from '@/hooks/admin/use-form-manager/useFormManager';
import { InputWithCharacterLimitGroup } from '@/components/admin/input-groups/input-with-character-limit-group/InputWithCharacterLimitGroup';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { FEEDBACK_TEXT, VIDEO_REVIEW_VALIDATION } from '@/const/admin/feedback';
import {
    FEEDBACK_VIDEO_TRANSLATION_VALIDATION_FUNCTIONS,
    FEEDBACK_VIDEO_TRANSLATION_BLUR_VALIDATION_FUNCTIONS,
} from '@/validation/admin/feedback-translation-schema/feedback-translation-schema';
import {
    getNormalizedInputText,
    getNormalizedInputTextWhileTyping,
} from '@/utils/functions/formatters/text-formatters';
import styles from './TranslateFeedbackVideoForm.module.scss';

export interface TranslateFeedbackVideoFormValues {
    title: string;
}

export interface TranslateFeedbackVideoFormErrorState {
    title?: string;
    [key: string]: string | undefined;
}

export interface TranslateFeedbackVideoFormRef {
    submit: (status?: VisibilityStatus) => Promise<void>;
    isValid: () => boolean;
    isDirty: () => boolean;
}

export interface TranslateFeedbackVideoFormProps {
    onSubmit: (data: TranslateFeedbackVideoFormValues) => void | Promise<void>;
    initialData?: TranslateFeedbackVideoFormValues | null;
    formDisabled?: boolean;
    onValidationChange?: (isValid: boolean) => void;
    onDirtyChange?: (isDirty: boolean) => void;
}

const DEFAULT_FORM_STATE: TranslateFeedbackVideoFormValues = {
    title: '',
};

const validateForm = (formState: TranslateFeedbackVideoFormValues): TranslateFeedbackVideoFormErrorState => ({
    title: FEEDBACK_VIDEO_TRANSLATION_BLUR_VALIDATION_FUNCTIONS.validateTitle(formState.title),
});

export const TranslateFeedbackVideoForm = forwardRef<TranslateFeedbackVideoFormRef, TranslateFeedbackVideoFormProps>(
    (
        {
            initialData = null,
            onSubmit,
            formDisabled,
            onValidationChange,
            onDirtyChange,
        }: TranslateFeedbackVideoFormProps,
        ref,
    ) => {
        const { formState, setFormState, errors, setErrors, isSubmitting } = useFormManager<
            TranslateFeedbackVideoFormValues,
            TranslateFeedbackVideoFormErrorState
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
                title: FEEDBACK_VIDEO_TRANSLATION_VALIDATION_FUNCTIONS.validateTitle(value),
            }));
        };

        const handleTitleBlur = () => {
            const normalised = getNormalizedInputText(formState.title);
            setFormState((prev) => ({ ...prev, title: normalised }));
            setErrors((prev) => ({
                ...prev,
                title: FEEDBACK_VIDEO_TRANSLATION_BLUR_VALIDATION_FUNCTIONS.validateTitle(normalised),
            }));
        };

        return (
            <form
                onSubmit={(e) => e.preventDefault()}
                className={styles.form}
                data-testid="translate-feedback-video-form"
                noValidate
            >
                <div className={styles['form-group']}>
                    <InputWithCharacterLimitGroup
                        label={FEEDBACK_TEXT.FORM.LABEL.TITLE}
                        isRequired
                        value={formState.title}
                        onChange={handleTitleChange}
                        onBlur={handleTitleBlur}
                        id="feedback-video-translation-title"
                        name="title"
                        maxLength={VIDEO_REVIEW_VALIDATION.title.max}
                        disabled={isSubmitting || formDisabled}
                        error={errors.title}
                        maxLimitWarning={COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMaxError(
                            VIDEO_REVIEW_VALIDATION.title.max,
                        )}
                        normalizeValue={getNormalizedInputTextWhileTyping}
                        showCounterBelow
                    />
                </div>
            </form>
        );
    },
);

TranslateFeedbackVideoForm.displayName = 'TranslateFeedbackVideoForm';
