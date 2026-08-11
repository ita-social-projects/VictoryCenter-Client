import { InputWithCharacterLimitGroup } from '@/components/admin/input-groups/input-with-character-limit-group/InputWithCharacterLimitGroup';
import { SingleSelectInputGroup } from '@/components/admin/input-groups/single-select-input-group/SingleSelectInputGroup';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { PROGRAM_CATEGORY_TEXT, PROGRAM_CATEGORY_VALIDATION } from '@/const/admin/programs';
import { useFormManager } from '@/hooks/admin/use-form-manager/useFormManager';
import { VisibilityStatus } from '@/types/admin/common';
import { ProgramCategory } from '@/types/admin/programs';
import { PROGRAM_CATEGORY_VALIDATION_FUNCTIONS } from '@/validation/admin/program-category-schema/program-category-schema';
import { forwardRef, useEffect, useMemo } from 'react';

export interface TranslateProgramCategoryFormValues {
    categoryId: number | null;
    name: string;
}

export interface TranslateProgramCategoryFormErrorState {
    name: string | undefined;
    [key: string]: string | undefined;
}

export interface TranslateProgramCategoryFormRef {
    submit: (status?: VisibilityStatus) => Promise<void>;
    isValid: () => boolean;
    isDirty: () => boolean;
}

export interface TranslateProgramCategoryFormProps {
    onSubmit: (data: TranslateProgramCategoryFormValues, status?: VisibilityStatus) => void | Promise<void>;
    categories: ProgramCategory[];
    formDisabled?: boolean;
    onValidationChange?: (isValid: boolean) => void;
    onDirtyChange?: (isDirty: boolean) => void;
}

const DEFAULT_FORM_STATE: TranslateProgramCategoryFormValues = {
    categoryId: null,
    name: '',
};

const validateForm = (
    formState: TranslateProgramCategoryFormValues,
    _isPublishing: boolean,
): TranslateProgramCategoryFormErrorState => {
    return {
        name: PROGRAM_CATEGORY_VALIDATION_FUNCTIONS.validateName(formState.name),
    };
};

export const TranslateProgramCategoryForm = forwardRef<
    TranslateProgramCategoryFormRef,
    TranslateProgramCategoryFormProps
>(
    (
        { onSubmit, categories, formDisabled, onValidationChange, onDirtyChange }: TranslateProgramCategoryFormProps,
        ref,
    ) => {
        const { formState, setFormState, errors, setErrors, isSubmitting, isDirty } = useFormManager<
            TranslateProgramCategoryFormValues,
            TranslateProgramCategoryFormErrorState
        >({
            defaultFormState: DEFAULT_FORM_STATE,
            initialData: null,
            validateForm,
            onValidationChange,
            ref,
            onSubmit: (data, _status) => onSubmit(data),
        });

        const activeCategory = useMemo(
            () => categories.find((category) => category.id === formState.categoryId),
            [categories, formState.categoryId],
        );

        useEffect(() => {
            onDirtyChange?.(isDirty());
        }, [formState, isDirty, onDirtyChange]);

        const handleCategoryChange = (category: ProgramCategory | null) => {
            setFormState({ categoryId: category?.id ?? null, name: '' });
            setErrors({ name: undefined });
        };

        const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            setFormState((prev) => ({ ...prev, name: e.target.value }));
        };

        const handleNameBlur = () => {
            const error = PROGRAM_CATEGORY_VALIDATION_FUNCTIONS.validateName(formState.name);
            setErrors((prev) => ({ ...prev, name: error }));
        };

        return (
            <form
                onSubmit={(e) => e.preventDefault()}
                className="translate-program-category-form"
                id="translate-program-category-form"
                noValidate
            >
                <SingleSelectInputGroup
                    label={PROGRAM_CATEGORY_TEXT.FORM.LABEL.CATEGORY}
                    isRequired
                    options={categories}
                    getOptionId={(category) => category.id}
                    getOptionName={(category) => category.name}
                    disabled={isSubmitting || formDisabled}
                    onChange={handleCategoryChange}
                    value={activeCategory}
                    placeholder={COMMON_TEXT_ADMIN.FILTER.CATEGORY.SELECT_CATEGORY}
                    id="translate-program-category-select"
                />

                <InputWithCharacterLimitGroup
                    label={PROGRAM_CATEGORY_TEXT.FORM.LABEL.NAME}
                    error={errors.name}
                    isRequired
                    value={formState.name}
                    onChange={handleNameChange}
                    onBlur={handleNameBlur}
                    disabled={isSubmitting || formDisabled || !activeCategory}
                    maxLength={PROGRAM_CATEGORY_VALIDATION.name.max}
                    name="name"
                    id="translate-program-category-name"
                />
            </form>
        );
    },
);
