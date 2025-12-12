import React, { forwardRef, useCallback, useMemo } from 'react';
import { PROGRAM_VALIDATION_FUNCTIONS } from '@/validation/admin/program-schema/program-schema';
import { PROGRAM_VALIDATION, PROGRAMS_TEXT } from '@/const/admin/programs';
import { InputWithCharacterLimitGroup } from '@/components/admin/input-groups/input-with-character-limit-group/InputWithCharacterLimitGroup';
import { TextAreaWithCharacterLimitGroup } from '@/components/admin/input-groups/text-area-with-character-limit-group/TextAreaWithCharacterLimitGroup';
import { MultiSelectInputGroup } from '@/components/admin/input-groups/multi-select-input-group/MultiSelectInputGroup';
import { PhotoInputGroup } from '@/components/admin/input-groups/photo-input-group/PhotoInputGroup';
import { useFormManager } from '@/hooks/admin/use-form-manager/useFormManager';
import { Image, ImageValues } from '@/types/common/image';
import { ProgramCategory } from '@/types/admin/programs';
import { VisibilityStatus } from '@/types/admin/common';
import './ProgramForm.scss';

export interface ProgramFormValues {
    name: string;
    categories: ProgramCategory[];
    description: string;
    image: Image | ImageValues | null;
    imageId: number | null;
}

export interface ProgramFormErrors {
    name?: string;
    categories?: string;
    description?: string;
    image?: string;
    [key: string]: string | undefined;
}

export interface ProgramFormRef {
    submit: (status: VisibilityStatus) => void;
    isValid: (isPublishing?: boolean) => boolean;
    isDirty: () => boolean;
}

export interface ProgramFormProps {
    onSubmit: (data: ProgramFormValues, status: VisibilityStatus) => void;
    initialData?: ProgramFormValues | null;
    isFormDisabled?: boolean;
    categories?: ProgramCategory[];
    onValidationChange?: (isValid: boolean) => void;
}

const validateForm = (formState: ProgramFormValues, isPublishing: boolean): ProgramFormErrors => {
    return {
        name: PROGRAM_VALIDATION_FUNCTIONS.validateName(formState.name, isPublishing),
        categories: PROGRAM_VALIDATION_FUNCTIONS.validateCategories(formState.categories, isPublishing),
        description: PROGRAM_VALIDATION_FUNCTIONS.validateDescription(formState.description, isPublishing),
        image: PROGRAM_VALIDATION_FUNCTIONS.validateImage(formState.image, isPublishing),
    };
};

export const ProgramForm = forwardRef<ProgramFormRef, ProgramFormProps>(
    ({ initialData = null, onSubmit, isFormDisabled, categories = [], onValidationChange }: ProgramFormProps, ref) => {
        const defaultFormState = useMemo<ProgramFormValues>(
            () => ({
                name: '',
                categories: [],
                description: '',
                image: null,
                imageId: 0,
            }),
            [],
        );

        const { formState, setFormState, errors, setErrors, isSubmitting } = useFormManager<
            ProgramFormValues,
            ProgramFormErrors
        >({
            defaultFormState,
            initialData,
            validateForm,
            onSubmit,
            onValidationChange,
            ref,
        });

        // Name handlers
        const handleNameChange = useCallback(
            (e: React.ChangeEvent<HTMLInputElement>) => {
                const value = e.target.value;
                setFormState((prev) => ({ ...prev, name: value }));
            },
            [setFormState],
        );

        const handleNameBlur = useCallback(() => {
            const error = PROGRAM_VALIDATION_FUNCTIONS.validateName(formState.name, false);
            setErrors((prev) => ({ ...prev, name: error }));
        }, [formState.name, setErrors]);

        // Categories handlers
        const handleCategoriesChange = useCallback(
            (selectedCategories: ProgramCategory[]) => {
                setFormState((prev) => ({ ...prev, categories: selectedCategories }));
            },
            [setFormState],
        );

        const handleCategoriesBlur = useCallback(() => {
            const error = PROGRAM_VALIDATION_FUNCTIONS.validateCategories(formState.categories, false);
            setErrors((prev) => ({ ...prev, categories: error }));
        }, [formState.categories, setErrors]);

        // Description handlers
        const handleDescriptionChange = useCallback(
            (e: React.ChangeEvent<HTMLTextAreaElement>) => {
                const value = e.target.value;
                setFormState((prev) => ({ ...prev, description: value }));
            },
            [setFormState],
        );

        const handleDescriptionBlur = useCallback(() => {
            const error = PROGRAM_VALIDATION_FUNCTIONS.validateDescription(formState.description, false);
            setErrors((prev) => ({ ...prev, description: error }));
        }, [formState.description, setErrors]);

        // Image handlers
        const handleImageChange = useCallback(
            (file: ImageValues | null) => {
                const image = file;
                setFormState((prev) => ({ ...prev, image: image }));
                const error = PROGRAM_VALIDATION_FUNCTIONS.validateImage(image, false);
                setErrors((prev) => ({ ...prev, image: error }));
            },
            [setErrors, setFormState],
        );

        return (
            <form className="program-form-main" data-testid="test-form" noValidate>
                {/* Categories Field */}
                <MultiSelectInputGroup
                    label={PROGRAMS_TEXT.FORM.LABEL.CATEGORY}
                    isRequired={true}
                    id="categories"
                    options={categories}
                    value={formState.categories}
                    onChange={handleCategoriesChange}
                    onBlur={handleCategoriesBlur}
                    disabled={isSubmitting || isFormDisabled}
                    placeholder={PROGRAMS_TEXT.FORM.LABEL.SELECT_CATEGORY}
                    getOptionId={(category: ProgramCategory) => category.id}
                    getOptionName={(category: ProgramCategory) => category.name}
                    error={errors.categories}
                />

                {/* Name Field */}
                <InputWithCharacterLimitGroup
                    label={PROGRAMS_TEXT.FORM.LABEL.NAME}
                    isRequired={true}
                    id="name"
                    name="name"
                    value={formState.name}
                    onChange={handleNameChange}
                    onBlur={handleNameBlur}
                    maxLength={PROGRAM_VALIDATION.name.max}
                    disabled={isSubmitting || isFormDisabled}
                    error={errors.name}
                />

                {/* Description Field */}
                <TextAreaWithCharacterLimitGroup
                    label={PROGRAMS_TEXT.FORM.LABEL.DESCRIPTION}
                    id="description"
                    name="description"
                    value={formState.description}
                    onChange={handleDescriptionChange}
                    onBlur={handleDescriptionBlur}
                    rows={8}
                    disabled={isSubmitting || isFormDisabled}
                    maxLength={PROGRAM_VALIDATION.description.max}
                    error={errors.description}
                />

                {/* Image Field */}
                <PhotoInputGroup
                    label={PROGRAMS_TEXT.FORM.LABEL.PHOTO}
                    id="img"
                    name="img"
                    value={formState.image}
                    onChange={handleImageChange}
                    disabled={isSubmitting || isFormDisabled}
                    error={errors.image}
                    cropWidth={PROGRAM_VALIDATION.image.cropWidth}
                    cropHeight={PROGRAM_VALIDATION.image.cropHeight}
                    minWidth={PROGRAM_VALIDATION.image.minWidth}
                    minHeight={PROGRAM_VALIDATION.image.minHeight}
                    setError={(error) => setErrors((prev) => ({ ...prev, image: error || undefined }))}
                />
            </form>
        );
    },
);
