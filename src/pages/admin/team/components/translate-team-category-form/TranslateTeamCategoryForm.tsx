import { InputWithCharacterLimitGroup } from '@/components/admin/input-groups/input-with-character-limit-group/InputWithCharacterLimitGroup';
import { SingleSelectInputGroup } from '@/components/admin/input-groups/single-select-input-group/SingleSelectInputGroup';
import { TextAreaWithCharacterLimitGroup } from '@/components/admin/input-groups/text-area-with-character-limit-group/TextAreaWithCharacterLimitGroup';
import { TEAM_CATEGORY_TEXT, TEAM_CATEGORY_VALIDATION } from '@/const/admin/team';
import { useFormManager } from '@/hooks/admin/use-form-manager/useFormManager';
import { VisibilityStatus } from '@/types/admin/common';
import { TeamCategory } from '@/types/admin/team-category';
import { TEAM_CATEGORY_VALIDATION_FUNCTIONS } from '@/validation/admin/team-category-schema/team-category-schema';
import { forwardRef, useEffect, useState } from 'react';

export interface TranslateTeamCategoryFormValues {
    name: string;
    description: string;
}

export interface TranslateTeamCategoryFormErrorState {
    name: string | undefined;
    description: string | undefined | string[];
    [key: string]: string | string[] | undefined;
}

export interface TranslateTeamCategoryFormRef {
    submit: (status?: VisibilityStatus) => Promise<void>;
    isValid: () => boolean;
    isDirty: () => boolean;
}

export interface TranslateTeamCategoryFormProps {
    onSubmit: (data: TranslateTeamCategoryFormValues, status?: VisibilityStatus) => void | Promise<void>;
    categories: TeamCategory[];
    initialData?: TranslateTeamCategoryFormValues | null;
    formDisabled?: boolean;
    onCategoryChange?: (category: TeamCategory | null) => void;
    onValidationChange?: (isValid: boolean) => void;
    onDirtyChange?: (isDirty: boolean) => void;
}

const DEFAULT_FORM_STATE: TranslateTeamCategoryFormValues = {
    name: '',
    description: '',
};

const validateForm = (
    formState: TranslateTeamCategoryFormValues,
    _isPublishing: boolean,
): TranslateTeamCategoryFormErrorState => {
    return {
        name: TEAM_CATEGORY_VALIDATION_FUNCTIONS.validateName(formState.name),
        description: TEAM_CATEGORY_VALIDATION_FUNCTIONS.validateDescription(formState.description),
    };
};
export const TranslateTeamCategoryForm = forwardRef<TranslateTeamCategoryFormRef, TranslateTeamCategoryFormProps>(
    (
        {
            initialData = null,
            onSubmit,
            categories,
            formDisabled,
            onCategoryChange,
            onValidationChange,
            onDirtyChange,
        }: TranslateTeamCategoryFormProps,
        ref,
    ) => {
        const { formState, setFormState, errors, setErrors, isSubmitting } = useFormManager<
            TranslateTeamCategoryFormValues,
            TranslateTeamCategoryFormErrorState
        >({
            defaultFormState: DEFAULT_FORM_STATE,
            initialData,
            validateForm,
            onValidationChange,
            ref,
            onSubmit: (data, _status) => onSubmit(data),
        });
        const [selectedCategory, setSelectedCategory] = useState<TeamCategory | null>(null);

        useEffect(() => {
            const isDirty = JSON.stringify(formState) !== JSON.stringify(initialData);
            onDirtyChange?.(isDirty);
        }, [formState, initialData, onDirtyChange]);

        const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            setFormState((prev) => ({ ...prev, name: e.target.value }));
        };
        const handleCategoryChange = (category: TeamCategory | null) => {
            setSelectedCategory(category);
            onCategoryChange?.(category);
        };

        const handleNameBlur = () => {
            const error = TEAM_CATEGORY_VALIDATION_FUNCTIONS.validateName(formState.name);
            setErrors((prev) => ({ ...prev, name: error }));
        };

        const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
            setFormState((prev) => ({ ...prev, description: e.target.value }));
        };

        const handleDescriptionBlur = () => {
            const error = TEAM_CATEGORY_VALIDATION_FUNCTIONS.validateDescription(formState.description);
            setErrors((prev) => ({ ...prev, description: error }));
        };

        return (
            <form
                onSubmit={(e) => e.preventDefault()}
                className="team-category-modal-form"
                id={'translate-category-form'}
                noValidate
            >
                <SingleSelectInputGroup
                    label={TEAM_CATEGORY_TEXT.FORM.LABEL.CATEGORY}
                    isRequired
                    options={categories}
                    getOptionId={(c) => c.id}
                    getOptionName={(c) => c.name}
                    disabled={isSubmitting || formDisabled}
                    onChange={handleCategoryChange}
                    value={selectedCategory || undefined}
                    placeholder="Оберіть категорію"
                    id={'category-select'}
                />

                <InputWithCharacterLimitGroup
                    label={TEAM_CATEGORY_TEXT.FORM.LABEL.NAME}
                    error={errors.name}
                    isRequired
                    value={formState.name}
                    onChange={handleNameChange}
                    onBlur={handleNameBlur}
                    disabled={isSubmitting || !selectedCategory}
                    maxLength={TEAM_CATEGORY_VALIDATION.name.max}
                    name={'name'}
                    id={'name'}
                />

                <TextAreaWithCharacterLimitGroup
                    label={TEAM_CATEGORY_TEXT.FORM.LABEL.DESCRIPTION}
                    error={typeof errors.description === 'string' ? errors.description : undefined}
                    value={formState.description}
                    onChange={handleDescriptionChange}
                    onBlur={handleDescriptionBlur}
                    isRequired
                    disabled={isSubmitting || !selectedCategory}
                    rows={5}
                    maxLength={TEAM_CATEGORY_VALIDATION.description.max}
                    name={'description'}
                    id={'description'}
                />
            </form>
        );
    },
);
