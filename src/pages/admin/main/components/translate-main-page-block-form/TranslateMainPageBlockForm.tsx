import { InputWithCharacterLimitGroup } from '@/components/admin/input-groups/input-with-character-limit-group/InputWithCharacterLimitGroup';
import { TextAreaWithCharacterLimitGroup } from '@/components/admin/input-groups/text-area-with-character-limit-group/TextAreaWithCharacterLimitGroup';
import { MAIN_PAGE_TEXT } from '@/const/admin/main-page';
import { useFormManager } from '@/hooks/admin/use-form-manager/useFormManager';
import { VisibilityStatus } from '@/types/admin/common';
import { MainPageFormValues } from '@/types/admin/main-page';
import { MAIN_PAGE_VALIDATION_FUNCTIONS } from '@/validation/admin/main-page-schema/main-page-schema';
import { ChangeEvent, forwardRef, useEffect } from 'react';
import styles from './TranslateMainPageBlockForm.module.scss';

export interface TranslateMainPageBlockFormValues {
    title: string;
    description: string;
}

export interface TranslateMainPageBlockFormErrors {
    title?: string;
    description?: string;
    [key: string]: string | undefined;
}

export interface TranslateMainPageBlockValidationConfig {
    titleField: keyof MainPageFormValues;
    descriptionField: keyof MainPageFormValues;
    titleMaxLength: number;
    descriptionMaxLength: number;
}

export interface TranslateMainPageBlockFormRef {
    submit: (status?: VisibilityStatus) => Promise<void>;
    isValid: () => boolean;
    isDirty: () => boolean;
}

interface TranslateMainPageBlockFormProps {
    initialData?: TranslateMainPageBlockFormValues | null;
    validationConfig: TranslateMainPageBlockValidationConfig;
    onSubmit: (data: TranslateMainPageBlockFormValues) => void | Promise<void>;
    onValidationChange?: (isValid: boolean) => void;
    onDirtyChange?: (isDirty: boolean) => void;
    formDisabled?: boolean;
}

const DEFAULT_FORM_STATE: TranslateMainPageBlockFormValues = {
    title: '',
    description: '',
};

const validateFormWithConfig = (
    formState: TranslateMainPageBlockFormValues,
    validationConfig: TranslateMainPageBlockValidationConfig,
): TranslateMainPageBlockFormErrors => ({
    title: MAIN_PAGE_VALIDATION_FUNCTIONS.validateField(validationConfig.titleField, formState.title),
    description: MAIN_PAGE_VALIDATION_FUNCTIONS.validateField(validationConfig.descriptionField, formState.description),
});

export const TranslateMainPageBlockForm = forwardRef<TranslateMainPageBlockFormRef, TranslateMainPageBlockFormProps>(
    (
        { initialData = null, validationConfig, onSubmit, onValidationChange, onDirtyChange, formDisabled = false },
        ref,
    ) => {
        const { formState, setFormState, errors, setErrors, isSubmitting, isDirty } = useFormManager<
            TranslateMainPageBlockFormValues,
            TranslateMainPageBlockFormErrors
        >({
            defaultFormState: DEFAULT_FORM_STATE,
            initialData,
            validateForm: (values) => validateFormWithConfig(values, validationConfig),
            onValidationChange,
            ref,
            onSubmit: (data) => onSubmit(data),
        });

        useEffect(() => {
            onDirtyChange?.(isDirty());
        }, [formState, isDirty, onDirtyChange]);

        const handleTitleChange = (e: ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value;
            setFormState((prev) => ({ ...prev, title: value }));
            setErrors((prev) => ({
                ...prev,
                title: MAIN_PAGE_VALIDATION_FUNCTIONS.validateField(validationConfig.titleField, value),
            }));
        };

        const handleDescriptionChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
            const value = e.target.value;
            setFormState((prev) => ({ ...prev, description: value }));
            setErrors((prev) => ({
                ...prev,
                description: MAIN_PAGE_VALIDATION_FUNCTIONS.validateField(validationConfig.descriptionField, value),
            }));
        };

        const handleTitleBlur = () => {
            setErrors((prev) => ({
                ...prev,
                title: MAIN_PAGE_VALIDATION_FUNCTIONS.validateField(validationConfig.titleField, formState.title),
            }));
        };

        const handleDescriptionBlur = () => {
            setErrors((prev) => ({
                ...prev,
                description: MAIN_PAGE_VALIDATION_FUNCTIONS.validateField(
                    validationConfig.descriptionField,
                    formState.description,
                ),
            }));
        };

        return (
            <form className={styles.form} onSubmit={(e) => e.preventDefault()} noValidate>
                <InputWithCharacterLimitGroup
                    id="main-page-translation-title"
                    name="title"
                    label={MAIN_PAGE_TEXT.BLOCKS.TITLE.TITLE_LABEL}
                    value={formState.title}
                    onChange={handleTitleChange}
                    onBlur={handleTitleBlur}
                    error={errors.title}
                    maxLength={validationConfig.titleMaxLength}
                    isRequired
                    disabled={isSubmitting || formDisabled}
                />

                <TextAreaWithCharacterLimitGroup
                    id="main-page-translation-description"
                    name="description"
                    label={MAIN_PAGE_TEXT.BLOCKS.TITLE.DESCRIPTION_LABEL}
                    value={formState.description}
                    onChange={handleDescriptionChange}
                    onBlur={handleDescriptionBlur}
                    error={errors.description}
                    maxLength={validationConfig.descriptionMaxLength}
                    isRequired
                    disabled={isSubmitting || formDisabled}
                    rows={5}
                    className={styles.textarea}
                />
            </form>
        );
    },
);
