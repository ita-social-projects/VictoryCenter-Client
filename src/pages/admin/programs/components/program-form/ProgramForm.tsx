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
import { ProgramCategory, SectionCancelActionType } from '@/types/admin/programs';
import { VisibilityStatus } from '@/types/admin/common';
import { ReactComponent as PlusIcon } from '@/assets/icons/plus.svg';
import NotFoundIcon from '@/assets/icons/not-found.svg';
import styles from './ProgramForm.module.scss';
import { ProgramSection } from '@/types/common/program-sections';
import { BackgroundMedia } from '@/components/public/background-media';
import { getImageSrc } from '@/utils/functions/image-helper/image-helper';
import cn from 'classnames';

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
    replaceSection: (sectionIndex: number, newSection: ProgramSection) => void;
}

export interface ProgramFormProps {
    onSubmit: (data: ProgramFormValues, status: VisibilityStatus) => void;
    initialData?: ProgramFormValues | null;
    isFormDisabled?: boolean;
    categories?: ProgramCategory[];
    onValidationChange?: (isValid: boolean) => void;
    onAddSection?: () => void;
    onReplaceSection?: (sectionIndex: number) => void;
    selectedLanguage?: string;
    onLanguageChange?: (language: string) => void;
    onRequestCancelSection?: (request: { type: SectionCancelActionType; onDiscard: () => void }) => void;
}

interface SectionEditingState {
    sectionKey: string;
    isSaved: boolean;
    isEditing: boolean;
    isNew: boolean;
    isReplacing: boolean;
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
            onReplaceSection,
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

        const sectionsRef = useRef<ProgramSection[]>(formState.sections);
        sectionsRef.current = formState.sections;

        const nextSectionKeyRef = useRef(0);
        const generateSectionKey = () => `section-${++nextSectionKeyRef.current}`;

        const [sectionStates, setSectionStates] = useState<SectionEditingState[]>(
            () =>
                initialData?.sections?.map(() => ({
                    sectionKey: generateSectionKey(),
                    isSaved: true,
                    isEditing: false,
                    isNew: false,
                    isReplacing: false,
                })) ?? [],
        );

        const sectionStatesRef = useRef(sectionStates);
        sectionStatesRef.current = sectionStates;

        useEffect(() => {
            if (initialData?.sections) {
                setSectionStates(
                    initialData.sections.map(() => ({
                        sectionKey: generateSectionKey(),
                        isSaved: true,
                        isEditing: false,
                        isNew: false,
                        isReplacing: false,
                    })),
                );
            }
        }, [initialData]);

        const isMainFormValid = useCallback(
            (isPublishing: boolean) => {
                const formErrors = validateForm(formState, isPublishing) || {};
                return !Object.values(formErrors).some((e) => e !== undefined);
            },
            [formState],
        );

        const allSectionsSaved = useMemo(
            () => sectionStates.length === formState.sections.length && sectionStates.every((s) => s.isSaved),
            [sectionStates, formState.sections.length],
        );

        const hasEditingSections = useMemo(() => sectionStates.some((s) => s.isEditing), [sectionStates]);

        useEffect(() => {
            onValidationChange?.(isMainFormValid(false) && allSectionsSaved && !hasEditingSections);
        }, [onValidationChange, isMainFormValid, allSectionsSaved, hasEditingSections]);

        const updateSectionState = useCallback(
            (sectionKey: string, updates: Partial<Omit<SectionEditingState, 'sectionKey'>>) => {
                setSectionStates((prev) => prev.map((s) => (s.sectionKey === sectionKey ? { ...s, ...updates } : s)));
            },
            [],
        );

        const sectionsContainerRef = useRef<HTMLDivElement>(null);

        const handleAddSection = useCallback(
            (section: ProgramSection) => {
                const sectionKey = generateSectionKey();
                setFormState((prev) => ({
                    ...prev,
                    sections: [...prev.sections, section],
                }));
                setSectionStates((prev) => [
                    ...prev,
                    { sectionKey, isSaved: false, isEditing: true, isNew: true, isReplacing: false },
                ]);
                setTimeout(() => {
                    const lastSection = sectionsContainerRef.current?.lastElementChild as HTMLElement | null;
                    if (lastSection) {
                        lastSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        lastSection.focus({ preventScroll: true });
                    }
                }, 0);
            },
            [setFormState],
        );

        const handleRemoveSection = useCallback(
            (sectionKey: string) => {
                const idx = sectionStatesRef.current.findIndex((s) => s.sectionKey === sectionKey);
                if (idx === -1) return;

                setFormState((prev) => ({
                    ...prev,
                    sections: prev.sections.filter((_, i) => i !== idx),
                }));
                setSectionStates((prev) => prev.filter((s) => s.sectionKey !== sectionKey));
            },
            [setFormState],
        );

        const handleRevertSection = useCallback(
            (sectionKey: string) => {
                if (!initialData) return;

                const idx = sectionStatesRef.current.findIndex((s) => s.sectionKey === sectionKey);
                if (idx === -1) return;

                const sectionToRevert = sectionsRef.current[idx];
                if (!sectionToRevert?.id) return;

                const originalSection = initialData.sections.find((s) => s.id === sectionToRevert.id);
                if (!originalSection) return;

                setFormState((prev) => {
                    const updatedSections = [...prev.sections];
                    updatedSections[idx] = originalSection;
                    return { ...prev, sections: updatedSections };
                });
                updateSectionState(sectionKey, { isSaved: true, isEditing: false, isNew: false });
            },
            [setFormState, initialData, updateSectionState],
        );

        const handleReplaceSection = useCallback(
            (sectionKey: string, newSection: ProgramSection) => {
                const idx = sectionStatesRef.current.findIndex((s) => s.sectionKey === sectionKey);
                if (idx === -1) return;

                setFormState((prev) => {
                    const updatedSections = [...prev.sections];
                    updatedSections[idx] = newSection;
                    return { ...prev, sections: updatedSections };
                });
                updateSectionState(sectionKey, { isReplacing: true, isSaved: false, isEditing: true });
            },
            [setFormState, updateSectionState],
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
                removeSection: (sectionIndex: number) => {
                    const state = sectionStatesRef.current[sectionIndex];
                    if (state) handleRemoveSection(state.sectionKey);
                },
                getSections: () => formState.sections,
                revertSection: (sectionIndex: number) => {
                    const state = sectionStatesRef.current[sectionIndex];
                    if (state) handleRevertSection(state.sectionKey);
                },
                replaceSection: (sectionIndex: number, newSection: ProgramSection) => {
                    const state = sectionStatesRef.current[sectionIndex];
                    if (state) handleReplaceSection(state.sectionKey, newSection);
                },
            }),
            [
                handleAddSection,
                handleRemoveSection,
                handleRevertSection,
                handleReplaceSection,
                formState.sections,
                isMainFormValid,
                allSectionsSaved,
                hasEditingSections,
            ],
        );

        const handleMoveUpSection = useCallback(
            (sectionKey: string) => {
                const idx = sectionStatesRef.current.findIndex((s) => s.sectionKey === sectionKey);
                if (idx <= 0) return;

                setFormState((prev) => {
                    const updatedSections = [...prev.sections];
                    [updatedSections[idx - 1], updatedSections[idx]] = [updatedSections[idx], updatedSections[idx - 1]];
                    return { ...prev, sections: updatedSections };
                });

                setSectionStates((prev) => {
                    const updated = [...prev];
                    [updated[idx - 1], updated[idx]] = [updated[idx], updated[idx - 1]];
                    return updated;
                });

                setTimeout(() => {
                    document.querySelector(`[data-section-key="${sectionKey}"]`)?.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start',
                    });
                }, 50);
            },
            [setFormState],
        );

        const handleMoveDownSection = useCallback(
            (sectionKey: string) => {
                const idx = sectionStatesRef.current.findIndex((s) => s.sectionKey === sectionKey);
                if (idx === -1 || idx >= sectionStatesRef.current.length - 1) return;

                setFormState((prev) => {
                    const updatedSections = [...prev.sections];
                    [updatedSections[idx + 1], updatedSections[idx]] = [updatedSections[idx], updatedSections[idx + 1]];
                    return { ...prev, sections: updatedSections };
                });

                setSectionStates((prev) => {
                    const updated = [...prev];
                    [updated[idx + 1], updated[idx]] = [updated[idx], updated[idx + 1]];
                    return updated;
                });

                setTimeout(() => {
                    document.querySelector(`[data-section-key="${sectionKey}"]`)?.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start',
                    });
                }, 50);
            },
            [setFormState],
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
            (sectionKey: string) => {
                updateSectionState(sectionKey, { isSaved: true, isNew: false, isReplacing: false });
            },
            [updateSectionState],
        );

        const handleSectionChange = useCallback(
            (sectionKey: string, updatedSection: ProgramSection) => {
                const idx = sectionStatesRef.current.findIndex((s) => s.sectionKey === sectionKey);
                if (idx === -1) return;

                setFormState((prev) => {
                    const updatedSections = [...prev.sections];
                    updatedSections[idx] = updatedSection;
                    return { ...prev, sections: updatedSections };
                });
                updateSectionState(sectionKey, { isSaved: false });
            },
            [setFormState, updateSectionState],
        );

        const handleCancelSection = useCallback(
            (sectionKey: string, options: SectionCancelOptions) => {
                const discard = () => {
                    if (options.shouldRemove) {
                        handleRemoveSection(sectionKey);
                    } else {
                        handleSectionChange(sectionKey, options.revertTo);
                        updateSectionState(sectionKey, {
                            isSaved: true,
                            isEditing: false,
                            isNew: false,
                            isReplacing: false,
                        });
                    }
                    options.onAfterDiscard();
                };

                if (options.shouldRemove || options.isDirty || options.isTemplateReplacement) {
                    if (onRequestCancelSection) {
                        const type = options.shouldRemove
                            ? SectionCancelActionType.DiscardNewSection
                            : options.isTemplateReplacement
                              ? SectionCancelActionType.RevertAfterReplace
                              : SectionCancelActionType.RevertSection;
                        onRequestCancelSection({
                            type,
                            onDiscard: discard,
                        });
                    } else {
                        discard();
                    }
                    return;
                }

                discard();
            },
            [handleRemoveSection, handleSectionChange, onRequestCancelSection, updateSectionState],
        );

        const handleDeleteSection = useCallback(
            (sectionKey: string) => {
                const confirmDelete = () => {
                    handleRemoveSection(sectionKey);
                };

                if (onRequestCancelSection) {
                    onRequestCancelSection({
                        type: SectionCancelActionType.RemoveSection,
                        onDiscard: confirmDelete,
                    });
                } else {
                    confirmDelete();
                }
            },
            [handleRemoveSection, onRequestCancelSection],
        );

        const hasSections = formState.sections.length > 0;
        const sectionValidity = useMemo(
            () =>
                formState.sections.map((section) => {
                    try {
                        return section?.contents ? isProgramSectionValid(section, true) : false;
                    } catch {
                        return false;
                    }
                }),
            [formState.sections],
        );

        const handleSectionEditStateChange = useCallback(
            (sectionKey: string, isEditing: boolean) => {
                updateSectionState(sectionKey, { isEditing });
            },
            [updateSectionState],
        );

        const hasBackgroundImage = useMemo(() => {
            return !!getImageSrc(formState.backgroundImage);
        }, [formState.backgroundImage]);

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
                    <div className={styles['background-image-wrapper']}>
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
                    </div>

                    {formState.backgroundImage && (
                        <BackgroundMedia
                            mediaUrl={getImageSrc(formState.backgroundImage) || ''}
                            overlay={{ opacity: 0.3 }}
                            className={styles['body-background']}
                            mediaType="image"
                        />
                    )}

                    <div
                        className={cn(styles['body-inputs'], { [styles['has-background-image']]: hasBackgroundImage })}
                    >
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
                                isWhiteLabel={hasBackgroundImage}
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
                                isWhiteLabel={hasBackgroundImage}
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
                        <div className={styles['sections-list']} ref={sectionsContainerRef}>
                            {formState.sections.map((section, index) => {
                                if (!section) return null;
                                const sectionState = sectionStates[index];
                                if (!sectionState) return null;
                                const { sectionKey } = sectionState;
                                return (
                                    <React.Fragment key={sectionKey}>
                                        <ProgramSectionForm
                                            section={section}
                                            onSave={() => handleSaveSection(sectionKey)}
                                            onCancel={(options) => handleCancelSection(sectionKey, options)}
                                            onSectionChange={(updatedSection) =>
                                                handleSectionChange(sectionKey, updatedSection)
                                            }
                                            isDisabled={isSubmitting || isFormDisabled}
                                            isNewSection={sectionState.isNew}
                                            isSectionValid={sectionValidity[index] ?? false}
                                            onEditStateChange={(isEditing) =>
                                                handleSectionEditStateChange(sectionKey, isEditing)
                                            }
                                            onDelete={() => handleDeleteSection(sectionKey)}
                                            isReplacingTemplate={sectionState.isReplacing}
                                            onRequestReplace={() => onReplaceSection?.(index)}
                                            isFirstSection={index === 0}
                                            isLastSection={index === formState.sections.length - 1}
                                            onMoveUpSection={() => handleMoveUpSection(sectionKey)}
                                            onMoveDownSection={() => handleMoveDownSection(sectionKey)}
                                        />
                                        {index === formState.sections.length - 1 && (
                                            <div className={styles['add-section-wrapper']}>
                                                <Button
                                                    buttonStyle="primary"
                                                    onClick={onAddSection}
                                                    disabled={isSubmitting || isFormDisabled}
                                                    data-testid="add-section-button-bottom"
                                                >
                                                    {PROGRAMS_TEXT.BUTTON.ADD_SECTION}
                                                    <PlusIcon className={styles['plus-icon']} />
                                                </Button>
                                            </div>
                                        )}
                                        <div className={styles['sections-divider']} />
                                    </React.Fragment>
                                );
                            })}
                        </div>
                    )}
                </div>
            </form>
        );
    },
);
