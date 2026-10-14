import { InputWithCharacterLimitGroup } from '@/components/admin/input-groups/input-with-character-limit-group/InputWithCharacterLimitGroup';
import { TextAreaWithCharacterLimitGroup } from '@/components/admin/input-groups/text-area-with-character-limit-group/TextAreaWithCharacterLimitGroup';
import { EVENTS_TEXT, EVENT_VALIDATION } from '@/const/admin/events';
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
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

const DEFAULT_FORM_STATE: TranslateEventFormValues = {
    title: '',
    description: '',
    additionalDescription: '',
};

export const TranslateEventForm = forwardRef<TranslateEventFormRef, TranslateEventFormProps>(
    ({ initialData = null, onSubmit, formDisabled = false, onValidationChange, onDirtyChange }, ref) => {
        const [formState, setFormState] = useState<TranslateEventFormValues>(initialData ?? DEFAULT_FORM_STATE);

        const isFormValid = formState.title.trim().length > 0 && formState.description.trim().length > 0;
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
            };

        const handleBlur = (field: keyof TranslateEventFormValues) => () => {
            setFormState((prev) => ({
                ...prev,
                [field]: getNormalizedInputText(prev[field]),
            }));
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
