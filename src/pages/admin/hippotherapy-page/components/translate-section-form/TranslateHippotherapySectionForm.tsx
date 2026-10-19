import { forwardRef, useCallback, useEffect, useMemo, useState } from 'react';
import { RichTextInputGroup } from '@/components/admin/input-groups/rich-text-input-group/RichTextInputGroup';
import { HippotherapyTranslationFieldConfig } from '@/const/admin/hippotherapy-page';
import { FormManagerRef, useFormManager } from '@/hooks/admin/use-form-manager/useFormManager';
import { getPlainTextFromHtml } from '@/utils/functions/get-plain-text-from-html/get-plain-text-from-html';
import { normalizeRichTextHtmlForComparison } from '@/utils/functions/normalize-html/normalize-html';
import { HIPPOTHERAPY_PAGE_VALIDATION_FUNCTIONS } from '@/validation/admin/hippotherapy-page-schema/HippotherapyPageSchema';
import './TranslateHippotherapySectionForm.scss';

export type TranslateHippotherapySectionFormValues = Record<string, string>;

export type TranslateHippotherapySectionFormErrors = Record<string, string | undefined>;

export type TranslateHippotherapySectionFormRef = FormManagerRef<TranslateHippotherapySectionFormValues>;

interface TranslateHippotherapySectionFormProps {
    fields: HippotherapyTranslationFieldConfig[];
    fieldIdPrefix: string;
    initialData?: TranslateHippotherapySectionFormValues | null;
    onSubmit: (data: TranslateHippotherapySectionFormValues) => void | Promise<void>;
    onValidationChange?: (isValid: boolean) => void;
    onDirtyChange?: (isDirty: boolean) => void;
    formDisabled?: boolean;
}

const validateField = (field: HippotherapyTranslationFieldConfig, value: string): string | undefined => {
    const plainText = getPlainTextFromHtml(value);

    if (!field.isRequired && !plainText.trim()) {
        return undefined;
    }

    return HIPPOTHERAPY_PAGE_VALIDATION_FUNCTIONS.validateText(plainText);
};

export const TranslateHippotherapySectionForm = forwardRef<
    TranslateHippotherapySectionFormRef,
    TranslateHippotherapySectionFormProps
>(
    (
        {
            fields,
            fieldIdPrefix,
            initialData = null,
            onSubmit,
            onValidationChange,
            onDirtyChange,
            formDisabled = false,
        },
        ref,
    ) => {
        const defaultFormState = useMemo(
            () => Object.fromEntries(fields.map((field) => [field.name, ''])) as TranslateHippotherapySectionFormValues,
            [fields],
        );

        const validateForm = useCallback(
            (values: TranslateHippotherapySectionFormValues): TranslateHippotherapySectionFormErrors =>
                Object.fromEntries(fields.map((field) => [field.name, validateField(field, values[field.name] ?? '')])),
            [fields],
        );

        const isEqual = useCallback(
            (
                currentValues: TranslateHippotherapySectionFormValues,
                initialValues: TranslateHippotherapySectionFormValues,
            ) =>
                fields.every(
                    (field) =>
                        normalizeRichTextHtmlForComparison(currentValues[field.name] ?? '') ===
                        normalizeRichTextHtmlForComparison(initialValues[field.name] ?? ''),
                ),
            [fields],
        );

        const { formState, setFormState, errors, setErrors, isSubmitting, isDirty } = useFormManager<
            TranslateHippotherapySectionFormValues,
            TranslateHippotherapySectionFormErrors
        >({
            defaultFormState,
            initialData,
            validateForm,
            onValidationChange,
            onSubmit,
            isEqual,
            ref,
        });

        const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});

        useEffect(() => {
            onDirtyChange?.(isDirty());
        }, [formState, isDirty, onDirtyChange]);

        const handleChange = (field: HippotherapyTranslationFieldConfig, value: string) => {
            setFormState((prev) => ({ ...prev, [field.name]: value }));

            if (touchedFields[field.name]) {
                setErrors((prev) => ({ ...prev, [field.name]: validateField(field, value) }));
            }
        };

        const handleBlur = (field: HippotherapyTranslationFieldConfig) => {
            setTouchedFields((prev) => ({ ...prev, [field.name]: true }));
            setErrors((prev) => ({ ...prev, [field.name]: validateField(field, formState[field.name] ?? '') }));
        };

        return (
            <form className="translate-hippotherapy-section-form" onSubmit={(e) => e.preventDefault()} noValidate>
                {fields.map((field) => (
                    <RichTextInputGroup
                        key={field.name}
                        id={`${fieldIdPrefix}-${field.name}`}
                        name={field.name}
                        label={field.label}
                        isRequired={field.isRequired}
                        value={formState[field.name] ?? ''}
                        onChange={(value) => handleChange(field, value)}
                        onBlur={() => handleBlur(field)}
                        error={errors[field.name]}
                        maxLength={field.maxLength}
                        disabled={isSubmitting || formDisabled}
                    />
                ))}
            </form>
        );
    },
);
