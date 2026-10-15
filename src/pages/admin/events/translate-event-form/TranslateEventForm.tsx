import { InputWithCharacterLimitGroup } from '@/components/admin/input-groups/input-with-character-limit-group/InputWithCharacterLimitGroup';
import { TextAreaWithCharacterLimitGroup } from '@/components/admin/input-groups/text-area-with-character-limit-group/TextAreaWithCharacterLimitGroup';
import { EVENTS_TEXT, EVENT_VALIDATION } from '@/const/admin/events';
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import * as Yup from 'yup';
import { TranslateEventValidationSchema } from '@/validation/admin/event-schema/event-schema';
import {
    getNormalizedInputText,
    getNormalizedInputTextWhileTyping,
} from '@/utils/functions/formatters/text-formatters';

export interface TranslateEventFormValues {
    title: string;
    description: string;
    additionalDescription: string;
}

export interface TranslateEventFormRef {
    submit: () => void;
    isValid: () => boolean;
    isDirty: () => boolean;
}

export interface TranslateEventFormProps {
    onSubmit: (data: TranslateEventFormValues) => void | Promise<void>;
    initialData?: TranslateEventFormValues | null;
    formDisabled?: boolean;
    onValidationChange?: (isValid: boolean) => void;
    onDirtyChange?: (isDirty: boolean) => void;
}

type FieldErrors = Partial<Record<keyof TranslateEventFormValues, string>>;

const DEFAULT_FORM_STATE: TranslateEventFormValues = {
    title: '',
    description: '',
    additionalDescription: '',
};

export const TranslateEventForm = forwardRef<TranslateEventFormRef, TranslateEventFormProps>(
    ({ initialData = null, onSubmit, formDisabled = false, onValidationChange, onDirtyChange }, ref) => {
        const [formState, setFormState] = useState<TranslateEventFormValues>(initialData ?? DEFAULT_FORM_STATE);

        const [errors, setErrors] = useState<FieldErrors>({});

        const isFormValid = TranslateEventValidationSchema.isValidSync(formState);

        const validateField = (field: keyof TranslateEventFormValues, value: string) => {
            let message: string | undefined;
            try {
                TranslateEventValidationSchema.validateSyncAt(field, { ...formState, [field]: value });
            } catch (err) {
                message = err instanceof Yup.ValidationError ? err.message : undefined;
            }
            setErrors((prev) => ({ ...prev, [field]: message }));
        };
        const isFormDirty = JSON.stringify(formState) !== JSON.stringify(initialData ?? DEFAULT_FORM_STATE);

        useEffect(() => {
            onValidationChange?.(isFormValid);
        }, [isFormValid, onValidationChange]);

        useEffect(() => {
            onDirtyChange?.(isFormDirty);
        }, [isFormDirty, onDirtyChange]);

        useImperativeHandle(ref, () => ({
            submit: () => {
                if (isFormValid) {
                    onSubmit({
                        title: getNormalizedInputText(formState.title),
                        description: getNormalizedInputText(formState.description),
                        additionalDescription: getNormalizedInputText(formState.additionalDescription),
                    });
                }
            },
            isValid: () => isFormValid,
            isDirty: () => isFormDirty,
        }));

        const handleChange =
            (field: keyof TranslateEventFormValues) =>
            (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
                const normalized = getNormalizedInputTextWhileTyping(e.target.value);
                setFormState((prev) => ({ ...prev, [field]: normalized }));

                if (normalized.trim().length === 0) {
                    setErrors((prev) => ({ ...prev, [field]: undefined }));
                } else {
                    validateField(field, normalized);
                }
            };

        const handleBlur = (field: keyof TranslateEventFormValues) => () => {
            const normalized = getNormalizedInputText(formState[field]);
            setFormState((prev) => ({ ...prev, [field]: normalized }));
            validateField(field, normalized);
        };

        return (
            <form
                onSubmit={(e) => e.preventDefault()}
                className="translate-event-form"
                id="translate-event-form"
                noValidate
            >
                <InputWithCharacterLimitGroup
                    label={EVENTS_TEXT.FORM.LABEL.TITLE}
                    isRequired
                    value={formState.title}
                    onChange={handleChange('title')}
                    onBlur={handleBlur('title')}
                    error={errors.title}
                    normalizeValue={getNormalizedInputTextWhileTyping}
                    disabled={formDisabled}
                    maxLength={EVENT_VALIDATION.title.max}
                    name="title"
                    id="title"
                    showCounterBelow={true}
                />

                <TextAreaWithCharacterLimitGroup
                    label={EVENTS_TEXT.FORM.LABEL.DESCRIPTION}
                    isRequired
                    value={formState.description}
                    onChange={handleChange('description')}
                    onBlur={handleBlur('description')}
                    error={errors.description}
                    normalizeValue={getNormalizedInputTextWhileTyping}
                    disabled={formDisabled}
                    rows={5}
                    maxLength={EVENT_VALIDATION.description.max}
                    name="description"
                    id="description"
                />

                <InputWithCharacterLimitGroup
                    label={EVENTS_TEXT.FORM.LABEL.ADDITIONAL_DESCRIPTION}
                    value={formState.additionalDescription}
                    onChange={handleChange('additionalDescription')}
                    onBlur={handleBlur('additionalDescription')}
                    error={errors.additionalDescription}
                    normalizeValue={getNormalizedInputTextWhileTyping}
                    disabled={formDisabled}
                    maxLength={EVENT_VALIDATION.additionalDescription.max}
                    name="additionalDescription"
                    id="additionalDescription"
                    showCounterBelow={true}
                />
            </form>
        );
    },
);
