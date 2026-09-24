import { InputWithCharacterLimitGroup } from '@/components/admin/input-groups/input-with-character-limit-group/InputWithCharacterLimitGroup';
import { SingleSelectInputGroup } from '@/components/admin/input-groups/single-select-input-group/SingleSelectInputGroup';
import { EVENT_CATEGORY_TEXT, EVENT_CATEGORY_VALIDATION } from '@/const/admin/events';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { useFormManager } from '@/hooks/admin/use-form-manager/useFormManager';
import { VisibilityStatus } from '@/types/admin/common';
import { EventCategoryDto } from '@/types/admin/event-category';
import { forwardRef, useEffect, useState } from 'react';
import styles from './TranslateEventCategoryForm.module.scss';

export interface TranslateEventCategoryFormValues {
    name: string;
}

export interface TranslateEventCategoryFormErrorState {
    name: string | undefined;
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

const validateName = (name: string): string | undefined => {
    const trimmed = name.trim();
    if (!trimmed) {
        return COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.FIELD_REQUIRED;
    }
    if (trimmed.length > EVENT_CATEGORY_VALIDATION.name.max) {
        return COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMaxError(EVENT_CATEGORY_VALIDATION.name.max);
    }
    return undefined;
};

const validateForm = (
    formState: TranslateEventCategoryFormValues,
    _isPublishing: boolean,
): TranslateEventCategoryFormErrorState => {
    return {
        name: validateName(formState.name),
    };
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
            selectedCategory,
        }: TranslateEventCategoryFormProps,
        ref,
    ) => {
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

        const [localSelectedCategory, setLocalSelectedCategory] = useState<EventCategoryDto | null>(null);
        const activeCategory = selectedCategory !== undefined ? selectedCategory : localSelectedCategory;

        useEffect(() => {
            const baseData = initialData ?? DEFAULT_FORM_STATE;
            const isNameDirty = JSON.stringify(formState) !== JSON.stringify(baseData);
            const isCategoryDirty = activeCategory !== null;
            onDirtyChange?.(isNameDirty || isCategoryDirty);
        }, [formState, initialData, activeCategory, onDirtyChange]);

        const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            setFormState((prev) => ({ ...prev, name: e.target.value }));
        };

        const handleCategoryChange = (category: EventCategoryDto | null) => {
            if (selectedCategory === undefined) {
                setLocalSelectedCategory(category);
            }
            onCategoryChange?.(category);
        };

        const handleNameBlur = () => {
            const normalized = formState.name.trim().replace(/\s+/g, ' ');
            if (normalized !== formState.name) {
                setFormState((prev) => ({ ...prev, name: normalized }));
            }
            const error = validateName(normalized);
            setErrors((prev) => ({ ...prev, name: error }));
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
                    isRequired
                    options={categories}
                    getOptionId={(c) => c.id}
                    getOptionName={(c) => c.name}
                    disabled={isSubmitting || formDisabled}
                    onChange={handleCategoryChange}
                    value={activeCategory || undefined}
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
