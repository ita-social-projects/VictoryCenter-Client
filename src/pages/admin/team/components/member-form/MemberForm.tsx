import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useState } from 'react';
import { VisibilityStatus } from '../../../../../types/admin/common';
import { TeamCategory } from '../../../../../types/admin/team-members';
import { TEAM_MEMBER_VALIDATION_FUNCTIONS } from '../../../../../validation/admin/team-member-schema/team-member-schema';
import { ImageValues } from '../../../../../types/common/image';
import { InputLabel } from '../../../../../components/admin/input-label/InputLabel';
import { SingleSelectInput } from '../../../../../components/common/single-select-input/SingleSelectInput';
import { TEAM_MEMBER_VALIDATION, TEAM_MEMBERS_TEXT } from '../../../../../const/admin/team';
import { InputWithCharacterLimit } from '../../../../../components/admin/input-with-character-limit/InputWithCharacterLimit';
import { TextAreaWithCharacterLimit } from '../../../../../components/admin/textarea-with-character-limit/TextAreaWithCharacterLimit';
import { PhotoInput } from '../../../../../components/admin/photo-input/PhotoInput';
import './MemberForm.scss';
export interface TeamMemberFormValues {
    categoryId: number | null;
    fullName: string;
    description: string;
    image: ImageValues | null;
    imageId: number | null;
}

export interface TeamMemberFormErrorState {
    category?: string;
    fullName?: string;
    description?: string;
    image?: string;
}

export interface TeamMemberFormRef {
    submit: (status: VisibilityStatus) => void;
    isValid: (isPublishing?: boolean) => boolean;
    isDirty: () => boolean;
}

export interface MemberFormProps {
    onSubmit: (data: TeamMemberFormValues, status: VisibilityStatus) => void;
    initialData?: TeamMemberFormValues | null;
    formDisabled?: boolean;
    categories: TeamCategory[];
    onValidationChange?: (isValid: boolean) => void;
}

const validateForm = (formState: TeamMemberFormValues, isPublishing: boolean): TeamMemberFormErrorState => {
    return {
        fullName: TEAM_MEMBER_VALIDATION_FUNCTIONS.validateFullName(formState.fullName, isPublishing),
        image: TEAM_MEMBER_VALIDATION_FUNCTIONS.validateImage(formState.image, isPublishing),
        description: TEAM_MEMBER_VALIDATION_FUNCTIONS.validateDescription(formState.description, isPublishing),
        category: TEAM_MEMBER_VALIDATION_FUNCTIONS.validateCategory(formState.categoryId, isPublishing),
    };
};

const hasErrors = (errors: TeamMemberFormErrorState): boolean => {
    return Object.values(errors).some((error) => error !== undefined);
};

export const MemberForm = forwardRef<TeamMemberFormRef, MemberFormProps>(
    ({ initialData = null, onSubmit, formDisabled, categories, onValidationChange }: MemberFormProps, ref) => {
        const defaultFormState = useMemo<TeamMemberFormValues>(
            () => ({
                fullName: '',
                categoryId: null,
                imageId: null,
                description: '',
                image: null,
            }),
            [],
        );

        const [formState, setFormState] = useState<TeamMemberFormValues>(defaultFormState);
        const [errors, setErrors] = useState<TeamMemberFormErrorState>({});
        const [initialFormState, setInitialFormState] = useState<TeamMemberFormValues>(defaultFormState);
        const [isSubmitting, setIsSubmitting] = useState(false);

        const reset = useCallback(
            (data: TeamMemberFormValues | null) => {
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

        const handleFullNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value;
            setFormState((prev) => ({ ...prev, fullName: value }));
        }, []);

        const handleNameBlur = useCallback(() => {
            const error = TEAM_MEMBER_VALIDATION_FUNCTIONS.validateFullName(formState.fullName, false);
            setErrors((prev) => ({ ...prev, fullName: error }));
        }, [formState.fullName]);

        const handleDescriptionChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
            const value = e.target.value;
            setFormState((prev) => ({ ...prev, description: value }));
        }, []);

        const handleDescriptionBlur = useCallback(() => {
            const error = TEAM_MEMBER_VALIDATION_FUNCTIONS.validateDescription(formState.description, false);
            setErrors((prev) => ({ ...prev, description: error }));
        }, [formState.description]);

        const handleImgChange = useCallback((file: ImageValues | null) => {
            setFormState((prev) => ({ ...prev, image: file }));
            const error = TEAM_MEMBER_VALIDATION_FUNCTIONS.validateImage(file, false);
            setErrors((prev) => ({ ...prev, image: error }));
        }, []);

        const handleCategoryChange = useCallback((category: TeamCategory) => {
            setFormState((prev) => ({
                ...prev,
                categoryId: category.id,
            }));
            const error = TEAM_MEMBER_VALIDATION_FUNCTIONS.validateCategory(category.id, false);
            setErrors((prev) => ({ ...prev, category: error }));
        }, []);

        const handleCategoryBlur = useCallback(() => {
            const error = TEAM_MEMBER_VALIDATION_FUNCTIONS.validateCategory(formState.categoryId, false);
            setErrors((prev) => ({ ...prev, category: error }));
        }, [formState.categoryId]);

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
            <form className="team-member-form-main" data-testid="test-form" noValidate>
                <div className="form-group">
                    <InputLabel htmlFor={'category'} text={TEAM_MEMBERS_TEXT.FORM.LABEL.CATEGORY} isRequired />
                    <SingleSelectInput
                        disabled={isSubmitting || formDisabled}
                        onBlur={handleCategoryBlur}
                        onChange={handleCategoryChange}
                        value={categories.filter((c) => c.id === formState.categoryId)[0]}
                        options={categories}
                        getOptionId={(c: TeamCategory) => c.id}
                        getOptionName={(c: TeamCategory) => c.name}
                        placeholder={TEAM_MEMBERS_TEXT.FORM.LABEL.SELECT_CATEGORY}
                    />
                    {errors.category && <p className="error">{errors.category}</p>}
                </div>

                <div className="form-group">
                    <InputLabel htmlFor={'fullName'} text={TEAM_MEMBERS_TEXT.FORM.LABEL.FULLNAME} isRequired />
                    <InputWithCharacterLimit
                        value={formState.fullName}
                        onChange={handleFullNameChange}
                        onBlur={handleNameBlur}
                        id="fullName"
                        name="fullName"
                        maxLength={TEAM_MEMBER_VALIDATION.fullName.max}
                        disabled={isSubmitting || formDisabled}
                    />
                    {errors.fullName && <p className="error">{errors.fullName}</p>}
                </div>
                <div className="form-group">
                    <InputLabel htmlFor={'description'} text={TEAM_MEMBERS_TEXT.FORM.LABEL.DESCRIPTION} />
                    <TextAreaWithCharacterLimit
                        value={formState.description}
                        onChange={handleDescriptionChange}
                        onBlur={handleDescriptionBlur}
                        id="description"
                        name="description"
                        rows={8}
                        disabled={isSubmitting || formDisabled}
                        maxLength={TEAM_MEMBER_VALIDATION.description.max}
                    />
                    {errors.description && <span className="error">{errors.description}</span>}
                </div>
                <div className="form-group">
                    <InputLabel htmlFor={'image'} text={TEAM_MEMBERS_TEXT.FORM.LABEL.PHOTO} />
                    <PhotoInput
                        value={formState.image}
                        onChange={handleImgChange}
                        id="image"
                        name="image"
                        disabled={isSubmitting || formDisabled}
                    />
                    {errors.image && <span className="error">{errors.image}</span>}
                </div>
            </form>
        );
    },
);
