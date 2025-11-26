import React, { forwardRef, useCallback, useMemo } from 'react';
import { PROGRAM_VALIDATION_FUNCTIONS } from '../../../../../validation/admin/program-schema/program-schema';
import { PROGRAM_VALIDATION, PROGRAMS_TEXT } from '../../../../../const/admin/programs';
import { InputWithCharacterLimitGroup } from '../../../../../components/admin/input-groups/input-with-character-limit-group/InputWithCharacterLimitGroup';
import { TextAreaWithCharacterLimitGroup } from '../../../../../components/admin/input-groups/text-area-with-character-limit-group/TextAreaWithCharacterLimitGroup';
import { PhotoInputGroup } from '../../../../../components/admin/input-groups/photo-input-group/PhotoInputGroup';
import { useFormManager } from '../../../../../hooks/admin/use-form-manager/useFormManager';
import { Image, ImageValues } from '../../../../../types/common/image';
import { ProgramCategory } from '../../../../../types/admin/programs';
import { VisibilityStatus } from '../../../../../types/admin/common';
import './ProgramForm.scss';
import { MultiSelectInputGroup } from '../../../../../components/admin/input-groups/multi-select-input-group/MultiSelectInputGroup';
import { Select } from '../../../../../components/common/select/Select';
import { Button } from '../../../../../components/admin/button/Button';

export interface ProgramFormValues {
    name: string;
    categories: ProgramCategory[];
    description: string;
    image: Image | ImageValues | null;
    imageId: number | null;
    location: string;
    participantsCount: string;
    meetingCount: string;
}

export interface ProgramFormErrors {
    name?: string;
    categories?: string;
    description?: string;
    image?: string;
    location?: string;
    participantsCount?: string;
    meetingCount?: string;
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
    onAddSection?: () => void;
    selectedLanguage?: string;
    onLanguageChange?: (language: string) => void;
}

const validateForm = (formState: ProgramFormValues, isPublishing: boolean): ProgramFormErrors => {
    return {
        name: PROGRAM_VALIDATION_FUNCTIONS.validateName(formState.name, isPublishing),
        categories: PROGRAM_VALIDATION_FUNCTIONS.validateCategories(formState.categories, isPublishing),
        description: PROGRAM_VALIDATION_FUNCTIONS.validateDescription(formState.description, isPublishing),
        image: PROGRAM_VALIDATION_FUNCTIONS.validateImage(formState.image, isPublishing),
        location: PROGRAM_VALIDATION_FUNCTIONS.validateLocation(formState.location, isPublishing),
        participantsCount: PROGRAM_VALIDATION_FUNCTIONS.validateParticipantsCount(
            formState.participantsCount,
            isPublishing,
        ),
        meetingCount: PROGRAM_VALIDATION_FUNCTIONS.validateMeetingCount(formState.meetingCount, isPublishing),
    };
};

export const ProgramForm = forwardRef<ProgramFormRef, ProgramFormProps>(
    (
        {
            initialData = null,
            onSubmit,
            isFormDisabled,
            categories = [],
            onValidationChange,
            onAddSection,
            selectedLanguage,
            onLanguageChange,
        }: ProgramFormProps,
        ref,
    ) => {
        const defaultFormState = useMemo<ProgramFormValues>(
            () => ({
                name: '',
                categories: [],
                description: '',
                image: null,
                imageId: 0,
                //  backgroundImage: null,
                //  backgroundImageId: 0,
                location: '',
                participantsCount: '',
                meetingCount: '',
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
            (e: React.ChangeEvent<HTMLTextAreaElement>) => {
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

        // Location handlers
        const handleLocationChange = useCallback(
            (e: React.ChangeEvent<HTMLInputElement>) => {
                const value = e.target.value;
                setFormState((prev) => ({ ...prev, location: value }));
            },
            [setFormState],
        );

        const handleLocationBlur = useCallback(() => {
            const error = PROGRAM_VALIDATION_FUNCTIONS.validateLocation(formState.location, false);
            setErrors((prev) => ({ ...prev, location: error }));
        }, [formState.location, setErrors]);

        // ParticipantsCount handlers
        const handleParticipantsCountChange = useCallback(
            (e: React.ChangeEvent<HTMLInputElement>) => {
                const value = e.target.value;
                setFormState((prev) => ({ ...prev, participantsCount: value }));
            },
            [setFormState],
        );

        const handleParticipantsCountBlur = useCallback(() => {
            const error = PROGRAM_VALIDATION_FUNCTIONS.validateParticipantsCount(formState.participantsCount, false);
            setErrors((prev) => ({ ...prev, participantsCount: error }));
        }, [formState.participantsCount, setErrors]);

        // MeetingCount handlers
        const handleMeetingCountChange = useCallback(
            (e: React.ChangeEvent<HTMLInputElement>) => {
                const value = e.target.value;
                setFormState((prev) => ({ ...prev, meetingCount: value }));
            },
            [setFormState],
        );

        const handleMeetingCountBlur = useCallback(() => {
            const error = PROGRAM_VALIDATION_FUNCTIONS.validateMeetingCount(formState.meetingCount, false);
            setErrors((prev) => ({ ...prev, meetingCount: error }));
        }, [formState.meetingCount, setErrors]);

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

        //   const handleBackgroundImageChange = useCallback(
        //       (file: ImageValues | null) => {
        //           const image = file;
        //           setFormState((prev) => ({ ...prev, backgroundImage: image }));
        //           const error = PROGRAM_VALIDATION_FUNCTIONS.validateImage(image, false);
        //           setErrors((prev) => ({ ...prev, backgroundImage: error }));
        //       },
        //       [setErrors, setFormState],
        //   );

        return (
            <form className="program-form-main" noValidate>
                <div className="program-form-layout">
                    <div className="program-form-toolbar">
                        <MultiSelectInputGroup
                            label={PROGRAMS_TEXT.FORM.LABEL.CATEGORY}
                            isRequired={true}
                            id="toolbar-categories"
                            options={categories}
                            value={formState.categories}
                            onChange={handleCategoriesChange}
                            onBlur={handleCategoriesBlur}
                            placeholder={PROGRAMS_TEXT.FORM.LABEL.SELECT_CATEGORY}
                            getOptionId={(category: ProgramCategory) => category.id}
                            getOptionName={(category: ProgramCategory) => category.name}
                            error={errors.categories}
                            className="program-form-toolbar-category-select"
                        />

                        <div className="program-form-toolbar-right">
                            <Select<string>
                                value={selectedLanguage}
                                className="program-form-toolbar-language-select"
                                onValueChange={onLanguageChange || (() => {})}
                            >
                                <Select.Option key={1} value="Українська" name="Українська" />
                                <Select.Option key={2} value="Англійська" name="Англійська" />
                            </Select>

                            <Button buttonStyle="primary" onClick={onAddSection || (() => {})}>
                                Додати нову секцію
                            </Button>
                        </div>
                    </div>
                    <div className="program-form-content">
                        {/* <PhotoInputGroup
                            id="img"
                            isRequired={true}
                            name="img"
                            value={formState.backgroundImage}
                            onChange={handleBackgroundImageChange}
                            disabled={isSubmitting || isFormDisabled}
                            error={errors.backgroundImage}
                            setError={(error) =>
                                setErrors((prev) => ({ ...prev, backgroundImage: error || undefined }))
                            }
                            className={`program-form-content-background-image ${formState.backgroundImage ? 'has-image' : ''}`}
                        /> */}
                        <div className="program-form-fields">
                            <div className="program-form-left">
                                <TextAreaWithCharacterLimitGroup
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
                                    className="program-form-left-textarea"
                                />

                                <InputWithCharacterLimitGroup
                                    label={PROGRAMS_TEXT.FORM.LABEL.LOCATION}
                                    id="location"
                                    name="location"
                                    value={formState.location}
                                    onChange={handleLocationChange}
                                    onBlur={handleLocationBlur}
                                    maxLength={PROGRAM_VALIDATION.location.max}
                                    disabled={isSubmitting || isFormDisabled}
                                    error={errors.location}
                                    className="program-form-left-input"
                                />

                                <InputWithCharacterLimitGroup
                                    label={PROGRAMS_TEXT.FORM.LABEL.PARTICIPANTS_COUNT}
                                    id="participantsCount"
                                    name="participantsCount"
                                    value={formState.participantsCount}
                                    onChange={handleParticipantsCountChange}
                                    onBlur={handleParticipantsCountBlur}
                                    maxLength={PROGRAM_VALIDATION.participantsCount.max}
                                    disabled={isSubmitting || isFormDisabled}
                                    error={errors.participantsCount}
                                    className="program-form-left-input"
                                />

                                <InputWithCharacterLimitGroup
                                    label={PROGRAMS_TEXT.FORM.LABEL.MEETING_COUNT}
                                    id="meetingCount"
                                    name="meetingCount"
                                    value={formState.meetingCount}
                                    onChange={handleMeetingCountChange}
                                    onBlur={handleMeetingCountBlur}
                                    maxLength={PROGRAM_VALIDATION.meetingCount.max}
                                    disabled={isSubmitting || isFormDisabled}
                                    error={errors.meetingCount}
                                    className="program-form-left-input"
                                />
                            </div>

                            <div className="program-form-right">
                                <TextAreaWithCharacterLimitGroup
                                    label={PROGRAMS_TEXT.FORM.LABEL.DESCRIPTION}
                                    id="description"
                                    isRequired={true}
                                    name="description"
                                    value={formState.description}
                                    onChange={handleDescriptionChange}
                                    onBlur={handleDescriptionBlur}
                                    rows={8}
                                    disabled={isSubmitting || isFormDisabled}
                                    maxLength={PROGRAM_VALIDATION.description.max}
                                    error={errors.description}
                                    className="program-form-right-textarea"
                                />

                                <PhotoInputGroup
                                    label={PROGRAMS_TEXT.FORM.LABEL.PHOTO}
                                    id="img"
                                    isRequired={true}
                                    name="img"
                                    value={formState.image}
                                    onChange={handleImageChange}
                                    disabled={isSubmitting || isFormDisabled}
                                    error={errors.backgroundImage}
                                    setError={(error) =>
                                        setErrors((prev) => ({ ...prev, backgroundImage: error || undefined }))
                                    }
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        );
    },
);
