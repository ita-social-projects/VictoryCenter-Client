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
import { MultiSelectInputGroup } from '../../../../../components/admin/input-groups/multi-select-input-group/MultiSelectInputGroup';
import { Button } from '../../../../../components/admin/button/Button';
import { ReactComponent as PlusIcon } from '../../../../../assets/icons/plus.svg';
import './ProgramForm.scss';

export interface ProgramFormValues {
    name: string;
    categories: ProgramCategory[];
    description: string;
    previewImage: Image | ImageValues | null;
    previewImageId: number | null;
    backgroundImage: Image | ImageValues | null;
    backgroundImageId: number | null;
    location: string;
    participantsCount: string;
    meetingCount: string;
}

export interface ProgramFormErrors {
    name?: string;
    categories?: string;
    description?: string;
    previewImage?: string;
    backgroundImage?: string;
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
        previewImage: PROGRAM_VALIDATION_FUNCTIONS.validatePreviewImage(formState.previewImage, isPublishing),
        backgroundImage: PROGRAM_VALIDATION_FUNCTIONS.validateBackgroundImage(formState.backgroundImage, isPublishing),
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
                previewImage: null,
                previewImageId: 0,
                backgroundImage: null,
                backgroundImageId: 0,
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

        const handleNameChange = useCallback(
            (e: React.ChangeEvent<HTMLTextAreaElement>) => {
                setFormState((prev) => ({ ...prev, name: e.target.value }));
            },
            [setFormState],
        );

        const handleNameBlur = useCallback(() => {
            const error = PROGRAM_VALIDATION_FUNCTIONS.validateName(formState.name, false);
            setErrors((prev) => ({ ...prev, name: error }));
        }, [formState.name, setErrors]);

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

        const handleLocationChange = useCallback(
            (e: React.ChangeEvent<HTMLInputElement>) => {
                setFormState((prev) => ({ ...prev, location: e.target.value }));
            },
            [setFormState],
        );

        const handleLocationBlur = useCallback(() => {
            const error = PROGRAM_VALIDATION_FUNCTIONS.validateLocation(formState.location, false);
            setErrors((prev) => ({ ...prev, location: error }));
        }, [formState.location, setErrors]);

        const handleParticipantsCountChange = useCallback(
            (e: React.ChangeEvent<HTMLInputElement>) => {
                setFormState((prev) => ({ ...prev, participantsCount: e.target.value }));
            },
            [setFormState],
        );

        const handleParticipantsCountBlur = useCallback(() => {
            const error = PROGRAM_VALIDATION_FUNCTIONS.validateParticipantsCount(formState.participantsCount, false);
            setErrors((prev) => ({ ...prev, participantsCount: error }));
        }, [formState.participantsCount, setErrors]);

        const handleMeetingCountChange = useCallback(
            (e: React.ChangeEvent<HTMLInputElement>) => {
                setFormState((prev) => ({ ...prev, meetingCount: e.target.value }));
            },
            [setFormState],
        );

        const handleMeetingCountBlur = useCallback(() => {
            const error = PROGRAM_VALIDATION_FUNCTIONS.validateMeetingCount(formState.meetingCount, false);
            setErrors((prev) => ({ ...prev, meetingCount: error }));
        }, [formState.meetingCount, setErrors]);

        const handleDescriptionChange = useCallback(
            (e: React.ChangeEvent<HTMLTextAreaElement>) => {
                setFormState((prev) => ({ ...prev, description: e.target.value }));
            },
            [setFormState],
        );

        const handleDescriptionBlur = useCallback(() => {
            const error = PROGRAM_VALIDATION_FUNCTIONS.validateDescription(formState.description, false);
            setErrors((prev) => ({ ...prev, description: error }));
        }, [formState.description, setErrors]);

        const handlePreviewImageChange = useCallback(
            (file: ImageValues | null) => {
                setFormState((prev) => ({ ...prev, image: file }));
                const error = PROGRAM_VALIDATION_FUNCTIONS.validatePreviewImage(file, false);
                setErrors((prev) => ({ ...prev, image: error }));
            },
            [setErrors, setFormState],
        );

        const handleSetPreviewImageError = useCallback(
            (error: string | null) => setErrors((prev) => ({ ...prev, image: error || undefined })),
            [setErrors],
        );

        const handleBackgroundImageChange = useCallback(
            (file: ImageValues | null) => {
                setFormState((prev) => ({ ...prev, backgroundImage: file }));
                const error = PROGRAM_VALIDATION_FUNCTIONS.validateBackgroundImage(file, false);
                setErrors((prev) => ({ ...prev, backgroundImage: error }));
            },
            [setErrors, setFormState],
        );

        const handleSetBackgroundImageError = useCallback(
            (error: string | null) => setErrors((prev) => ({ ...prev, backgroundImage: error || undefined })),
            [setErrors],
        );

        return (
            <form className="program-form" noValidate>
                {/* Header Section */}
                <div className="program-form__header">
                    <div className="program-form__header-left">
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
                        />
                    </div>

                    <div className="program-form__header-right">
                        <Button
                            onClick={onAddSection}
                            buttonStyle="primary"
                            data-testid="add-program-button"
                            className="program-form__add-btn"
                        >
                            {PROGRAMS_TEXT.BUTTON.ADD_PROGRAM} <PlusIcon />
                        </Button>
                    </div>
                </div>

                {/* Main Content Layout */}
                <div className="program-form__body">
                    <PhotoInputGroup
                        label="Завантажте файл"
                        id="backgroundImage"
                        isRequired={true}
                        name="backgroundImage"
                        value={formState.backgroundImage}
                        onChange={handleBackgroundImageChange}
                        disabled={isSubmitting || isFormDisabled}
                        error={errors.backgroundImage}
                        setError={handleSetBackgroundImageError}
                    />
                    <div className="program-form__body__inputs">
                        <div className="program-form__col-left">
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
                                placeholder={PROGRAMS_TEXT.PLACEHOLDER.INSERT_PROGRAM_NAME}
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
                                placeholder={PROGRAMS_TEXT.PLACEHOLDER.INSERT_PROGRAM_LOCATION}
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
                                placeholder={PROGRAMS_TEXT.PLACEHOLDER.INSERT_PROGRAM_PARTICIPANTS_COUNT}
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
                                placeholder={PROGRAMS_TEXT.PLACEHOLDER.INSERT_PROGRAM_MEETINGS_COUNT}
                            />
                        </div>

                        <div className="program-form__col-right">
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
                            />

                            <PhotoInputGroup
                                label={PROGRAMS_TEXT.FORM.LABEL.PREVIEW_IMAGE}
                                id="previewImage"
                                isRequired={true}
                                name="previewImage"
                                value={formState.previewImage}
                                onChange={handlePreviewImageChange}
                                disabled={isSubmitting || isFormDisabled}
                                error={errors.image}
                                setError={handleSetPreviewImageError}
                            />
                        </div>
                    </div>
                </div>
            </form>
        );
    },
);

ProgramForm.displayName = 'ProgramForm';
