import { forwardRef, useEffect } from 'react';
import { useFormManager, FormManagerRef } from '@/hooks/admin/use-form-manager/useFormManager';
import { InputWithCharacterLimitGroup } from '@/components/admin/input-groups/input-with-character-limit-group/InputWithCharacterLimitGroup';
import { TextAreaWithCharacterLimitGroup } from '@/components/admin/input-groups/text-area-with-character-limit-group/TextAreaWithCharacterLimitGroup';
import {
    HISTORY_TRANSLATION_VALIDATION,
    HISTORY_TRANSLATION_VALIDATION_FUNCTIONS,
    HISTORY_TRANSLATION_BLUR_VALIDATION_FUNCTIONS,
} from '@/validation/admin/history-translation-schema/history-translation-schema';
import styles from './TranslateHistorySectionForm.module.scss';

export interface TranslateHistorySectionFormValues {
    title: string;
    description: string;
}

export interface TranslateHistorySectionFormErrorState {
    title?: string;
    description?: string;
    [key: string]: string | string[] | undefined;
}

export type TranslateHistorySectionFormRef = FormManagerRef<TranslateHistorySectionFormValues>;

export interface TranslateHistorySectionFormProps {
    onSubmit: (data: TranslateHistorySectionFormValues) => void | Promise<void>;
    initialData?: TranslateHistorySectionFormValues | null;
    formDisabled?: boolean;
    onValidationChange?: (isValid: boolean) => void;
    onDirtyChange?: (isDirty: boolean) => void;
}

const DEFAULT_FORM_STATE: TranslateHistorySectionFormValues = {
    title: '',
    description: '',
};

const normaliseSpaces = (value: string): string => value.replace(/\s+/g, ' ').trimStart();
const validateForm = (formState: TranslateHistorySectionFormValues): TranslateHistorySectionFormErrorState => ({
    title: HISTORY_TRANSLATION_BLUR_VALIDATION_FUNCTIONS.validateTitle(formState.title),
    description: HISTORY_TRANSLATION_BLUR_VALIDATION_FUNCTIONS.validateDescription(formState.description),
});

export const TranslateHistorySectionForm = forwardRef<TranslateHistorySectionFormRef, TranslateHistorySectionFormProps>(
    (
        {
            initialData = null,
            onSubmit,
            formDisabled,
            onValidationChange,
            onDirtyChange,
        }: TranslateHistorySectionFormProps,
        ref,
    ) => {
        const { formState, setFormState, errors, setErrors, isSubmitting } = useFormManager<
            TranslateHistorySectionFormValues,
            TranslateHistorySectionFormErrorState
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
            const normalised = normaliseSpaces(e.target.value);
            setFormState((prev) => ({ ...prev, title: normalised }));
            setErrors((prev) => ({
                ...prev,
                title: HISTORY_TRANSLATION_VALIDATION_FUNCTIONS.validateTitle(normalised),
            }));
        };

        const handleTitleBlur = () => {
            const trimmed = formState.title.trim();
            setFormState((prev) => ({ ...prev, title: trimmed }));
            setErrors((prev) => ({
                ...prev,
                title: HISTORY_TRANSLATION_BLUR_VALIDATION_FUNCTIONS.validateTitle(trimmed),
            }));
        };

        const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
            const normalised = normaliseSpaces(e.target.value);
            setFormState((prev) => ({ ...prev, description: normalised }));
            setErrors((prev) => ({
                ...prev,
                description: HISTORY_TRANSLATION_VALIDATION_FUNCTIONS.validateDescription(normalised),
            }));
        };

        const handleDescriptionBlur = () => {
            const trimmed = formState.description.trim();
            setFormState((prev) => ({ ...prev, description: trimmed }));
            setErrors((prev) => ({
                ...prev,
                description: HISTORY_TRANSLATION_BLUR_VALIDATION_FUNCTIONS.validateDescription(trimmed),
            }));
        };

        return (
            <form
                onSubmit={(e) => e.preventDefault()}
                className={styles.form}
                data-testid="translate-history-section-form"
                noValidate
            >
                <div className={styles['form-group']}>
                    <InputWithCharacterLimitGroup
                        label="*Заголовок"
                        value={formState.title}
                        onChange={handleTitleChange}
                        onBlur={handleTitleBlur}
                        id="history-translation-title"
                        name="title"
                        placeholder="ВВЕДІТЬ НАЗВУ"
                        maxLength={HISTORY_TRANSLATION_VALIDATION.title.max}
                        disabled={isSubmitting || formDisabled}
                        error={errors.title}
                    />
                </div>
                <div className={styles['form-group']}>
                    <TextAreaWithCharacterLimitGroup
                        label="*Опис"
                        id="history-translation-description"
                        name="description"
                        value={formState.description}
                        onChange={handleDescriptionChange}
                        onBlur={handleDescriptionBlur}
                        rows={5}
                        disabled={isSubmitting || formDisabled}
                        maxLength={HISTORY_TRANSLATION_VALIDATION.description.max}
                        error={errors.description}
                    />
                </div>
            </form>
        );
    },
);

TranslateHistorySectionForm.displayName = 'TranslateHistorySectionForm';
