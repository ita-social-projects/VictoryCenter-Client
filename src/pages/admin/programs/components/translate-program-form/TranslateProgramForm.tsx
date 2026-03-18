import React, { forwardRef, useCallback, useEffect, useMemo, useImperativeHandle, useRef } from 'react';
import { PROGRAM_VALIDATION_FUNCTIONS } from '@/validation/admin/program-schema/program-schema';
import { PROGRAM_VALIDATION, PROGRAMS_TEXT } from '@/const/admin/programs';
import { InputWithCharacterLimitGroup } from '@/components/admin/input-groups/input-with-character-limit-group/InputWithCharacterLimitGroup';
import { TextAreaWithCharacterLimitGroup } from '@/components/admin/input-groups/text-area-with-character-limit-group/TextAreaWithCharacterLimitGroup';
import { useFormManager } from '@/hooks/admin/use-form-manager/useFormManager';
import { VisibilityStatus } from '@/types/admin/common';
import { CreateHippotherapyProgramSectionLocalizationDto } from '@/types/common/program-sections';
import { Image, ImageValues } from '@/types/common/image';
import { BackgroundMedia } from '@/components/public/background-media';
import { getImageSrc } from '@/utils/functions/image-helper/image-helper';
import NotFoundIcon from '@/assets/icons/not-found.svg';
import cn from 'classnames';
import programFormStyles from '../program-form/ProgramForm.module.scss';
import styles from './TranslateProgramForm.module.scss';
import { HippotherapyProgramSectionDto } from '@/types/common/program-sections';
import { ContentType } from '@/types/common/programs';
import { ProgramSectionMode, ProgramSectionTemplate } from '@/types/common/program-sections';
import { renderProgramSection } from '@/utils/functions/render-program-section';

export interface TranslateProgramFormValues {
    name: string;
    description: string;
    location: string;
    participantsCount: string;
    meetingCount: string;
    sections: CreateHippotherapyProgramSectionLocalizationDto[];
}

export interface TranslateProgramFormErrors {
    name?: string;
    description?: string;
    location?: string;
    participantsCount?: string;
    meetingCount?: string;
    sections?: string;
    [key: string]: string | undefined;
}

export interface TranslateProgramFormRef {
    submit: (status: VisibilityStatus) => Promise<void>;
    isValid: (isPublishing?: boolean) => boolean;
    isDirty: () => boolean;
}

export interface TranslateProgramFormProps {
    onSubmit: (data: TranslateProgramFormValues, status: VisibilityStatus) => void;
    initialData?: TranslateProgramFormValues | null;
    previewImage?: Image | ImageValues | null;
    backgroundImage?: Image | ImageValues | null;
    isFormDisabled?: boolean;
    onValidationChange?: (isValid: boolean) => void;
    onDirtyChange?: (isDirty: boolean) => void;
}

const validateForm = (formState: TranslateProgramFormValues, isPublishing: boolean): TranslateProgramFormErrors => {
    return {
        name: PROGRAM_VALIDATION_FUNCTIONS.validateName(formState.name, isPublishing),
        description: PROGRAM_VALIDATION_FUNCTIONS.validateDescription(formState.description, isPublishing),
        location: PROGRAM_VALIDATION_FUNCTIONS.validateLocation(formState.location, isPublishing),
        participantsCount: PROGRAM_VALIDATION_FUNCTIONS.validateParticipantsCount(
            formState.participantsCount,
            isPublishing,
        ),
        meetingCount: PROGRAM_VALIDATION_FUNCTIONS.validateMeetingCount(formState.meetingCount, isPublishing),
        sections: undefined,
    };
};

export const TranslateProgramForm = forwardRef<TranslateProgramFormRef, TranslateProgramFormProps>(
    (
        {
            initialData = null,
            onSubmit,
            previewImage = null,
            backgroundImage = null,
            isFormDisabled,
            onValidationChange,
            onDirtyChange,
        }: TranslateProgramFormProps,
        ref,
    ) => {
        const mediaData = initialData as
            | (TranslateProgramFormValues & {
                  __previewImage?: Image | ImageValues | null;
                  __backgroundImage?: Image | ImageValues | null;
              })
            | null;

        const defaultFormState = useMemo<TranslateProgramFormValues>(
            () => ({
                name: '',
                description: '',
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
            TranslateProgramFormValues,
            TranslateProgramFormErrors
        >({
            defaultFormState,
            initialData,
            validateForm,
            onSubmit,
            ref: internalRef,
        });

        const isMainFormValid = useCallback(
            (isPublishing: boolean) => {
                const formErrors = validateForm(formState, isPublishing) || {};
                return !Object.values(formErrors).some((e) => e !== undefined);
            },
            [formState],
        );

        useEffect(() => {
            onValidationChange?.(isMainFormValid(false));
        }, [onValidationChange, isMainFormValid]);

        useEffect(() => {
            const isDirty = JSON.stringify(formState) !== JSON.stringify(initialData ?? defaultFormState);
            onDirtyChange?.(isDirty);
        }, [defaultFormState, formState, initialData, onDirtyChange]);

        useImperativeHandle(
            ref,
            () => ({
                submit: async (status: VisibilityStatus) => {
                    await internalRef.current?.submit(status);
                },
                isValid: (isPublishing?: boolean) => {
                    return isMainFormValid(!!isPublishing);
                },
                isDirty: () => {
                    return internalRef.current?.isDirty() ?? false;
                },
            }),
            [isMainFormValid],
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

        const resolvedBackgroundImage = mediaData?.__backgroundImage ?? backgroundImage;
        const resolvedPreviewImage = mediaData?.__previewImage ?? previewImage;

        const backgroundImageSrc = getImageSrc(resolvedBackgroundImage);
        const previewImageSrc = getImageSrc(resolvedPreviewImage);
        const hasBackgroundImage = !!backgroundImageSrc;
        const hasSections = formState.sections.length > 0;

        const getLocalizedText = useCallback(
            (
                sourceContentId: number | undefined,
                field: 'title' | 'description' | 'author' | 'question' | 'answer',
            ) => {
                if (!sourceContentId) return '';
                const translatedContent = formState.sections
                    .flatMap((section) => section.contents)
                    .find((content) => content.entityId === sourceContentId);

                const translatedValue = translatedContent?.[field];
                if (typeof translatedValue === 'string' && translatedValue.length > 0) {
                    return translatedValue;
                }

                if (field === 'question') {
                    const questionText = translatedContent?.questionText;
                    if (typeof questionText === 'string' && questionText.length > 0) {
                        return questionText;
                    }
                }

                if (field === 'answer') {
                    const answerText = translatedContent?.answerText;
                    if (typeof answerText === 'string' && answerText.length > 0) {
                        return answerText;
                    }
                }

                return '';
            },
            [formState.sections],
        );

        const updateSectionContentField = useCallback(
            (
                sectionEntityId: number,
                sourceContentId: number | undefined,
                field: 'title' | 'description' | 'author' | 'question' | 'answer',
                value: string,
            ) => {
                if (!sourceContentId) return;

                setFormState((prev) => ({
                    ...prev,
                    sections: prev.sections.map((section) => {
                        if (section.entityId !== sectionEntityId) return section;

                        return {
                            ...section,
                            contents: section.contents.map((content) => {
                                if (content.entityId !== sourceContentId) {
                                    return content;
                                }

                                if (field === 'question') {
                                    return {
                                        ...content,
                                        question: value,
                                        questionText: value,
                                    };
                                }

                                if (field === 'answer') {
                                    return {
                                        ...content,
                                        answer: value,
                                        answerText: value,
                                    };
                                }

                                return { ...content, [field]: value };
                            }),
                        };
                    }),
                }));
            },
            [setFormState],
        );

        const renderSectionEditor = useCallback(
            (sourceSection: HippotherapyProgramSectionDto) => {
                const targetSection = formState.sections.find((section) => section.entityId === sourceSection.id);
                if (!targetSection || !sourceSection.id) return null;

                const orderedTitles = sourceSection.contents
                    .filter((content) => content.contentType === ContentType.Title)
                    .sort((a, b) => a.order - b.order);

                const orderedDescriptions = sourceSection.contents
                    .filter((content) => content.contentType === ContentType.Description)
                    .sort((a, b) => a.order - b.order);

                const images = sourceSection.contents
                    .filter((content) => content.contentType === ContentType.Image)
                    .sort((a, b) => a.order - b.order)
                    .map((content) => content.image || null);

                const cards = orderedTitles.map((titleContent, idx) => ({
                    title: getLocalizedText(titleContent.id, 'title'),
                    description: getLocalizedText(orderedDescriptions[idx]?.id, 'description'),
                }));

                const descriptionAuthorPairs = Array.from(
                    new Set(sourceSection.contents.map((content) => content.groupIndex).filter((x) => x !== null)),
                )
                    .sort((a, b) => Number(a) - Number(b))
                    .map((groupIndex) => {
                        const descriptionContent = sourceSection.contents.find(
                            (content) =>
                                content.contentType === ContentType.Description && content.groupIndex === groupIndex,
                        );
                        const authorContent = sourceSection.contents.find(
                            (content) =>
                                content.contentType === ContentType.Author && content.groupIndex === groupIndex,
                        );

                        return {
                            description: getLocalizedText(descriptionContent?.id, 'description'),
                            author: getLocalizedText(authorContent?.id, 'author'),
                        };
                    });

                const faqPairs = sourceSection.contents
                    .filter((content) => content.contentType === ContentType.FaqQuestion)
                    .sort((a, b) => (a.groupIndex ?? 0) - (b.groupIndex ?? 0))
                    .map((content) => ({
                        id: content.faqQuestionId ?? undefined,
                        questionText: getLocalizedText(content.id, 'question'),
                        answerText: getLocalizedText(content.id, 'answer'),
                    }));

                return renderProgramSection({
                    templateId: sourceSection.template,
                    mode: ProgramSectionMode.Edit,
                    data: {
                        title: getLocalizedText(orderedTitles[0]?.id, 'title'),
                        description: getLocalizedText(orderedDescriptions[0]?.id, 'description'),
                        descriptions: orderedDescriptions.map((content) => getLocalizedText(content.id, 'description')),
                        images,
                        cards,
                        descriptionAuthorPairs,
                        faqPairs,
                    },
                    handlers: {
                        onTitleChange: (value) =>
                            updateSectionContentField(sourceSection.id!, orderedTitles[0]?.id, 'title', value),
                        onDescriptionChange: (value) =>
                            updateSectionContentField(
                                sourceSection.id!,
                                orderedDescriptions[0]?.id,
                                'description',
                                value,
                            ),
                        onDescriptionsChange: (index, value) =>
                            updateSectionContentField(
                                sourceSection.id!,
                                orderedDescriptions[index]?.id,
                                'description',
                                value,
                            ),
                        onCardTitleChange: (index, value) =>
                            updateSectionContentField(sourceSection.id!, orderedTitles[index]?.id, 'title', value),
                        onCardDescriptionChange: (index, value) => {
                            if (sourceSection.template === ProgramSectionTemplate.SingleTitleDescriptionAuthorPairs) {
                                const groupIndexes = Array.from(
                                    new Set(
                                        sourceSection.contents
                                            .map((content) => content.groupIndex)
                                            .filter((x) => x !== null),
                                    ),
                                )
                                    .map((x) => Number(x))
                                    .sort((a, b) => a - b);

                                const descriptionSource = sourceSection.contents.find(
                                    (content) =>
                                        content.contentType === ContentType.Description &&
                                        content.groupIndex === groupIndexes[index],
                                );

                                updateSectionContentField(
                                    sourceSection.id!,
                                    descriptionSource?.id,
                                    'description',
                                    value,
                                );
                                return;
                            }

                            updateSectionContentField(
                                sourceSection.id!,
                                orderedDescriptions[index]?.id,
                                'description',
                                value,
                            );
                        },
                        onCardAuthorChange: (index, value) => {
                            const groupIndexes = Array.from(
                                new Set(
                                    sourceSection.contents
                                        .map((content) => content.groupIndex)
                                        .filter((x) => x !== null),
                                ),
                            )
                                .map((x) => Number(x))
                                .sort((a, b) => a - b);

                            const authorSource = sourceSection.contents.find(
                                (content) =>
                                    content.contentType === ContentType.Author &&
                                    content.groupIndex === groupIndexes[index],
                            );

                            updateSectionContentField(sourceSection.id!, authorSource?.id, 'author', value);
                        },
                        canAddPair: false,
                        onFaqQuestionChange: (index, value) => {
                            const faqSource = sourceSection.contents
                                .filter((content) => content.contentType === ContentType.FaqQuestion)
                                .sort((a, b) => (a.groupIndex ?? 0) - (b.groupIndex ?? 0))[index];

                            updateSectionContentField(sourceSection.id!, faqSource?.id, 'question', value);
                        },
                        onFaqAnswerChange: (index, value) => {
                            const faqSource = sourceSection.contents
                                .filter((content) => content.contentType === ContentType.FaqQuestion)
                                .sort((a, b) => (a.groupIndex ?? 0) - (b.groupIndex ?? 0))[index];

                            updateSectionContentField(sourceSection.id!, faqSource?.id, 'answer', value);
                        },
                    },
                });
            },
            [formState.sections, getLocalizedText, updateSectionContentField],
        );

        return (
            <form className={programFormStyles['container']} data-testid="translate-program-form" noValidate>
                <div className={programFormStyles['sections-divider']} />

                <div className={programFormStyles['body']}>
                    <div className={programFormStyles['background-image-wrapper']}>
                        {backgroundImageSrc ? (
                            <img
                                src={backgroundImageSrc}
                                alt={PROGRAMS_TEXT.FORM.LABEL.DESCRIPTION}
                                className={styles['background-image']}
                            />
                        ) : (
                            <div className={styles['background-image-placeholder']}>
                                {PROGRAMS_TEXT.FORM.LABEL.DESCRIPTION}
                            </div>
                        )}
                    </div>

                    {backgroundImageSrc && (
                        <BackgroundMedia
                            mediaUrl={backgroundImageSrc}
                            overlay={{ opacity: 0.3 }}
                            className={programFormStyles['body-background']}
                            mediaType="image"
                        />
                    )}

                    <div
                        className={cn(programFormStyles['body-inputs'], {
                            [programFormStyles['has-background-image']]: hasBackgroundImage,
                        })}
                    >
                        <div className={programFormStyles['col-left']}>
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

                        <div className={programFormStyles['col-right']}>
                            <TextAreaWithCharacterLimitGroup
                                label={PROGRAMS_TEXT.FORM.LABEL.DESCRIPTION}
                                isRequired={true}
                                id="description"
                                name="description"
                                value={formState.description}
                                onChange={handleDescriptionChange}
                                onBlur={handleDescriptionBlur}
                                rows={8}
                                maxLength={PROGRAM_VALIDATION.description.max}
                                disabled={isSubmitting || isFormDisabled}
                                error={errors.description}
                                isWhiteLabel={hasBackgroundImage}
                            />

                            <div className={styles['preview-image-readonly']}>
                                {previewImageSrc ? (
                                    <img
                                        src={previewImageSrc}
                                        alt={PROGRAMS_TEXT.FORM.LABEL.PREVIEW_IMAGE}
                                        className={styles['preview-image']}
                                    />
                                ) : (
                                    <div className={styles['preview-image-placeholder']}>
                                        {PROGRAMS_TEXT.FORM.LABEL.PREVIEW_IMAGE}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className={programFormStyles['sections-divider']} />

                <div className={programFormStyles['sections-container']}>
                    {!hasSections && (
                        <div className={programFormStyles['empty-sections-state']}>
                            <img
                                src={NotFoundIcon}
                                alt="No sections"
                                className={programFormStyles['empty-sections-image']}
                            />
                            <p className={programFormStyles['empty-sections-text']}>
                                {PROGRAMS_TEXT.MESSAGE.NO_SECTIONS_YET}
                            </p>
                        </div>
                    )}

                    {hasSections && (
                        <div className={programFormStyles['sections-list']}>
                            {formState.sections.map((section) => (
                                <div key={section.entityId} className={styles['section-wrapper']}>
                                    {(
                                        section as CreateHippotherapyProgramSectionLocalizationDto & {
                                            __sourceSection?: HippotherapyProgramSectionDto;
                                        }
                                    ).__sourceSection && (
                                        <div className={styles['section-editor']}>
                                            {renderSectionEditor(
                                                (
                                                    section as CreateHippotherapyProgramSectionLocalizationDto & {
                                                        __sourceSection?: HippotherapyProgramSectionDto;
                                                    }
                                                ).__sourceSection!,
                                            )}
                                        </div>
                                    )}

                                    <div className={programFormStyles['sections-divider']} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </form>
        );
    },
);
