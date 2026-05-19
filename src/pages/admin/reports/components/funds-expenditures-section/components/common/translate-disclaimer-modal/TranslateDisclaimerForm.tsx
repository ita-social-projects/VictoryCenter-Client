import { forwardRef, useEffect } from 'react';
import { TextAreaWithCharacterLimitGroup } from '@/components/admin/input-groups/text-area-with-character-limit-group/TextAreaWithCharacterLimitGroup';
import { FUNDS_EXPENDITURES_TEXT, FUNDS_EXPENDITURES_VALIDATION } from '@/const/admin/reports';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { useFormManager } from '@/hooks/admin/use-form-manager/useFormManager';
import { VisibilityStatus } from '@/types/admin/common';
import { getNormalizedInputText } from '@/utils/functions/formatters/text-formatters';
import styles from './TranslateDisclaimerModal.module.scss';

export interface TranslateDisclaimerFormValues {
    description: string;
}

export interface TranslateDisclaimerFormErrorState {
    description: string | undefined;
    [key: string]: string | undefined;
}

export interface TranslateDisclaimerFormRef {
    submit: (status?: VisibilityStatus) => Promise<void>;
    isValid: () => boolean;
    isDirty: () => boolean;
}

export interface TranslateDisclaimerFormProps {
    onSubmit: (data: TranslateDisclaimerFormValues) => void | Promise<void>;
    initialData?: TranslateDisclaimerFormValues | null;
    formDisabled?: boolean;
    onValidationChange?: (isValid: boolean) => void;
    onDirtyChange?: (isDirty: boolean) => void;
}

const DEFAULT_FORM_STATE: TranslateDisclaimerFormValues = {
    description: '',
};

const validateDescription = (value: string): string | undefined => {
    const normalized = getNormalizedInputText(value);
    if (!normalized) return COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.FIELD_REQUIRED;
    if (normalized.length < FUNDS_EXPENDITURES_VALIDATION.disclaimer.min)
        return COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMinError(FUNDS_EXPENDITURES_VALIDATION.disclaimer.min);
    if (normalized.length > FUNDS_EXPENDITURES_VALIDATION.disclaimer.max)
        return COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMaxError(FUNDS_EXPENDITURES_VALIDATION.disclaimer.max);
    return undefined;
};

const validateForm = (
    formState: TranslateDisclaimerFormValues,
    _isPublishing?: boolean,
): TranslateDisclaimerFormErrorState => ({
    description: validateDescription(formState.description),
});

export const TranslateDisclaimerForm = forwardRef<TranslateDisclaimerFormRef, TranslateDisclaimerFormProps>(
    ({ initialData = null, onSubmit, formDisabled, onValidationChange, onDirtyChange }, ref) => {
        const { formState, setFormState, errors, setErrors, isSubmitting } = useFormManager<
            TranslateDisclaimerFormValues,
            TranslateDisclaimerFormErrorState
        >({
            defaultFormState: DEFAULT_FORM_STATE,
            initialData,
            validateForm,
            onValidationChange,
            ref,
            onSubmit: (data, _status) => onSubmit(data),
        });

        useEffect(() => {
            const isDirty = JSON.stringify(formState) !== JSON.stringify(initialData ?? DEFAULT_FORM_STATE);
            onDirtyChange?.(isDirty);
        }, [formState, initialData, onDirtyChange]);

        const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
            const normalized = e.target.value.replaceAll(/ {2,}/g, ' ');
            setFormState((prev) => ({ ...prev, description: normalized }));
        };

        const handleDescriptionBlur = () => {
            const trimmed = formState.description.replaceAll(/\s+/g, ' ').trim();
            setFormState((prev) => ({ ...prev, description: trimmed }));
            setErrors((prev) => ({ ...prev, description: validateDescription(trimmed) }));
        };

        return (
            <form
                onSubmit={(e) => e.preventDefault()}
                id="translate-disclaimer-form"
                noValidate
                className={styles.form}
            >
                <TextAreaWithCharacterLimitGroup
                    id="translate-disclaimer-description"
                    name="description"
                    label={FUNDS_EXPENDITURES_TEXT.MODAL.TRANSLATE_DISCLAIMER.DESCRIPTION_LABEL}
                    value={formState.description}
                    onChange={handleDescriptionChange}
                    onBlur={handleDescriptionBlur}
                    maxLength={FUNDS_EXPENDITURES_VALIDATION.disclaimer.max}
                    maxLimitWarning={COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMaxError(
                        FUNDS_EXPENDITURES_VALIDATION.disclaimer.max,
                    )}
                    error={errors.description}
                    rows={4}
                    isRequired
                    disabled={isSubmitting || formDisabled}
                />
            </form>
        );
    },
);
