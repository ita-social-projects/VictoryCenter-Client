import { forwardRef, useCallback, useEffect, useMemo, useState } from 'react';
import { RichTextInputGroup } from '@/components/admin/input-groups/rich-text-input-group/RichTextInputGroup';
import { TextAreaWithCharacterLimitGroup } from '@/components/admin/input-groups/text-area-with-character-limit-group/TextAreaWithCharacterLimitGroup';
import { InputWithCharacterLimitGroup } from '@/components/admin/input-groups/input-with-character-limit-group/InputWithCharacterLimitGroup';
import { HippotherapyTranslationFieldConfig } from '@/const/admin/hippotherapy-page';
import { FormManagerRef, useFormManager } from '@/hooks/admin/use-form-manager/useFormManager';
import { getNormalizedInputTextWhileTyping } from '@/utils/functions/formatters/text-formatters';
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

const isPlainTextField = (field: HippotherapyTranslationFieldConfig): boolean =>
    field.type === 'text' || field.type === 'textarea';

const validateField = (field: HippotherapyTranslationFieldConfig, value: string): string | undefined => {
    const rawText = isPlainTextField(field) ? value : getPlainTextFromHtml(value);
    const plainText = rawText.trim();

    if (!field.isRequired && !plainText) {
        return undefined;
    }

    return HIPPOTHERAPY_PAGE_VALIDATION_FUNCTIONS.validateText(plainText, field.minLength);
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
                fields.every((field) => {
                    const current = currentValues[field.name] ?? '';
                    const initial = initialValues[field.name] ?? '';
                    if (isPlainTextField(field)) {
                        return current.trim() === initial.trim();
                    }
                    return normalizeRichTextHtmlForComparison(current) === normalizeRichTextHtmlForComparison(initial);
                }),
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
                {fields.map((field) => {
                    const fieldId = `${fieldIdPrefix}-${field.name}`;
                    const value = formState[field.name] ?? '';
                    const error = touchedFields[field.name] ? errors[field.name] : undefined;
                    const disabled = isSubmitting || formDisabled;

                    if (field.type === 'textarea') {
                        return (
                            <TextAreaWithCharacterLimitGroup
                                key={field.name}
                                id={fieldId}
                                name={field.name}
                                label={field.label}
                                isRequired={field.isRequired}
                                maxLength={field.maxLength}
                                value={value}
                                error={error}
                                disabled={disabled}
                                onChange={(event) => handleChange(field, event.target.value)}
                                onBlur={() => handleBlur(field)}
                                rows={2}
                                autoGrow
                                maxRows={6}
                                normalizeValue={getNormalizedInputTextWhileTyping}
                            />
                        );
                    }

                    if (field.type === 'text') {
                        return (
                            <InputWithCharacterLimitGroup
                                key={field.name}
                                id={fieldId}
                                name={field.name}
                                label={field.label}
                                isRequired={field.isRequired}
                                maxLength={field.maxLength}
                                value={value}
                                error={error}
                                disabled={disabled}
                                onChange={(event) => handleChange(field, event.target.value)}
                                onBlur={() => handleBlur(field)}
                                normalizeValue={getNormalizedInputTextWhileTyping}
                            />
                        );
                    }

                    return (
                        <RichTextInputGroup
                            key={field.name}
                            id={fieldId}
                            name={field.name}
                            label={field.label}
                            isRequired={field.isRequired}
                            value={value}
                            onChange={(val) => handleChange(field, val)}
                            onBlur={() => handleBlur(field)}
                            error={error}
                            maxLength={field.maxLength}
                            disabled={disabled}
                        />
                    );
                })}
            </form>
        );
    },
);
