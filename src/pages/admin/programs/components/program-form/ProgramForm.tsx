import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useState } from 'react';
import { PROGRAM_VALIDATION_FUNCTIONS } from '../../../../../validation/admin/program-schema/program-scheme';
import { PROGRAM_VALIDATION, PROGRAMS_TEXT } from '../../../../../const/admin/programs';
import { ProgramCategory } from '../../../../../types/admin/Programs';
import { VisibilityStatus } from '../../../../../types/admin/Common';
import { MultiSelectInput } from '../../../../../components/common/multi-select-input/MultiSelectInput';
import { PhotoInput } from '../../../../../components/common/photo-input/PhotoInput';
import { InputLabel } from '../../../../../components/common/input-label/InputLabel';
import { InputWithCharacterLimit } from '../../../../../components/common/input-with-character-limit/InputWithCharacterLimit';
import { TextAreaWithCharacterLimit } from '../../../../../components/common/textarea-with-character-limit/TextAreaWithCharacterLimit';
import { Image, ImageValues, ImageValuesToImage, ImageToImageValue } from '../../../../../types/Image';
import './program-form.scss';

export interface ProgramFormValues {
    name: string;
    categories: ProgramCategory[];
    description: string;
    img: Image | null;
}

export interface FormErrorState {
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
    formDisabled?: boolean;
    categories?: ProgramCategory[];
    onValidationChange?: (isValid: boolean) => void;
}

const validateForm = (formState: ProgramFormValues, isPublishing: boolean): FormErrorState => {
    return {
        name: PROGRAM_VALIDATION_FUNCTIONS.validateName(formState.name, isPublishing),
        categories: PROGRAM_VALIDATION_FUNCTIONS.validateCategories(formState.categories, isPublishing),
        description: PROGRAM_VALIDATION_FUNCTIONS.validateDescription(formState.description, isPublishing),
        img: PROGRAM_VALIDATION_FUNCTIONS.validateImg(formState.img, isPublishing),
    };
};

const hasErrors = (errors: FormErrorState): boolean => {
    return Object.values(errors).some((error) => error !== undefined);
};

export const ProgramForm = forwardRef<ProgramFormRef, ProgramFormProps>(
    ({ initialData = null, onSubmit, formDisabled, categories = [], onValidationChange }: ProgramFormProps, ref) => {
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
        const [errors, setErrors] = useState<FormErrorState>({});
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
                <div className="form-group">
                    <InputLabel htmlFor={'categories'} text={PROGRAMS_TEXT.FORM.LABEL.CATEGORY} isRequired />
                    <MultiSelectInput
                        value={formState.categories}
                        onChange={handleCategoriesChange}
                        onBlur={handleCategoriesBlur}
                        options={categories}
                        disabled={isSubmitting || formDisabled}
                        placeholder={PROGRAMS_TEXT.FORM.LABEL.SELECT_CATEGORY}
                        getOptionId={(cat: ProgramCategory) => cat.id}
                        getOptionName={(cat: ProgramCategory) => cat.name}
                    />
                    {errors.categories && <span className="error">{errors.categories}</span>}
                </div>

                {/* Name Field */}
                <div className="form-group">
                    <InputLabel htmlFor={'name'} text={PROGRAMS_TEXT.FORM.LABEL.NAME} isRequired />
                    <InputWithCharacterLimit
                        value={formState.name}
                        onChange={handleNameChange}
                        onBlur={handleNameBlur}
                        id="name"
                        name="name"
                        maxLength={PROGRAM_VALIDATION.name.max}
                        disabled={isSubmitting || formDisabled}
                    />
                    {errors.name && <span className="error">{errors.name}</span>}
                </div>

                {/* Description Field */}
                <div className="form-group">
                    <InputLabel htmlFor={'description'} text={PROGRAMS_TEXT.FORM.LABEL.DESCRIPTION} />
                    <TextAreaWithCharacterLimit
                        value={formState.description}
                        onChange={handleDescriptionChange}
                        onBlur={handleDescriptionBlur}
                        id="description"
                        name="description"
                        rows={8}
                        disabled={isSubmitting || formDisabled}
                        maxLength={PROGRAM_VALIDATION.description.max}
                    />
                    {errors.description && <span className="error">{errors.description}</span>}
                </div>

                {/* Image Field */}
                <div className="form-group">
                    <InputLabel htmlFor={'img'} text={PROGRAMS_TEXT.FORM.LABEL.PHOTO} />
                    <PhotoInput
                        value={ImageToImageValue(formState.img)}
                        onChange={handleImgChange}
                        id="img"
                        name="img"
                        disabled={isSubmitting || formDisabled}
                    />
                    {errors.img && <span className="error">{errors.img}</span>}
                </div>
            </form>
        );
    },
);
