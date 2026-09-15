import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Modal } from '@/components/common/modal/Modal';
import { Button } from '@/components/admin/button/Button';
import { InputLabel } from '@/components/admin/input-label/InputLabel';
import { InputWithCharacterLimitGroup } from '@/components/admin/input-groups/input-with-character-limit-group/InputWithCharacterLimitGroup';
import { TextAreaWithCharacterLimitGroup } from '@/components/admin/input-groups/text-area-with-character-limit-group/TextAreaWithCharacterLimitGroup';
import { ImageInput } from '@/components/admin/image-input/ImageInput';
import { ConfirmationModal } from '@/components/admin/confirmation-modal/ConfirmationModal';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { FEEDBACK_TEXT, FEEDBACK_HISTORY_VALIDATION } from '@/const/admin/feedback';
import { FeedbackHistoryDto } from '@/types/admin/feedback';
import { Image, ImageValues } from '@/types/common/image';
import { VisibilityStatus } from '@/types/admin/common';
import { useAdminClient } from '@/hooks/admin/use-admin-client/useAdminClient';
import { FeedbackApi } from '@/services/api/admin/feedback/feedback-api';
import { ImageApi } from '@/services/api/admin/image/image-api';
import { IMAGE_VALIDATION } from '@/const/admin/image';
import { getNormalizedInputTextWhileTyping } from '@/utils/functions/formatters/text-formatters';
import './AddFeedbackHistoryModal.scss';

export interface AddFeedbackHistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddHistory?: (history: FeedbackHistoryDto) => void;
    onEditHistory?: (history: FeedbackHistoryDto) => void;
    initialData?: FeedbackHistoryDto;
}

interface FormState {
    title: string;
    story: string;
    image: Image | ImageValues | null;
}

interface FormErrors {
    title?: string;
    story?: string;
    image?: string;
}

const defaultFormState: FormState = {
    title: '',
    story: '',
    image: null,
};

const mapImageInputError = (error: string | null): string | undefined => {
    if (!error || error === IMAGE_VALIDATION.ImageDimensionsTooLargeError) {
        return undefined;
    }
    return error;
};

const validateTitle = (value: string): string | undefined => {
    const trimmed = value.trim();
    if (!trimmed) {
        return FEEDBACK_HISTORY_VALIDATION.title.getRequiredError();
    }
    if (trimmed.length < FEEDBACK_HISTORY_VALIDATION.title.min) {
        return FEEDBACK_HISTORY_VALIDATION.title.getMinError();
    }
    if (trimmed.length > FEEDBACK_HISTORY_VALIDATION.title.max) {
        return FEEDBACK_HISTORY_VALIDATION.title.getMaxError();
    }
    return undefined;
};

const validateStory = (value: string): string | undefined => {
    const trimmed = value.trim();
    if (!trimmed) {
        return FEEDBACK_HISTORY_VALIDATION.story.getRequiredError();
    }
    if (trimmed.length < FEEDBACK_HISTORY_VALIDATION.story.min) {
        return FEEDBACK_HISTORY_VALIDATION.story.getMinError();
    }
    if (trimmed.length > FEEDBACK_HISTORY_VALIDATION.story.max) {
        return FEEDBACK_HISTORY_VALIDATION.story.getMaxError();
    }
    return undefined;
};

export const AddFeedbackHistoryModal = ({
    isOpen,
    onClose,
    onAddHistory,
    onEditHistory,
    initialData,
}: AddFeedbackHistoryModalProps) => {
    const client = useAdminClient();
    const [formState, setFormState] = useState<FormState>(defaultFormState);
    const [errors, setErrors] = useState<FormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [submitError, setSubmitError] = useState<string>('');
    const [showCloseConfirmModal, setShowCloseConfirmModal] = useState<boolean>(false);
    const [showPublishConfirmModal, setShowPublishConfirmModal] = useState<boolean>(false);

    const resetForm = useCallback(() => {
        if (initialData) {
            setFormState({
                title: initialData.title,
                story: initialData.story,
                image: initialData.image,
            });
        } else {
            setFormState(defaultFormState);
        }
        setErrors({});
        setSubmitError('');
        setShowCloseConfirmModal(false);
        setShowPublishConfirmModal(false);
        setIsSubmitting(false);
    }, [initialData]);

    useEffect(() => {
        if (isOpen) {
            resetForm();
        } else {
            setErrors({});
            setSubmitError('');
            setShowCloseConfirmModal(false);
            setShowPublishConfirmModal(false);
            setIsSubmitting(false);
        }
    }, [isOpen, resetForm]);

    const isDirty = useMemo(() => {
        if (initialData) {
            const hasTitleChanged = formState.title.trim() !== initialData.title;
            const hasStoryChanged = formState.story.trim() !== initialData.story;
            const initialImageId = initialData.image && 'id' in initialData.image ? initialData.image.id : null;
            let currentImageId: number | null | undefined;
            if (formState.image && 'id' in formState.image) {
                currentImageId = formState.image.id;
            } else if (formState.image) {
                currentImageId = undefined; // it's a new image (base64)
            } else {
                currentImageId = null;
            }
            const hasImageChanged = currentImageId !== initialImageId;
            return hasTitleChanged || hasStoryChanged || hasImageChanged;
        }
        return Boolean(formState.title.trim() || formState.story.trim() || formState.image);
    }, [formState.title, formState.story, formState.image, initialData]);

    const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setFormState((prev) => ({ ...prev, title: val }));
        setErrors((prev) => ({ ...prev, title: validateTitle(val) }));
    }, []);

    const handleTitleBlur = useCallback(() => {
        setErrors((prev) => ({ ...prev, title: validateTitle(formState.title) }));
    }, [formState.title]);

    const handleStoryChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const val = e.target.value;
        setFormState((prev) => ({ ...prev, story: val }));
        setErrors((prev) => ({ ...prev, story: validateStory(val) }));
    }, []);

    const handleStoryBlur = useCallback(() => {
        setErrors((prev) => ({ ...prev, story: validateStory(formState.story) }));
    }, [formState.story]);

    const handleImageChange = useCallback((img: ImageValues | null) => {
        setFormState((prev) => ({ ...prev, image: img }));
        setErrors((prev) => ({ ...prev, image: undefined }));
    }, []);

    const handleImageError = useCallback((err: string | null) => {
        setErrors((prev) => ({
            ...prev,
            image: mapImageInputError(err),
        }));
    }, []);

    const handleClose = useCallback(() => {
        if (isSubmitting) return;

        if (isDirty) {
            setShowCloseConfirmModal(true);
            return;
        }

        resetForm();
        onClose();
    }, [isSubmitting, isDirty, resetForm, onClose]);

    const handleConfirmClose = useCallback(() => {
        setShowCloseConfirmModal(false);
        resetForm();
        onClose();
    }, [resetForm, onClose]);

    const handleCancelClose = useCallback(() => {
        setShowCloseConfirmModal(false);
    }, []);

    const validateForm = useCallback((): boolean => {
        const newErrors: FormErrors = {
            title: validateTitle(formState.title),
            story: validateStory(formState.story),
            image: !formState.image ? FEEDBACK_HISTORY_VALIDATION.image.getRequiredError() : undefined,
        };

        setErrors(newErrors);
        return !newErrors.title && !newErrors.story && !newErrors.image;
    }, [formState]);

    const isSubmitDisabled = useMemo(() => {
        const titleTrimmed = formState.title.trim();
        const storyTrimmed = formState.story.trim();
        const hasEmptyFields = !titleTrimmed || !storyTrimmed || !formState.image;
        const hasInvalidLength =
            titleTrimmed.length < FEEDBACK_HISTORY_VALIDATION.title.min ||
            storyTrimmed.length < FEEDBACK_HISTORY_VALIDATION.story.min;
        const hasValidationErrors = Boolean(errors.title || errors.story || errors.image);

        if (initialData) {
            return isSubmitting || hasEmptyFields || hasInvalidLength || hasValidationErrors || !isDirty;
        }

        return isSubmitting || hasEmptyFields || hasInvalidLength || hasValidationErrors;
    }, [formState.title, formState.story, formState.image, errors, isSubmitting, initialData, isDirty]);

    const executeSubmit = useCallback(async () => {
        setIsSubmitting(true);
        setSubmitError('');
        setShowPublishConfirmModal(false);

        try {
            let imageId: number | null = null;
            if (formState.image && 'base64' in formState.image) {
                const imageResult = await ImageApi.post(client, formState.image);
                imageId = imageResult.id;
            } else if (formState.image && 'id' in formState.image) {
                imageId = formState.image.id;
            }

            if (initialData) {
                const updatedHistory = await FeedbackApi.updateHistory(client, initialData.id, {
                    title: formState.title.trim(),
                    story: formState.story.trim(),
                    imageId,
                    status: VisibilityStatus.Published,
                });
                onEditHistory?.(updatedHistory);
            } else {
                const newHistory = await FeedbackApi.createHistory(client, {
                    title: formState.title.trim(),
                    story: formState.story.trim(),
                    imageId,
                    status: VisibilityStatus.Published,
                });
                onAddHistory?.(newHistory);
            }

            onClose();
        } catch {
            setSubmitError(
                initialData ? FEEDBACK_TEXT.MESSAGE.FAIL_TO_EDIT_HISTORY : FEEDBACK_TEXT.MESSAGE.FAIL_TO_CREATE_HISTORY,
            );
        } finally {
            setIsSubmitting(false);
        }
    }, [formState, client, initialData, onAddHistory, onEditHistory, onClose]);

    const handlePreSubmit = useCallback(() => {
        if (isSubmitDisabled) return;

        const isValid = validateForm();
        if (!isValid) return;

        if (initialData) {
            setShowPublishConfirmModal(true);
        } else {
            executeSubmit();
        }
    }, [isSubmitDisabled, validateForm, initialData, executeSubmit]);

    return (
        <>
            <Modal isOpen={isOpen} onClose={handleClose} className="add-feedback-history-modal">
                <Modal.Title>
                    {initialData ? FEEDBACK_TEXT.EDIT_HISTORY_MODAL.TITLE : FEEDBACK_TEXT.ADD_HISTORY_MODAL.TITLE}
                </Modal.Title>
                <Modal.Content>
                    <form onSubmit={(e) => e.preventDefault()} className="add-feedback-history-modal-form" noValidate>
                        <div className="form-group">
                            <InputWithCharacterLimitGroup
                                id="history-title"
                                name="title"
                                label={FEEDBACK_TEXT.ADD_HISTORY_MODAL.LABEL.TITLE}
                                value={formState.title}
                                onChange={handleTitleChange}
                                onBlur={handleTitleBlur}
                                maxLength={FEEDBACK_HISTORY_VALIDATION.title.max}
                                isRequired
                                showCounterBelow
                                maxLimitWarning={FEEDBACK_HISTORY_VALIDATION.title.getMaxError()}
                                error={errors.title}
                                disabled={isSubmitting}
                                normalizeValue={getNormalizedInputTextWhileTyping}
                            />
                        </div>

                        <div className="form-group">
                            <TextAreaWithCharacterLimitGroup
                                id="history-story"
                                name="story"
                                label={FEEDBACK_TEXT.ADD_HISTORY_MODAL.LABEL.STORY}
                                value={formState.story}
                                onChange={handleStoryChange}
                                onBlur={handleStoryBlur}
                                maxLength={FEEDBACK_HISTORY_VALIDATION.story.max}
                                isRequired
                                maxLimitWarning={FEEDBACK_HISTORY_VALIDATION.story.getMaxError()}
                                rows={5}
                                error={errors.story}
                                disabled={isSubmitting}
                                normalizeValue={getNormalizedInputTextWhileTyping}
                            />
                        </div>

                        <div className="form-group">
                            <InputLabel
                                htmlFor="history-image"
                                text={FEEDBACK_TEXT.ADD_HISTORY_MODAL.LABEL.PHOTO}
                                isRequired
                            />
                            <ImageInput
                                id="history-image"
                                name="image"
                                value={formState.image}
                                onChange={handleImageChange}
                                setError={handleImageError}
                                label={FEEDBACK_TEXT.ADD_HISTORY_MODAL.PLACEHOLDER.PHOTO_LABEL}
                                subText={FEEDBACK_TEXT.ADD_HISTORY_MODAL.PLACEHOLDER.PHOTO_SUBTEXT}
                                cropWidth={FEEDBACK_HISTORY_VALIDATION.image.cropWidth}
                                cropHeight={FEEDBACK_HISTORY_VALIDATION.image.cropHeight}
                                minWidth={FEEDBACK_HISTORY_VALIDATION.image.minWidth}
                                minHeight={FEEDBACK_HISTORY_VALIDATION.image.minHeight}
                                enableCrop
                                disabled={isSubmitting}
                            />
                            {errors.image && <span className="error">{errors.image}</span>}
                        </div>

                        {submitError && <div className="add-feedback-history-modal-error-container">{submitError}</div>}
                    </form>
                </Modal.Content>
                <Modal.Actions>
                    <Button
                        type="button"
                        buttonStyle="primary"
                        onClick={handlePreSubmit}
                        disabled={isSubmitDisabled}
                        className="add-feedback-history-modal-submit-button"
                    >
                        {COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_PUBLISHED}
                    </Button>
                </Modal.Actions>
            </Modal>

            <ConfirmationModal
                isOpen={showCloseConfirmModal}
                title={COMMON_TEXT_ADMIN.QUESTION.CHANGES_WILL_BE_LOST_WISH_TO_CONTINUE}
                confirmText={COMMON_TEXT_ADMIN.BUTTON.YES}
                cancelText={COMMON_TEXT_ADMIN.BUTTON.NO}
                onConfirm={handleConfirmClose}
                onCancel={handleCancelClose}
                onClose={handleCancelClose}
            />

            <ConfirmationModal
                isOpen={showPublishConfirmModal}
                title="Опублікувати зміни?"
                confirmText={COMMON_TEXT_ADMIN.BUTTON.YES}
                cancelText={COMMON_TEXT_ADMIN.BUTTON.NO}
                onConfirm={executeSubmit}
                onCancel={() => setShowPublishConfirmModal(false)}
                onClose={() => setShowPublishConfirmModal(false)}
            />
        </>
    );
};

export const FeedbackHistoryModal = AddFeedbackHistoryModal;
