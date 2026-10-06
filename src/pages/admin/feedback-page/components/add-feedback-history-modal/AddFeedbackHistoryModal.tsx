import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
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
import { VisibilityStatus } from '@/types/admin/common';
import { useAdminClient } from '@/hooks/admin/use-admin-client/useAdminClient';
import { FeedbackApi } from '@/services/api/admin/feedback/feedback-api';
import { ImageApi } from '@/services/api/admin/image/image-api';
import { IMAGE_VALIDATION } from '@/const/admin/image';
import { getNormalizedInputTextWhileTyping } from '@/utils/functions/formatters/text-formatters';
import {
    FeedbackHistoryFormValues,
    FeedbackHistoryValidationSchema,
} from '@/validation/admin/feedback-history-schema/feedback-history-schema';
import styles from './AddFeedbackHistoryModal.module.scss';

export interface AddFeedbackHistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddHistory?: (history: FeedbackHistoryDto) => void;
    onEditHistory?: (history: FeedbackHistoryDto) => void;
    initialData?: FeedbackHistoryDto;
}

const mapImageInputError = (error: string | null): string | undefined => {
    if (!error || error === IMAGE_VALIDATION.ImageDimensionsTooLargeError) {
        return undefined;
    }
    return error;
};

export const AddFeedbackHistoryModal = ({
    isOpen,
    onClose,
    onAddHistory,
    onEditHistory,
    initialData,
}: AddFeedbackHistoryModalProps) => {
    const client = useAdminClient();
    const [submitError, setSubmitError] = useState<string>('');
    const [showCloseConfirmModal, setShowCloseConfirmModal] = useState<boolean>(false);
    const [showPublishConfirmModal, setShowPublishConfirmModal] = useState<boolean>(false);

    const {
        control,
        handleSubmit,
        reset,
        setError,
        clearErrors,
        formState: { errors, isDirty, isSubmitting, isValid },
    } = useForm<FeedbackHistoryFormValues>({
        resolver: yupResolver(FeedbackHistoryValidationSchema),
        defaultValues: {
            title: '',
            story: '',
            image: null,
        },
        mode: 'onChange',
    });

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                reset({
                    title: initialData.title,
                    story: initialData.story,
                    image: initialData.image,
                });
            } else {
                reset({ title: '', story: '', image: null });
            }
            setSubmitError('');
            setShowCloseConfirmModal(false);
            setShowPublishConfirmModal(false);
        } else {
            reset({ title: '', story: '', image: null });
            setSubmitError('');
            setShowCloseConfirmModal(false);
            setShowPublishConfirmModal(false);
        }
    }, [isOpen, initialData, reset]);

    const handleClose = () => {
        if (isSubmitting) return;

        if (isDirty) {
            setShowCloseConfirmModal(true);
            return;
        }

        onClose();
    };

    const handleConfirmClose = () => {
        setShowCloseConfirmModal(false);
        onClose();
    };

    const executeSubmit = async (data: FeedbackHistoryFormValues) => {
        setSubmitError('');
        setShowPublishConfirmModal(false);

        try {
            const initialImageId = initialData?.image && 'id' in initialData.image ? initialData.image.id : null;
            const { finalImageId } = await ImageApi.getUpdateImageId(client, data.image, initialImageId);

            if (initialData) {
                const updatedHistory = await FeedbackApi.updateHistory(client, initialData.id, {
                    title: data.title.trim(),
                    story: data.story.trim(),
                    imageId: finalImageId,
                    status: VisibilityStatus.Published,
                });
                onEditHistory?.(updatedHistory);
            } else {
                const newHistory = await FeedbackApi.createHistory(client, {
                    title: data.title.trim(),
                    story: data.story.trim(),
                    imageId: finalImageId,
                    status: VisibilityStatus.Published,
                });
                onAddHistory?.(newHistory);
            }

            onClose();
        } catch {
            setSubmitError(
                initialData ? FEEDBACK_TEXT.MESSAGE.FAIL_TO_EDIT_HISTORY : FEEDBACK_TEXT.MESSAGE.FAIL_TO_CREATE_HISTORY,
            );
        }
    };

    const handlePreSubmit = () => {
        if (!isValid || isSubmitting) return;

        setShowPublishConfirmModal(true);
    };

    return (
        <>
            <Modal
                isOpen={isOpen && !showPublishConfirmModal && !showCloseConfirmModal}
                onClose={handleClose}
                className={styles['add-feedback-history-modal']}
            >
                <Modal.Title>
                    {initialData ? FEEDBACK_TEXT.EDIT_HISTORY_MODAL.TITLE : FEEDBACK_TEXT.ADD_HISTORY_MODAL.TITLE}
                </Modal.Title>
                <Modal.Content>
                    <form
                        onSubmit={(e) => e.preventDefault()}
                        className={styles['add-feedback-history-modal-form']}
                        noValidate
                    >
                        <div className={styles['form-group']}>
                            <Controller
                                name="title"
                                control={control}
                                render={({ field }) => (
                                    <InputWithCharacterLimitGroup
                                        id="history-title"
                                        name={field.name}
                                        label={FEEDBACK_TEXT.ADD_HISTORY_MODAL.LABEL.TITLE}
                                        value={field.value}
                                        onChange={field.onChange}
                                        onBlur={field.onBlur}
                                        maxLength={FEEDBACK_HISTORY_VALIDATION.title.max}
                                        isRequired
                                        showCounterBelow
                                        maxLimitWarning={FEEDBACK_HISTORY_VALIDATION.title.getMaxError()}
                                        error={errors.title?.message}
                                        disabled={isSubmitting}
                                        normalizeValue={getNormalizedInputTextWhileTyping}
                                    />
                                )}
                            />
                        </div>

                        <div className={styles['form-group']}>
                            <Controller
                                name="story"
                                control={control}
                                render={({ field }) => (
                                    <TextAreaWithCharacterLimitGroup
                                        id="history-story"
                                        name={field.name}
                                        label={FEEDBACK_TEXT.ADD_HISTORY_MODAL.LABEL.STORY}
                                        value={field.value}
                                        onChange={field.onChange}
                                        onBlur={field.onBlur}
                                        maxLength={FEEDBACK_HISTORY_VALIDATION.story.max}
                                        isRequired
                                        maxLimitWarning={FEEDBACK_HISTORY_VALIDATION.story.getMaxError()}
                                        rows={5}
                                        error={errors.story?.message}
                                        disabled={isSubmitting}
                                        normalizeValue={getNormalizedInputTextWhileTyping}
                                    />
                                )}
                            />
                        </div>

                        <div className={styles['form-group']}>
                            <InputLabel
                                htmlFor="history-image"
                                text={FEEDBACK_TEXT.ADD_HISTORY_MODAL.LABEL.PHOTO}
                                isRequired
                            />
                            <Controller
                                name="image"
                                control={control}
                                render={({ field }) => (
                                    <ImageInput
                                        id="history-image"
                                        name={field.name}
                                        value={field.value}
                                        onChange={(img) => {
                                            field.onChange(img);
                                            clearErrors('image');
                                        }}
                                        setError={(err) => {
                                            const mapped = mapImageInputError(err);
                                            if (mapped) {
                                                setError('image', { type: 'manual', message: mapped });
                                            } else {
                                                clearErrors('image');
                                            }
                                        }}
                                        label={FEEDBACK_TEXT.ADD_HISTORY_MODAL.PLACEHOLDER.PHOTO_LABEL}
                                        subText={FEEDBACK_TEXT.ADD_HISTORY_MODAL.PLACEHOLDER.PHOTO_SUBTEXT}
                                        cropWidth={FEEDBACK_HISTORY_VALIDATION.image.cropWidth}
                                        cropHeight={FEEDBACK_HISTORY_VALIDATION.image.cropHeight}
                                        minWidth={FEEDBACK_HISTORY_VALIDATION.image.minWidth}
                                        minHeight={FEEDBACK_HISTORY_VALIDATION.image.minHeight}
                                        enableCrop
                                        disabled={isSubmitting}
                                    />
                                )}
                            />
                            {errors.image?.message && <span className={styles.error}>{errors.image.message}</span>}
                        </div>

                        {submitError && (
                            <div className={styles['add-feedback-history-modal-error-container']}>{submitError}</div>
                        )}
                    </form>
                </Modal.Content>
                <Modal.Actions>
                    <Button
                        type="button"
                        buttonStyle="primary"
                        onClick={handlePreSubmit}
                        disabled={!isValid || isSubmitting || (!!initialData && !isDirty)}
                        className={styles['add-feedback-history-modal-submit-button']}
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
                onCancel={() => setShowCloseConfirmModal(false)}
                onClose={() => setShowCloseConfirmModal(false)}
            />

            <ConfirmationModal
                isOpen={showPublishConfirmModal}
                title={initialData ? COMMON_TEXT_ADMIN.QUESTION.PUBLISH_CHANGES : FEEDBACK_TEXT.PUBLISH_MODAL.TITLE_NEW}
                confirmText={COMMON_TEXT_ADMIN.BUTTON.YES}
                cancelText={COMMON_TEXT_ADMIN.BUTTON.NO}
                onConfirm={handleSubmit(executeSubmit)}
                onCancel={() => setShowPublishConfirmModal(false)}
                onClose={() => setShowPublishConfirmModal(false)}
            />
        </>
    );
};

export const FeedbackHistoryModal = AddFeedbackHistoryModal;
