import { useCallback, useEffect, useMemo, useState } from 'react';
import { Modal } from '@/components/common/modal/Modal';
import { Button } from '@/components/admin/button/Button';
import { ConfirmationModal } from '@/components/admin/confirmation-modal/ConfirmationModal';
import { InputWithCharacterLimitGroup } from '@/components/admin/input-groups/input-with-character-limit-group/InputWithCharacterLimitGroup';
import { InputLabel } from '@/components/admin/input-label/InputLabel';
import { InputError } from '@/components/admin/input-error/InputError';
import { TextAreaWithCharacterLimit } from '@/components/admin/textarea-with-character-limit/TextAreaWithCharacterLimit';
import '@/components/admin/input-groups/input-group.scss';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { FEEDBACK_TEXT, VIDEO_REVIEW_VALIDATION } from '@/const/admin/feedback';
import { VIDEO_REVIEW_VALIDATION_FUNCTIONS } from '@/validation/admin/video-review-schema/video-review-schema';
import { useAdminClient } from '@/hooks/admin/use-admin-client/useAdminClient';
import { FeedbackApi } from '@/services/api/admin/feedback/feedback-api';
import { FeedbackVideoDto } from '@/types/admin/feedback';
import {
    getNormalizedInputText,
    getNormalizedInputTextWhileTyping,
} from '@/utils/functions/formatters/text-formatters';
import styles from './AddVideoReviewModal.module.scss';

export interface AddVideoReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit?: (data: { title: string; link: string }) => Promise<boolean>;
    initialData?: FeedbackVideoDto;
    onEditVideoReview?: (video: FeedbackVideoDto) => void;
    onEditError?: () => void;
}

export const AddVideoReviewModal = ({
    isOpen,
    onClose,
    onSubmit,
    initialData,
    onEditVideoReview,
    onEditError,
}: AddVideoReviewModalProps) => {
    const client = useAdminClient();
    const isEditMode = Boolean(initialData);

    const [title, setTitle] = useState('');
    const [link, setLink] = useState('');
    const [initialTitle, setInitialTitle] = useState('');
    const [initialLink, setInitialLink] = useState('');
    const [titleError, setTitleError] = useState<string | undefined>(undefined);
    const [linkError, setLinkError] = useState<string | undefined>(undefined);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showCloseConfirmModal, setShowCloseConfirmModal] = useState(false);
    const [showPublishConfirmModal, setShowPublishConfirmModal] = useState(false);

    useEffect(() => {
        if (!isOpen) return;

        const nextTitle = initialData?.title ?? '';
        const nextLink = initialData?.link ?? '';
        setTitle(nextTitle);
        setLink(nextLink);
        setInitialTitle(nextTitle);
        setInitialLink(nextLink);
        setTitleError(undefined);
        setLinkError(undefined);
    }, [isOpen, initialData]);

    const hasUnsavedInput = title.trim().length > 0 || link.trim().length > 0;
    const hasChanges = title.trim() !== initialTitle.trim() || link.trim() !== initialLink.trim();

    const isSubmitDisabled = useMemo(() => {
        const hasValidationError =
            VIDEO_REVIEW_VALIDATION_FUNCTIONS.validateTitle(title) !== undefined ||
            VIDEO_REVIEW_VALIDATION_FUNCTIONS.validateLink(link) !== undefined;

        if (isSubmitting || hasValidationError) return true;

        return isEditMode ? !hasChanges : false;
    }, [title, link, isSubmitting, isEditMode, hasChanges]);

    const resetForm = useCallback(() => {
        setTitle(initialData?.title ?? '');
        setLink(initialData?.link ?? '');
        setTitleError(undefined);
        setLinkError(undefined);
        setIsSubmitting(false);
    }, [initialData]);

    const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setTitle(e.target.value);
    }, []);

    const handleTitleBlur = useCallback(() => {
        setTitle((currentTitle) => {
            const normalized = getNormalizedInputText(currentTitle);
            setTitleError(VIDEO_REVIEW_VALIDATION_FUNCTIONS.validateTitle(normalized));
            return normalized;
        });
    }, []);

    const handleLinkChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setLink(e.target.value);
    }, []);

    const handleLinkBlur = useCallback(() => {
        setLink((currentLink) => {
            const normalized = getNormalizedInputText(currentLink);
            setLinkError(VIDEO_REVIEW_VALIDATION_FUNCTIONS.validateLink(normalized));
            return normalized;
        });
    }, []);

    const handleAddSubmit = useCallback(async () => {
        if (!onSubmit) return;

        setIsSubmitting(true);
        const success = await onSubmit({
            title: getNormalizedInputText(title),
            link: getNormalizedInputText(link),
        });

        if (success) {
            resetForm();
            onClose();
        } else {
            setIsSubmitting(false);
        }
    }, [title, link, onSubmit, resetForm, onClose]);

    const handleConfirmPublish = useCallback(async () => {
        if (!initialData || isSubmitting) return;

        setIsSubmitting(true);
        try {
            const updated = await FeedbackApi.updateVideo(client, initialData.id, {
                title: getNormalizedInputText(title),
                link: getNormalizedInputText(link),
                status: initialData.status,
            });
            setShowPublishConfirmModal(false);
            onEditVideoReview?.(updated);
            onClose();
        } catch {
            setShowPublishConfirmModal(false);
            onEditError?.();
        } finally {
            setIsSubmitting(false);
        }
    }, [initialData, isSubmitting, title, link, client, onEditVideoReview, onClose, onEditError]);

    const handlePublishClick = useCallback(() => {
        if (isEditMode) {
            setShowPublishConfirmModal(true);
            return;
        }
        handleAddSubmit();
    }, [isEditMode, handleAddSubmit]);

    const handleRequestClose = useCallback(() => {
        if (isSubmitting) return;

        if (hasUnsavedInput) {
            setShowCloseConfirmModal(true);
            return;
        }

        resetForm();
        onClose();
    }, [isSubmitting, hasUnsavedInput, onClose, resetForm]);

    const handleConfirmClose = useCallback(() => {
        setShowCloseConfirmModal(false);
        resetForm();
        onClose();
    }, [resetForm, onClose]);

    const handleCancelClose = useCallback(() => {
        setShowCloseConfirmModal(false);
    }, []);

    const handleCancelPublish = useCallback(() => {
        setShowPublishConfirmModal(false);
    }, []);

    return (
        <>
            <Modal isOpen={isOpen} onClose={handleRequestClose}>
                <Modal.Title>
                    {isEditMode
                        ? FEEDBACK_TEXT.EDIT_VIDEO_REVIEW_MODAL.TITLE
                        : FEEDBACK_TEXT.ADD_VIDEO_REVIEW_MODAL.TITLE}
                </Modal.Title>
                <Modal.Content>
                    <InputWithCharacterLimitGroup
                        isRequired
                        label={FEEDBACK_TEXT.ADD_VIDEO_REVIEW_MODAL.LABEL.TITLE}
                        value={title}
                        onChange={handleTitleChange}
                        onBlur={handleTitleBlur}
                        name="video-review-title"
                        id="video-review-title"
                        type="text"
                        maxLength={VIDEO_REVIEW_VALIDATION.title.max}
                        error={titleError}
                        disabled={isSubmitting}
                        showCounterBelow
                        normalizeValue={getNormalizedInputTextWhileTyping}
                    />

                    <div className="input-group">
                        <InputLabel
                            htmlFor="video-review-link"
                            text={FEEDBACK_TEXT.ADD_VIDEO_REVIEW_MODAL.LABEL.LINK}
                            isRequired
                        />
                        <TextAreaWithCharacterLimit
                            value={link}
                            onChange={handleLinkChange}
                            onBlur={handleLinkBlur}
                            name="video-review-link"
                            id="video-review-link"
                            maxLength={VIDEO_REVIEW_VALIDATION.link.max}
                            hasError={!!linkError}
                            disabled={isSubmitting}
                            rows={4}
                            autoGrow
                            normalizeValue={getNormalizedInputTextWhileTyping}
                        />
                        <InputError error={linkError} />
                    </div>
                </Modal.Content>

                <Modal.Actions>
                    <div className={styles.actions}>
                        <Button buttonStyle="primary" onClick={handlePublishClick} disabled={isSubmitDisabled}>
                            {COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_PUBLISHED}
                        </Button>
                    </div>
                </Modal.Actions>
            </Modal>

            <ConfirmationModal
                isOpen={showPublishConfirmModal}
                title={COMMON_TEXT_ADMIN.QUESTION.PUBLISH_CHANGES}
                confirmText={COMMON_TEXT_ADMIN.BUTTON.YES}
                cancelText={COMMON_TEXT_ADMIN.BUTTON.NO}
                isButtonsDisabled={isSubmitting}
                onConfirm={handleConfirmPublish}
                onCancel={handleCancelPublish}
                onClose={handleCancelPublish}
            />

            <ConfirmationModal
                isOpen={showCloseConfirmModal}
                title={COMMON_TEXT_ADMIN.QUESTION.CHANGES_WILL_BE_LOST_WISH_TO_CONTINUE}
                onClose={handleCancelClose}
                onCancel={handleCancelClose}
                onConfirm={handleConfirmClose}
            />
        </>
    );
};
