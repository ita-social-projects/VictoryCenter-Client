import { forwardRef, useEffect } from 'react';
import { useFormManager } from '@/hooks/admin/use-form-manager/useFormManager';
import { VisibilityStatus } from '@/types/admin/common';
import { InputWithCharacterLimitGroup } from '@/components/admin/input-groups/input-with-character-limit-group/InputWithCharacterLimitGroup';
import { TextAreaWithCharacterLimitGroup } from '@/components/admin/input-groups/text-area-with-character-limit-group/TextAreaWithCharacterLimitGroup';
import {
    HISTORY_TRANSLATION_VALIDATION,
    HISTORY_TRANSLATION_VALIDATION_FUNCTIONS,
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

export interface TranslateHistorySectionFormRef {
    submit: (status?: VisibilityStatus) => Promise<void>;
    isValid: () => boolean;
    isDirty: () => boolean;
}

export interface TranslateHistorySectionFormProps {
    onSubmit: (data: TranslateHistorySectionFormValues) => void | Promise<void>;
    initialData?: TranslateHistorySectionFormValues | null;
    formDisabled?: boolean;
    onValidationChange?: (isValid: boolean) => void;
    onDirtyChange?: (isDirty: boolean) => void;
    hasTitle: boolean;
    hasDescription: boolean;
}

const DEFAULT_FORM_STATE: TranslateHistorySectionFormValues = {
    title: '',
    description: '',
};

const validateForm = (formState: TranslateHistorySectionFormValues): TranslateHistorySectionFormErrorState => ({
    title: HISTORY_TRANSLATION_VALIDATION_FUNCTIONS.validateTitle(formState.title),
    description: HISTORY_TRANSLATION_VALIDATION_FUNCTIONS.validateDescription(formState.description),
});

export const TranslateHistorySectionForm = forwardRef<TranslateHistorySectionFormRef, TranslateHistorySectionFormProps>(
    (
        {
            initialData = null,
            onSubmit,
            formDisabled,
            onValidationChange,
            onDirtyChange,
            hasTitle,
            hasDescription,
        }: TranslateHistorySectionFormProps,
        ref,
    ) => {
        const { formState, setFormState, errors, setErrors, isSubmitting } = useFormManager<
            TranslateHistorySectionFormValues,
            TranslateHistorySectionFormErrorState
        >({
            defaultFormState: DEFAULT_FORM_STATE,
            initialData,
            validateForm,
            onValidationChange,
            ref,
            onSubmit: (data) => onSubmit(data),
        });

        useEffect(() => {
            const isDirty = JSON.stringify(formState) !== JSON.stringify(initialData ?? DEFAULT_FORM_STATE);
            onDirtyChange?.(isDirty);
        }, [formState, initialData, onDirtyChange]);

        const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            setFormState((prev) => ({ ...prev, title: e.target.value }));
        };

        const handleTitleBlur = () => {
            setErrors((prev) => ({
                ...prev,
                title: HISTORY_TRANSLATION_VALIDATION_FUNCTIONS.validateTitle(formState.title),
            }));
        };

        const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
            setFormState((prev) => ({ ...prev, description: e.target.value }));
        };

        const handleDescriptionBlur = () => {
            setErrors((prev) => ({
                ...prev,
                description: HISTORY_TRANSLATION_VALIDATION_FUNCTIONS.validateDescription(formState.description),
            }));
        };

        return (
            <form
                onSubmit={(e) => e.preventDefault()}
                className={styles.form}
                data-testid="translate-history-section-form"
                noValidate
            >
                {hasTitle && (
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
                )}
                {hasDescription && (
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
                )}
            </form>
        );
    },
);

TranslateHistorySectionForm.displayName = 'TranslateHistorySectionForm';
