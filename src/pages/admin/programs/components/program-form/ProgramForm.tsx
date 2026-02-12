import React, { forwardRef, useCallback, useEffect, useMemo, useImperativeHandle, useRef, useState } from 'react';
import { PROGRAM_VALIDATION_FUNCTIONS, isProgramSectionValid } from '@/validation/admin/program-schema/program-schema';
import { PROGRAM_VALIDATION, PROGRAMS_TEXT } from '@/const/admin/programs';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { InputWithCharacterLimitGroup } from '@/components/admin/input-groups/input-with-character-limit-group/InputWithCharacterLimitGroup';
import { TextAreaWithCharacterLimitGroup } from '@/components/admin/input-groups/text-area-with-character-limit-group/TextAreaWithCharacterLimitGroup';
import { MultiSelectInputGroup } from '@/components/admin/input-groups/multi-select-input-group/MultiSelectInputGroup';
import { PhotoInputGroup } from '@/components/admin/input-groups/photo-input-group/PhotoInputGroup';
import { useFormManager } from '@/hooks/admin/use-form-manager/useFormManager';
import { Button } from '@/components/admin/button/Button';
import { ProgramSectionForm, SectionCancelOptions } from '../program-section-form/ProgramSectionForm';
import { Image, ImageValues } from '@/types/common/image';
import { ProgramCategory, SectionDiscardType } from '@/types/admin/programs';
import { VisibilityStatus } from '@/types/admin/common';
import { ReactComponent as PlusIcon } from '@/assets/icons/plus.svg';
import NotFoundIcon from '@/assets/icons/not-found.svg';
import styles from './ProgramForm.module.scss';
import { ProgramSection } from '@/types/common/program-sections';

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
    sections: ProgramSection[];
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
    sections?: string;
    [key: string]: string | undefined;
}

export interface ProgramFormRef {
    submit: (status: VisibilityStatus) => Promise<void>;
    isValid: (isPublishing?: boolean) => boolean;
    isDirty: () => boolean;
    addSection: (section: ProgramSection) => void;
    removeSection: (sectionIndex: number) => void;
    getSections: () => ProgramSection[];
    revertSection: (sectionIndex: number) => void;
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
    onRequestCancelSection?: (request: { type: SectionDiscardType; onDiscard: () => void }) => void;
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
        sections: undefined,
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
            onRequestCancelSection,
        }: ProgramFormProps,
        ref,
    ) => {
        const defaultFormState = useMemo<ProgramFormValues>(
            () => ({
                name: '',
                categories: [],
                description: '',
                previewImage: null,
                previewImageId: null,
                backgroundImage: null,
                backgroundImageId: null,
                location: '',
                participantsCount: '',
                meetingCount: '',
                sections: [],
            }),
            [],
        );

        interface InternalFormRef {
            submit: (status: VisibilityStatus) => Promise<void>;
            isValid: (isPublishing?: boolean) => boolean;
            isDirty: () => boolean;
        }

        const internalRef = useRef<InternalFormRef | null>(null);

        const { formState, setFormState, errors, setErrors, isSubmitting } = useFormManager<
            ProgramFormValues,
            ProgramFormErrors
        >({
            defaultFormState,
            initialData,
            validateForm,
            onSubmit,
            ref: internalRef,
        });

        const [savedSections, setSavedSections] = useState<boolean[]>([]);
        const [editingSections, setEditingSections] = useState<boolean[]>([]);
        const [newSections, setNewSections] = useState<boolean[]>([]);

        useEffect(() => {
            setSavedSections(initialData?.sections?.map(() => true) ?? []);
            setEditingSections(initialData?.sections?.map(() => false) ?? []);
            setNewSections(initialData?.sections?.map(() => false) ?? []);
        }, [initialData]);

        const isMainFormValid = useCallback(
            (isPublishing: boolean) => {
                const formErrors = validateForm(formState, isPublishing) || {};
                return !Object.values(formErrors).some((e) => e !== undefined);
            },
            [formState],
        );

        const allSectionsSaved = useMemo(
            () => savedSections.length === formState.sections.length && savedSections.every(Boolean),
            [savedSections, formState.sections.length],
        );

        const hasEditingSections = useMemo(
            () => editingSections.length > 0 && editingSections.some(Boolean),
            [editingSections],
        );

        useEffect(() => {
            onValidationChange?.(isMainFormValid(false) && allSectionsSaved && !hasEditingSections);
        }, [onValidationChange, isMainFormValid, allSectionsSaved, hasEditingSections]);

        const updateSectionFlag = useCallback(
            (setter: React.Dispatch<React.SetStateAction<boolean[]>>, sectionIndex: number, value: boolean) => {
                setter((prev) => {
                    const next = [...prev];
                    next[sectionIndex] = value;
                    return next;
                });
            },
            [],
        );

        const handleAddSection = useCallback(
            (section: ProgramSection) => {
                setFormState((prev) => ({
                    ...prev,
                    sections: [section, ...prev.sections],
                }));
                setSavedSections((prev) => [false, ...prev]);
                setEditingSections((prev) => [true, ...prev]);
                setNewSections((prev) => [true, ...prev]);
            },
            [setFormState],
        );

        const handleRemoveSection = useCallback(
            (sectionIndex: number) => {
                setFormState((prev) => ({
                    ...prev,
                    sections: prev.sections.filter((_, index) => index !== sectionIndex),
                }));
                setSavedSections((prev) => prev.filter((_, index) => index !== sectionIndex));
                setEditingSections((prev) => prev.filter((_, index) => index !== sectionIndex));
                setNewSections((prev) => prev.filter((_, index) => index !== sectionIndex));
            },
            [setFormState],
        );

        const handleRevertSection = useCallback(
            (sectionIndex: number) => {
                if (!initialData) return;

                const sectionToRevert = formState.sections[sectionIndex];
                if (!sectionToRevert?.id) return;

                const originalSection = initialData.sections.find((s) => s.id === sectionToRevert.id);
                if (!originalSection) return;

                setFormState((prev) => {
                    const updatedSections = [...prev.sections];
                    updatedSections[sectionIndex] = originalSection;
                    return { ...prev, sections: updatedSections };
                });
                updateSectionFlag(setSavedSections, sectionIndex, true);
                updateSectionFlag(setEditingSections, sectionIndex, false);
                updateSectionFlag(setNewSections, sectionIndex, false);
            },
            [setFormState, initialData, formState.sections, updateSectionFlag],
        );

        useImperativeHandle(
            ref,
            () => ({
                submit: async (status: VisibilityStatus) => {
                    await internalRef.current?.submit(status);
                },
                isValid: (isPublishing?: boolean) => {
                    return isMainFormValid(!!isPublishing) && allSectionsSaved && !hasEditingSections;
                },
                isDirty: () => {
                    return internalRef.current?.isDirty() ?? false;
                },
                addSection: handleAddSection,
                removeSection: handleRemoveSection,
                getSections: () => formState.sections,
                revertSection: handleRevertSection,
            }),
            [
                handleAddSection,
                handleRemoveSection,
                handleRevertSection,
                formState.sections,
                isMainFormValid,
                allSectionsSaved,
                hasEditingSections,
            ],
        );

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
                setFormState((prev) => ({ ...prev, previewImage: file, previewImageId: null }));
                const error = PROGRAM_VALIDATION_FUNCTIONS.validatePreviewImage(file, false);
                setErrors((prev) => ({ ...prev, previewImage: error }));
            },
            [setErrors, setFormState],
        );

        const handleSetPreviewImageError = useCallback(
            (error: string | null) => setErrors((prev) => ({ ...prev, previewImage: error || undefined })),
            [setErrors],
        );

        const handleBackgroundImageChange = useCallback(
            (file: ImageValues | null) => {
                setFormState((prev) => ({ ...prev, backgroundImage: file, backgroundImageId: null }));
                const error = PROGRAM_VALIDATION_FUNCTIONS.validateBackgroundImage(file, false);
                setErrors((prev) => ({ ...prev, backgroundImage: error }));
            },
            [setErrors, setFormState],
        );

        const handleSetBackgroundImageError = useCallback(
            (error: string | null) => setErrors((prev) => ({ ...prev, backgroundImage: error || undefined })),
            [setErrors],
        );

        const handleSaveSection = useCallback(
            (sectionIndex: number) => {
                updateSectionFlag(setSavedSections, sectionIndex, true);
                updateSectionFlag(setNewSections, sectionIndex, false);
            },
            [updateSectionFlag],
        );

        const handleSectionChange = useCallback(
            (sectionIndex: number, updatedSection: ProgramSection) => {
                setFormState((prev) => {
                    const updatedSections = [...prev.sections];
                    updatedSections[sectionIndex] = updatedSection;
                    return { ...prev, sections: updatedSections };
                });
                updateSectionFlag(setSavedSections, sectionIndex, false);
            },
            [setFormState, updateSectionFlag],
        );

        const handleCancelSection = useCallback(
            (sectionIndex: number, options: SectionCancelOptions) => {
                const discard = () => {
                    if (options.shouldRemove) {
                        handleRemoveSection(sectionIndex);
                    } else {
                        handleSectionChange(sectionIndex, options.revertTo);
                        updateSectionFlag(setSavedSections, sectionIndex, true);
                        updateSectionFlag(setEditingSections, sectionIndex, false);
                        updateSectionFlag(setNewSections, sectionIndex, false);
                    }
                    options.onAfterDiscard();
                };

                if (options.shouldRemove || options.isDirty) {
                    if (onRequestCancelSection) {
                        const type = options.shouldRemove
                            ? SectionDiscardType.RemoveSection
                            : SectionDiscardType.RevertSection;
                        onRequestCancelSection({ type, onDiscard: discard });
                    } else {
                        discard();
                    }
                    return;
                }

                discard();
            },
            [handleRemoveSection, handleSectionChange, onRequestCancelSection, updateSectionFlag],
        );

        const hasSections = formState.sections.length > 0;
        const sectionValidity = useMemo(
            () => formState.sections.map((section) => isProgramSectionValid(section, true)),
            [formState.sections],
        );

        const handleSectionEditStateChange = useCallback(
            (sectionIndex: number, isEditing: boolean) => {
                updateSectionFlag(setEditingSections, sectionIndex, isEditing);
            },
            [updateSectionFlag],
        );

        return (
            <form className={styles['container']} noValidate>
                {/* Header Section */}
                <div className={styles['header']}>
                    <div className={styles['header-left']}>
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

                    <div className={styles['header-right']}>
                        <Button
                            onClick={onAddSection}
                            buttonStyle="primary"
                            disabled={isSubmitting || isFormDisabled}
                            data-testid="add-program-button"
                        >
                            {PROGRAMS_TEXT.BUTTON.ADD_NEW_SECTION} <PlusIcon />
                        </Button>
                    </div>
                </div>
                <div className={styles['sections-divider']} />

                {/* Main Content Layout */}
                <div className={styles['body']}>
                    <PhotoInputGroup
                        id="backgroundImage"
                        isRequired={true}
                        name="backgroundImage"
                        value={formState.backgroundImage}
                        onChange={handleBackgroundImageChange}
                        disabled={isSubmitting || isFormDisabled}
                        error={errors.backgroundImage}
                        variant="program"
                        setError={handleSetBackgroundImageError}
                        cropWidth={PROGRAM_VALIDATION.backgroundImage.cropWidth}
                        cropHeight={PROGRAM_VALIDATION.backgroundImage.cropHeight}
                        minWidth={PROGRAM_VALIDATION.backgroundImage.minWidth}
                        minHeight={PROGRAM_VALIDATION.backgroundImage.minHeight}
                        imageLabel={COMMON_TEXT_ADMIN.INPUT.DRAG_AND_DROP_FILE_HERE}
                        imageSubText={COMMON_TEXT_ADMIN.INPUT.getImageSizeSubText(
                            PROGRAM_VALIDATION.backgroundImage.height,
                            PROGRAM_VALIDATION.backgroundImage.width,
                        )}
                        maxSizeMB={PROGRAM_VALIDATION.images.maxSizeMB}
                    />
                    <div className={styles['body-inputs']}>
                        <div className={styles['col-left']}>
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

                        <div className={styles['col-right']}>
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
                                error={errors.previewImage}
                                setError={handleSetPreviewImageError}
                                cropWidth={PROGRAM_VALIDATION.previewImage.cropWidth}
                                cropHeight={PROGRAM_VALIDATION.previewImage.cropHeight}
                                minWidth={PROGRAM_VALIDATION.previewImage.minWidth}
                                minHeight={PROGRAM_VALIDATION.previewImage.minHeight}
                                imageLabel={COMMON_TEXT_ADMIN.INPUT.DRAG_AND_DROP_FILE_HERE}
                                imageSubText={COMMON_TEXT_ADMIN.INPUT.getImageSizeSubText(
                                    PROGRAM_VALIDATION.previewImage.height,
                                    PROGRAM_VALIDATION.previewImage.width,
                                )}
                                maxSizeMB={PROGRAM_VALIDATION.images.maxSizeMB}
                            />
                        </div>
                    </div>
                </div>

                <div className={styles['sections-divider']} />

                {/* Sections Area */}
                <div className={styles['sections-container']}>
                    {!hasSections && (
                        <>
                            <div className={styles['empty-sections-state']}>
                                <img src={NotFoundIcon} alt="No sections" className={styles['empty-sections-image']} />
                                <p className={styles['empty-sections-text']}>{PROGRAMS_TEXT.MESSAGE.NO_SECTIONS_YET}</p>
                                <Button
                                    className={styles['btn-add']}
                                    onClick={onAddSection}
                                    buttonStyle="secondary"
                                    disabled={isSubmitting || isFormDisabled}
                                    data-testid="add-section-button-empty"
                                >
                                    {PROGRAMS_TEXT.BUTTON.ADD_SECTION}
                                    <PlusIcon className={styles['plus-icon']} />
                                </Button>
                            </div>
                            <div className={styles['sections-divider']} />
                        </>
                    )}

                    {hasSections && (
                        <div className={styles['sections-list']}>
                            {formState.sections.map((section, index) => (
                                <React.Fragment key={section.id ?? `${section.template}-${index}`}>
                                    <ProgramSectionForm
                                        section={section}
                                        onSave={() => handleSaveSection(index)}
                                        onCancel={(options) => handleCancelSection(index, options)}
                                        onSectionChange={(updatedSection) => handleSectionChange(index, updatedSection)}
                                        isDisabled={isSubmitting || isFormDisabled}
                                        isNewSection={newSections[index] ?? false}
                                        isSectionValid={sectionValidity[index] ?? false}
                                        onEditStateChange={(isEditing) =>
                                            handleSectionEditStateChange(index, isEditing)
                                        }
                                    />
                                    <div className={styles['sections-divider']} />
                                </React.Fragment>
                            ))}
                        </div>
                    )}
                </div>
            </form>
        );
    },
);
