import React, { forwardRef, useCallback, useMemo } from 'react';
import { VisibilityStatus } from '@/types/admin/common';
import { TEAM_MEMBER_VALIDATION_FUNCTIONS } from '@/validation/admin/team-member-schema/team-member-schema';
import { ImageValues, Image } from '@/types/common/image';
import { InputLabel } from '@/components/admin/input-label/InputLabel';
import { SingleSelectInput } from '@/components/common/single-select-input/SingleSelectInput';
import { TEAM_MEMBER_VALIDATION, TEAM_MEMBERS_TEXT } from '@/const/admin/team';
import { ImageInput } from '@/components/admin/image-input/ImageInput';
import './MemberForm.scss';
import { useFormManager } from '@/hooks/admin/use-form-manager/useFormManager';
import { TeamCategory } from '@/types/admin/team-category';
import { CommonMemberFields } from '../common-member-fields/CommonMemberFields';
import { useCommonMemberFields } from '@/hooks/admin/use-common-member-fields/useCommonMemberFields';
export interface TeamMemberFormValues {
    categoryId: number | null;
    fullName: string;
    description: string;
    image: ImageValues | Image | null;
    imageId: number | null;
}

export interface TeamMemberFormErrorState {
    category?: string;
    fullName?: string[];
    description?: string;
    image?: string;
    [key: string]: string | string[] | undefined;
}

export interface TeamMemberFormRef {
    submit: (status: VisibilityStatus) => Promise<void>;
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

        const { formState, setFormState, errors, setErrors, isSubmitting } = useFormManager<
            TeamMemberFormValues,
            TeamMemberFormErrorState
        >({
            defaultFormState,
            initialData,
            validateForm,
            onSubmit,
            onValidationChange,
            ref,
        });

        const { handleFullNameChange, handleFullNameBlur, handleDescriptionChange, handleDescriptionBlur } =
            useCommonMemberFields({
                formState,
                setFormState,
                setErrors,
            });

        const handleImgChange = useCallback(
            (file: ImageValues | Image | null) => {
                const error = TEAM_MEMBER_VALIDATION_FUNCTIONS.validateImage(file, false);
                setErrors((prev) => ({
                    ...prev,
                    image: error,
                }));

                if (!error) {
                    setFormState((prev) => ({ ...prev, image: file }));
                }
            },
            [setFormState, setErrors],
        );

        const handleCategoryChange = useCallback(
            (category: TeamCategory) => {
                setFormState((prev) => ({ ...prev, categoryId: category.id }));
                setErrors((prev) => ({
                    ...prev,
                    category: TEAM_MEMBER_VALIDATION_FUNCTIONS.validateCategory(category.id, false),
                }));
            },
            [setFormState, setErrors],
        );

        const handleCategoryBlur = useCallback(() => {
            setErrors((prev) => ({
                ...prev,
                category: TEAM_MEMBER_VALIDATION_FUNCTIONS.validateCategory(formState.categoryId, false),
            }));
        }, [formState.categoryId, setErrors]);

        return (
            <form
                onSubmit={(e) => e.preventDefault()}
                className="team-member-form-main"
                data-testid="test-form"
                noValidate
            >
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

                <CommonMemberFields
                    formState={formState}
                    errors={errors}
                    isSubmitting={isSubmitting}
                    formDisabled={formDisabled}
                    handleFullNameChange={handleFullNameChange}
                    handleFullNameBlur={handleFullNameBlur}
                    handleDescriptionChange={handleDescriptionChange}
                    handleDescriptionBlur={handleDescriptionBlur}
                />
                <div className="form-group">
                    <InputLabel htmlFor={'image'} text={TEAM_MEMBERS_TEXT.FORM.LABEL.PHOTO} />
                    <ImageInput
                        value={formState.image}
                        onChange={handleImgChange}
                        id="image"
                        name="image"
                        cropWidth={TEAM_MEMBER_VALIDATION.img.croppedWidth}
                        cropHeight={TEAM_MEMBER_VALIDATION.img.croppedHeight}
                        minWidth={TEAM_MEMBER_VALIDATION.img.minWidth}
                        minHeight={TEAM_MEMBER_VALIDATION.img.minHeight}
                        disabled={isSubmitting || formDisabled}
                        setError={(error) =>
                            setErrors((prev) => ({
                                ...prev,
                                image: error || undefined,
                            }))
                        }
                    />
                    {errors.image && <span className="error">{errors.image}</span>}
                </div>
            </form>
        );
    },
);
