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
import './AddFeedbackHistoryModal.scss';

export interface AddFeedbackHistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddHistory: (history: FeedbackHistoryDto) => void;
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

export const AddFeedbackHistoryModal = ({ isOpen, onClose, onAddHistory }: AddFeedbackHistoryModalProps) => {
    const client = useAdminClient();
    const [formState, setFormState] = useState<FormState>(defaultFormState);
    const [errors, setErrors] = useState<FormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [submitError, setSubmitError] = useState<string>('');
    const [showCloseConfirmModal, setShowCloseConfirmModal] = useState<boolean>(false);

    const resetForm = useCallback(() => {
        setFormState(defaultFormState);
        setErrors({});
        setSubmitError('');
        setShowCloseConfirmModal(false);
        setIsSubmitting(false);
    }, []);

    useEffect(() => {
        if (!isOpen) {
            resetForm();
        }
    }, [isOpen, resetForm]);

    const isDirty = useMemo(
        () => Boolean(formState.title.trim() || formState.story.trim() || formState.image),
        [formState.title, formState.story, formState.image],
    );

    const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setFormState((prev) => ({ ...prev, title: val }));
        setErrors((prev) => ({ ...prev, title: undefined }));
    }, []);

    const handleTitleBlur = useCallback(() => {
        const trimmed = formState.title.trim();
        if (!trimmed) {
            setErrors((prev) => ({ ...prev, title: FEEDBACK_HISTORY_VALIDATION.title.getRequiredError() }));
        } else if (trimmed.length > FEEDBACK_HISTORY_VALIDATION.title.max) {
            setErrors((prev) => ({ ...prev, title: FEEDBACK_HISTORY_VALIDATION.title.getMaxError() }));
        } else {
            setErrors((prev) => ({ ...prev, title: undefined }));
        }
    }, [formState.title]);

    const handleStoryChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const val = e.target.value;
        setFormState((prev) => ({ ...prev, story: val }));
        setErrors((prev) => ({ ...prev, story: undefined }));
    }, []);

    const handleStoryBlur = useCallback(() => {
        const trimmed = formState.story.trim();
        if (!trimmed) {
            setErrors((prev) => ({ ...prev, story: FEEDBACK_HISTORY_VALIDATION.story.getRequiredError() }));
        } else if (trimmed.length > FEEDBACK_HISTORY_VALIDATION.story.max) {
            setErrors((prev) => ({ ...prev, story: FEEDBACK_HISTORY_VALIDATION.story.getMaxError() }));
        } else {
            setErrors((prev) => ({ ...prev, story: undefined }));
        }
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
        const newErrors: FormErrors = {};
        const titleTrimmed = formState.title.trim();
        const storyTrimmed = formState.story.trim();

        if (!titleTrimmed) {
            newErrors.title = FEEDBACK_HISTORY_VALIDATION.title.getRequiredError();
        } else if (titleTrimmed.length > FEEDBACK_HISTORY_VALIDATION.title.max) {
            newErrors.title = FEEDBACK_HISTORY_VALIDATION.title.getMaxError();
        }

        if (!storyTrimmed) {
            newErrors.story = FEEDBACK_HISTORY_VALIDATION.story.getRequiredError();
        } else if (storyTrimmed.length > FEEDBACK_HISTORY_VALIDATION.story.max) {
            newErrors.story = FEEDBACK_HISTORY_VALIDATION.story.getMaxError();
        }

        if (!formState.image) {
            newErrors.image = FEEDBACK_HISTORY_VALIDATION.image.getRequiredError();
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [formState]);

    const isSubmitDisabled = useMemo(() => {
        const hasEmptyFields = !formState.title.trim() || !formState.story.trim() || !formState.image;
        const hasValidationErrors = Boolean(errors.title || errors.story || errors.image);
        return isSubmitting || hasEmptyFields || hasValidationErrors;
    }, [formState.title, formState.story, formState.image, errors, isSubmitting]);

    const handleSubmit = useCallback(async () => {
        if (isSubmitDisabled) return;

        const isValid = validateForm();
        if (!isValid) return;

        setIsSubmitting(true);
        setSubmitError('');

        try {
            let imageId: number | null = null;
            if (formState.image && 'base64' in formState.image) {
                const imageResult = await ImageApi.post(client, formState.image);
                imageId = imageResult.id;
            } else if (formState.image && 'id' in formState.image) {
                imageId = formState.image.id;
            }

            const newHistory = await FeedbackApi.createHistory(client, {
                title: formState.title.trim(),
                story: formState.story.trim(),
                imageId,
                status: VisibilityStatus.Published,
            });

            onAddHistory(newHistory);
            resetForm();
            onClose();
        } catch {
            setSubmitError(FEEDBACK_TEXT.MESSAGE.FAIL_TO_CREATE_HISTORY);
        } finally {
            setIsSubmitting(false);
        }
    }, [isSubmitDisabled, validateForm, formState, client, onAddHistory, resetForm, onClose]);

    return (
        <>
            <Modal isOpen={isOpen} onClose={handleClose} className="add-feedback-history-modal">
                <Modal.Title>{FEEDBACK_TEXT.ADD_HISTORY_MODAL.TITLE}</Modal.Title>
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
                        onClick={handleSubmit}
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
        </>
    );
};

export const FeedbackHistoryModal = AddFeedbackHistoryModal;
