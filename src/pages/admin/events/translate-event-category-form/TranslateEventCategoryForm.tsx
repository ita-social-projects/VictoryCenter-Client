import { InputWithCharacterLimitGroup } from '@/components/admin/input-groups/input-with-character-limit-group/InputWithCharacterLimitGroup';
import { SingleSelectInputGroup } from '@/components/admin/input-groups/single-select-input-group/SingleSelectInputGroup';
import { EVENT_CATEGORY_TEXT, EVENT_CATEGORY_VALIDATION } from '@/const/admin/events';
import { useFormManager } from '@/hooks/admin/use-form-manager/useFormManager';
import { VisibilityStatus } from '@/types/admin/common';
import { EventCategoryDto } from '@/types/admin/event-category';
import { EVENT_CATEGORY_TRANSLATION_VALIDATION_FUNCTIONS } from '@/validation/admin/event-category-translation-schema/event-category-translation-schema';
import { forwardRef, useCallback, useEffect } from 'react';
import styles from './TranslateEventCategoryForm.module.scss';
import { getNormalizedInputText } from '@/utils/functions/formatters/text-formatters';

export interface TranslateEventCategoryFormValues {
    name: string;
}

export interface TranslateEventCategoryFormErrorState {
    name: string | undefined;
    category?: string | undefined;
    [key: string]: string | string[] | undefined;
}

export interface TranslateEventCategoryFormRef {
    submit: (status?: VisibilityStatus) => Promise<void>;
    isValid: () => boolean;
    isDirty: () => boolean;
}

export interface TranslateEventCategoryFormProps {
    onSubmit: (data: TranslateEventCategoryFormValues, status?: VisibilityStatus) => void | Promise<void>;
    categories: EventCategoryDto[];
    initialData?: TranslateEventCategoryFormValues | null;
    formDisabled?: boolean;
    onCategoryChange?: (category: EventCategoryDto | null) => void;
    onValidationChange?: (isValid: boolean) => void;
    onDirtyChange?: (isDirty: boolean) => void;
    selectedCategory?: EventCategoryDto | null;
}

const DEFAULT_FORM_STATE: TranslateEventCategoryFormValues = {
    name: '',
};

export const TranslateEventCategoryForm = forwardRef<TranslateEventCategoryFormRef, TranslateEventCategoryFormProps>(
    (
        {
            initialData = null,
            onSubmit,
            categories,
            formDisabled,
            onCategoryChange,
            onValidationChange,
            onDirtyChange,
            selectedCategory = null,
        }: TranslateEventCategoryFormProps,
        ref,
    ) => {
        const validateForm = useCallback(
            (
                formState: TranslateEventCategoryFormValues,
                _isPublishing: boolean,
            ): TranslateEventCategoryFormErrorState => {
                return EVENT_CATEGORY_TRANSLATION_VALIDATION_FUNCTIONS.validateFrom(
                    formState.name,
                    selectedCategory ?? undefined,
                ) as TranslateEventCategoryFormErrorState;
            },
            [selectedCategory],
        );

        const { formState, setFormState, errors, setErrors, isSubmitting } = useFormManager<
            TranslateEventCategoryFormValues,
            TranslateEventCategoryFormErrorState
        >({
            defaultFormState: DEFAULT_FORM_STATE,
            initialData,
            validateForm,
            onValidationChange,
            ref,
            onSubmit: (data, _status) => onSubmit(data),
        });

        const validateNameAndCategory = (currentNameValue: string) => {
            const normalized = getNormalizedInputText(currentNameValue);

            setErrors((prev) => ({
                ...prev,
                name: EVENT_CATEGORY_TRANSLATION_VALIDATION_FUNCTIONS.validateName(normalized),
                category: EVENT_CATEGORY_TRANSLATION_VALIDATION_FUNCTIONS.validateCategory(selectedCategory as any),
            }));

            return normalized;
        };

        useEffect(() => {
            const baseData = initialData ?? DEFAULT_FORM_STATE;
            const isNameDirty = JSON.stringify(formState) !== JSON.stringify(baseData);
            const isCategoryDirty = selectedCategory !== null;
            onDirtyChange?.(isNameDirty || isCategoryDirty);
        }, [formState, initialData, selectedCategory, onDirtyChange]);

        const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const newValue = e.target.value;
            setFormState((prev) => ({ ...prev, name: newValue }));
            validateNameAndCategory(newValue);
        };

        const handleCategoryChange = (category: EventCategoryDto | null) => {
            onCategoryChange?.(category);
            setErrors((prev) => ({
                ...prev,
                category: EVENT_CATEGORY_TRANSLATION_VALIDATION_FUNCTIONS.validateCategory(category as any),
            }));
        };

        const handleNameBlur = () => {
            const normalized = validateNameAndCategory(formState.name);
            if (normalized !== formState.name) {
                setFormState((prev) => ({ ...prev, name: normalized }));
            }
        };

        return (
            <form
                onSubmit={(e) => e.preventDefault()}
                className={styles.formContainer}
                id="translate-event-category-form"
                noValidate
            >
                <SingleSelectInputGroup
                    label={EVENT_CATEGORY_TEXT.FORM.LABEL.CATEGORY}
                    error={errors.category}
                    isRequired
                    options={categories}
                    getOptionId={(c) => c.id}
                    getOptionName={(c) => c.name}
                    disabled={isSubmitting || formDisabled}
                    onChange={handleCategoryChange}
                    value={selectedCategory || undefined}
                    placeholder="Оберіть категорію"
                    id="category-select"
                />

                <InputWithCharacterLimitGroup
                    label={EVENT_CATEGORY_TEXT.FORM.LABEL.NAME}
                    error={errors.name}
                    isRequired
                    value={formState.name}
                    onChange={handleNameChange}
                    onBlur={handleNameBlur}
                    disabled={isSubmitting || formDisabled}
                    maxLength={EVENT_CATEGORY_VALIDATION.name.max}
                    name="name"
                    id="name"
                    showCounterBelow={true}
                />
            </form>
        );
    },
);
