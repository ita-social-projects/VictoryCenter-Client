import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useState } from 'react';
import { PROGRAM_VALIDATION_FUNCTIONS } from '../../../../../validation/admin/program-schema/program-schema';
import { PROGRAM_VALIDATION, PROGRAMS_TEXT } from '../../../../../const/admin/programs';
import { InputWithCharacterLimitGroup } from '../../../../../components/admin/input-groups/input-with-character-limit-group/InputWithCharacterLimitGroup';
import { TextAreaWithCharacterLimitGroup } from '../../../../../components/admin/input-groups/text-area-with-character-limit-group/TextAreaWithCharacterLimitGroup';
import { MultiSelectInputGroup } from '../../../../../components/admin/input-groups/multi-select-input-group/MultiSelectInputGroup';
import { PhotoInputGroup } from '../../../../../components/admin/input-groups/photo-input-group/PhotoInputGroup';
import { Image, ImageValues, ImageValuesToImage, ImageToImageValue } from '../../../../../types/common/image';
import { ProgramCategory } from '../../../../../types/admin/programs';
import { VisibilityStatus } from '../../../../../types/admin/common';
import './ProgramForm.scss';

export interface ProgramFormValues {
    name: string;
    categories: ProgramCategory[];
    description: string;
    img: Image | null;
}

export interface ProgramFormErrors {
    name?: string;
    categories?: string;
    description?: string;
    img?: string;
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
        img: PROGRAM_VALIDATION_FUNCTIONS.validateImg(formState.img, isPublishing),
    };
};

const hasErrors = (errors: ProgramFormErrors): boolean => {
    return Object.values(errors).some((error) => error !== undefined);
};

export const ProgramForm = forwardRef<ProgramFormRef, ProgramFormProps>(
    ({ initialData = null, onSubmit, isFormDisabled, categories = [], onValidationChange }: ProgramFormProps, ref) => {
        const defaultFormState = useMemo<ProgramFormValues>(
            () => ({
                name: '',
                categories: [],
                description: '',
                img: null,
            }),
            [],
        );

        const [formState, setFormState] = useState<ProgramFormValues>(defaultFormState);
        const [errors, setErrors] = useState<ProgramFormErrors>({});
        const [initialFormState, setInitialFormState] = useState<ProgramFormValues>(defaultFormState);
        const [isSubmitting, setIsSubmitting] = useState(false);

        const reset = useCallback(
            (data: ProgramFormValues | null) => {
                const newState = data || defaultFormState;
                setFormState(newState);
                setInitialFormState(newState);
                setErrors({});
            },
            [defaultFormState],
        );

        const isDirty = useCallback(() => {
            return JSON.stringify(formState) !== JSON.stringify(initialFormState);
        }, [formState, initialFormState]);

        const isValid = useCallback(
            (isPublishing: boolean = false) => {
                const formErrors = validateForm(formState, isPublishing);
                return !hasErrors(formErrors);
            },
            [formState],
        );

        useEffect(() => {
            const formErrors = validateForm(formState, false);
            const isFormValid = !hasErrors(formErrors);

            if (onValidationChange) {
                onValidationChange(isFormValid);
            }
        }, [formState, onValidationChange]);

        useEffect(() => {
            reset(initialData);
        }, [initialData, reset]);

        // Name handlers
        const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value;
            setFormState((prev) => ({ ...prev, name: value }));
        }, []);

        const handleNameBlur = useCallback(() => {
            const error = PROGRAM_VALIDATION_FUNCTIONS.validateName(formState.name, false);
            setErrors((prev) => ({ ...prev, name: error }));
        }, [formState.name]);

        // Categories handlers
        const handleCategoriesChange = useCallback((selectedCategories: ProgramCategory[]) => {
            setFormState((prev) => ({ ...prev, categories: selectedCategories }));
        }, []);

        const handleCategoriesBlur = useCallback(() => {
            const error = PROGRAM_VALIDATION_FUNCTIONS.validateCategories(formState.categories, false);
            setErrors((prev) => ({ ...prev, categories: error }));
        }, [formState.categories]);

        // Description handlers
        const handleDescriptionChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
            const value = e.target.value;
            setFormState((prev) => ({ ...prev, description: value }));
        }, []);

        const handleDescriptionBlur = useCallback(() => {
            const error = PROGRAM_VALIDATION_FUNCTIONS.validateDescription(formState.description, false);
            setErrors((prev) => ({ ...prev, description: error }));
        }, [formState.description]);

        // Image handlers
        const handleImgChange = useCallback((file: ImageValues | null) => {
            const image = ImageValuesToImage(file);
            setFormState((prev) => ({ ...prev, img: image }));
            const error = PROGRAM_VALIDATION_FUNCTIONS.validateImg(image, false);
            setErrors((prev) => ({ ...prev, img: error }));
        }, []);

        // Submit function
        const submit = useCallback(
            async (status: VisibilityStatus) => {
                if (isSubmitting) return;

                setIsSubmitting(true);
                const isPublishing = status === VisibilityStatus.Published;

                try {
                    const formErrors = validateForm(formState, isPublishing);
                    setErrors(formErrors);

                    if (hasErrors(formErrors)) {
                        return;
                    }

                    await onSubmit(formState, status);
                } finally {
                    setIsSubmitting(false);
                }
            },
            [formState, onSubmit, isSubmitting],
        );

        useImperativeHandle(ref, () => ({
            submit,
            isDirty,
            isValid,
        }));

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
                    value={ImageToImageValue(formState.img)}
                    onChange={handleImgChange}
                    disabled={isSubmitting || isFormDisabled}
                    error={errors.img}
                />
            </form>
        );
    },
);
