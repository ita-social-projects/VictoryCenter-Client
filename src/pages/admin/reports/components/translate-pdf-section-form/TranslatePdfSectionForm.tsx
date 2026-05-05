import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useState } from 'react';
import { PDF_SECTION_LOCALIZATION_VALIDATION } from '@/const/admin/reports';
import { InputWithCharacterLimitGroup } from '@/components/admin/input-groups/input-with-character-limit-group/InputWithCharacterLimitGroup';
import { TextAreaWithCharacterLimitGroup } from '@/components/admin/input-groups/text-area-with-character-limit-group/TextAreaWithCharacterLimitGroup';
import cn from 'classnames';
import styles from './TranslatePdfSectionForm.module.scss';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';

export interface TranslatePdfSectionFormValues {
    title: string;
    description: string;
}

export interface TranslatePdfSectionFormErrors {
    title?: string;
    description?: string;
    [key: string]: string | undefined;
}

export interface TranslatePdfSectionFormRef {
    submit: () => Promise<void>;
    isValid: () => boolean;
    isDirty: () => boolean;
}

interface TranslatePdfSectionFormProps {
    onSubmit: (data: TranslatePdfSectionFormValues) => void | Promise<void>;
    initialData?: TranslatePdfSectionFormValues | null;
    isFormDisabled?: boolean;
    onValidationChange?: (isValid: boolean) => void;
    onDirtyChange?: (isDirty: boolean) => void;
}

const DEFAULT_FORM_STATE: TranslatePdfSectionFormValues = {
    title: '',
    description: '',
};

const validateForm = (
    formState: TranslatePdfSectionFormValues,
    _isPublishing: boolean,
): TranslatePdfSectionFormErrors => {
    const titleTrimmed = formState.title?.trim();
    const descriptionTrimmed = formState.description?.trim();
    return {
        title: !titleTrimmed
            ? PDF_SECTION_LOCALIZATION_VALIDATION.title.getRequiredError()
            : titleTrimmed.length < PDF_SECTION_LOCALIZATION_VALIDATION.title.min
              ? PDF_SECTION_LOCALIZATION_VALIDATION.title.getMinError()
              : undefined,
        description: !descriptionTrimmed
            ? PDF_SECTION_LOCALIZATION_VALIDATION.description.getRequiredError()
            : descriptionTrimmed.length < PDF_SECTION_LOCALIZATION_VALIDATION.description.min
              ? PDF_SECTION_LOCALIZATION_VALIDATION.description.getMinError()
              : undefined,
    };
};

export const TranslatePdfSectionForm = forwardRef<TranslatePdfSectionFormRef, TranslatePdfSectionFormProps>(
    ({ initialData = null, onSubmit, isFormDisabled, onValidationChange, onDirtyChange }, ref) => {
        const [formState, setFormState] = useState<TranslatePdfSectionFormValues>(initialData || DEFAULT_FORM_STATE);
        const [errors, setErrors] = useState<TranslatePdfSectionFormErrors>({});
        const [isSubmitting, setIsSubmitting] = useState(false);

        useEffect(() => {
            setFormState(initialData || DEFAULT_FORM_STATE);
            setErrors({});
        }, [initialData]);

        useEffect(() => {
            const formErrors = validateForm(formState, false);
            const isValid = !Object.values(formErrors).some((e) => e !== undefined);
            onValidationChange?.(isValid);
        }, [formState, onValidationChange]);

        useEffect(() => {
            let isDirty: boolean;
            if (initialData) {
                isDirty = JSON.stringify(formState) !== JSON.stringify(initialData);
            } else {
                isDirty = formState.title.trim().length > 0 || formState.description.trim().length > 0;
            }
            onDirtyChange?.(isDirty);
        }, [formState, initialData, onDirtyChange]);

        useImperativeHandle(
            ref,
            () => ({
                submit: async () => {
                    if (isSubmitting) return;
                    setIsSubmitting(true);
                    try {
                        const formErrors = validateForm(formState, false);
                        setErrors(formErrors);
                        if (Object.values(formErrors).some((e) => e !== undefined)) return;
                        await onSubmit(formState);
                    } finally {
                        setIsSubmitting(false);
                    }
                },
                isValid: () => {
                    const formErrors = validateForm(formState, false);
                    return !Object.values(formErrors).some((e) => e);
                },
                isDirty: () =>
                    initialData
                        ? JSON.stringify(formState) !== JSON.stringify(initialData)
                        : formState.title.trim().length > 0 || formState.description.trim().length > 0,
            }),
            [formState, initialData, isSubmitting, onSubmit],
        );

        const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
            setFormState((prev) => ({ ...prev, title: e.target.value }));
        }, []);

        const handleTitleBlur = useCallback(() => {
            const trimmed = formState.title?.trim();
            const error = !trimmed
                ? PDF_SECTION_LOCALIZATION_VALIDATION.title.getRequiredError()
                : trimmed.length < PDF_SECTION_LOCALIZATION_VALIDATION.title.min
                  ? PDF_SECTION_LOCALIZATION_VALIDATION.title.getMinError()
                  : undefined;
            setErrors((prev) => ({ ...prev, title: error }));
        }, [formState.title]);

        const handleDescriptionChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
            setFormState((prev) => ({ ...prev, description: e.target.value }));
        }, []);

        const handleDescriptionBlur = useCallback(() => {
            const trimmed = formState.description?.trim();
            const error = !trimmed
                ? PDF_SECTION_LOCALIZATION_VALIDATION.description.getRequiredError()
                : trimmed.length < PDF_SECTION_LOCALIZATION_VALIDATION.description.min
                  ? PDF_SECTION_LOCALIZATION_VALIDATION.description.getMinError()
                  : undefined;
            setErrors((prev) => ({ ...prev, description: error }));
        }, [formState.description]);
        return (
            <form
                onSubmit={(e) => e.preventDefault()}
                className={cn(styles.form, 'translate-pdf-section-form')}
                data-testid="translate-pdf-section-form"
                noValidate
            >
                <InputWithCharacterLimitGroup
                    id="pdf-section-localization-title"
                    name="title"
                    label={COMMON_TEXT_ADMIN.TYPE.TITLE}
                    value={formState.title}
                    isRequired
                    onChange={handleTitleChange}
                    onBlur={handleTitleBlur}
                    maxLength={PDF_SECTION_LOCALIZATION_VALIDATION.title.max}
                    error={errors.title}
                    disabled={isFormDisabled}
                />

                <TextAreaWithCharacterLimitGroup
                    id="pdf-section-localization-description"
                    name="description"
                    label={COMMON_TEXT_ADMIN.TYPE.DESCRIPTION}
                    value={formState.description}
                    isRequired
                    onChange={handleDescriptionChange}
                    onBlur={handleDescriptionBlur}
                    maxLength={PDF_SECTION_LOCALIZATION_VALIDATION.description.max}
                    error={errors.description}
                    disabled={isFormDisabled}
                    rows={4}
                />
            </form>
        );
    },
);

TranslatePdfSectionForm.displayName = 'TranslatePdfSectionForm';
