import React, { useCallback, useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { Modal } from '@/components/common/modal/Modal';
import { InputWithCharacterLimitGroup } from '@/components/admin/input-groups/input-with-character-limit-group/InputWithCharacterLimitGroup';
import { TextAreaWithCharacterLimitGroup } from '@/components/admin/input-groups/text-area-with-character-limit-group/TextAreaWithCharacterLimitGroup';
import { Button } from '@/components/admin/button/Button';
import { ConfirmationModal } from '@/components/admin/confirmation-modal/ConfirmationModal';
import { ImageInput } from '@/components/admin/image-input/ImageInput';
import { InputError } from '@/components/admin/input-error/InputError';
import { InputLabel } from '@/components/admin/input-label/InputLabel';
import { EventCategoryDto } from '@/types/admin/event-category';
import { EventValidationSchema, EventFormValues } from '@/validation/admin/event-schema/event-schema';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { EVENTS_TEXT, EVENT_VALIDATION } from '@/const/admin/events';
import { IMAGE_VALIDATION as BASE_IMAGE_VALIDATION } from '@/const/admin/image';
import {
    getNormalizedInputText,
    getNormalizedInputTextWhileTyping,
} from '@/utils/functions/formatters/text-formatters';
import styles from './EventModal.module.scss';

export type EventModalProps = {
    isOpen: boolean;
    onClose: () => void;
    currentCategory: EventCategoryDto | null;
};

const defaultFormState: EventFormValues = {
    title: '',
    description: '',
    additionalDescription: '',
    publishDate: null,
    image: null,
    linkUkr: '',
    linkEng: '',
};

const mapEventImageError = (error: string | null): string | undefined => {
    if (!error) return undefined;

    if (error === BASE_IMAGE_VALIDATION.getFormatError()) {
        return EVENT_VALIDATION.image.getFormatError();
    }

    if (error === BASE_IMAGE_VALIDATION.getSizeError(EVENT_VALIDATION.image.maxSizeMB)) {
        return EVENT_VALIDATION.image.getSizeError(EVENT_VALIDATION.image.maxSizeMB);
    }

    if (error === BASE_IMAGE_VALIDATION.ImageDimensionsTooSmallError) {
        return EVENT_VALIDATION.image.getDimensionTooSmallError
            ? EVENT_VALIDATION.image.getDimensionTooSmallError()
            : error;
    }

    return error;
};

export const EventModal = (props: EventModalProps) => {
    const { isOpen, onClose, currentCategory } = props;

    const [showCloseConfirmModal, setShowCloseConfirmModal] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);

    const {
        control,
        formState: { errors, isDirty },
        reset,
        setError,
        clearErrors,
    } = useForm<EventFormValues>({
        resolver: yupResolver(EventValidationSchema as Yup.ObjectSchema<EventFormValues>),
        defaultValues: defaultFormState,
        mode: 'onTouched',
        context: { isPublishing },
    });

    const handleTextFieldChange = useCallback(
        (field: any) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            field.onChange(getNormalizedInputTextWhileTyping(e.target.value));
        },
        [],
    );

    const handleTextFieldBlur = useCallback(
        (field: any) => () => {
            if (field.value) {
                field.onChange(getNormalizedInputText(field.value));
            }
            field.onBlur();
        },
        [],
    );

    const handleImageError = useCallback(
        (error: string | null) => {
            const mappedError = mapEventImageError(error);

            if (mappedError) {
                setError('image', {
                    type: 'manual',
                    message: mappedError,
                });
            } else {
                clearErrors('image');
            }
        },
        [setError, clearErrors],
    );

    const handleClose = useCallback(() => {
        if (isDirty) {
            setShowCloseConfirmModal(true);
            return;
        }

        onClose();
    }, [isDirty, onClose]);

    const handleConfirmClose = useCallback(() => {
        setShowCloseConfirmModal(false);
        onClose();
    }, [onClose]);

    const handleCloseConfirmModalClose = useCallback(() => {
        setShowCloseConfirmModal(false);
    }, []);

    const handleSaveAsDraft = () => {
        setIsPublishing(false);
    };

    const handlePublish = () => {
        setIsPublishing(true);
    };

    useEffect(() => {
        if (isOpen) {
            return;
        }
        reset(defaultFormState);
        setShowCloseConfirmModal(false);
    }, [isOpen, reset]);

    return (
        <>
            <Modal isOpen={isOpen} onClose={handleClose} maxWidth="665px" className={styles['modal']}>
                <Modal.Title>
                    <h2 className={styles['modal-title']}>{EVENTS_TEXT.FORM.MODAL_TITLE}</h2>
                </Modal.Title>

                <Modal.Content>
                    <form onSubmit={(e) => e.preventDefault()} className={styles['container']}>
                        {currentCategory && <span className={styles['category-chip']}>{currentCategory.name}</span>}

                        <Controller
                            name="title"
                            control={control}
                            render={({ field }) => (
                                <InputWithCharacterLimitGroup
                                    name={field.name}
                                    value={field.value}
                                    onChange={handleTextFieldChange(field)}
                                    onBlur={handleTextFieldBlur(field)}
                                    label={EVENTS_TEXT.FORM.LABEL.TITLE}
                                    id="event-title"
                                    maxLength={EVENT_VALIDATION.title.max}
                                    error={errors.title?.message}
                                    isRequired
                                    showCounterBelow
                                />
                            )}
                        />

                        <Controller
                            name="description"
                            control={control}
                            render={({ field }) => (
                                <TextAreaWithCharacterLimitGroup
                                    name={field.name}
                                    value={field.value ?? ''}
                                    onChange={field.onChange}
                                    onBlur={handleTextFieldBlur(field)}
                                    label={EVENTS_TEXT.FORM.LABEL.DESCRIPTION}
                                    id="event-description"
                                    maxLength={EVENT_VALIDATION.description.max}
                                    error={errors.description?.message}
                                    isRequired
                                    rows={4}
                                    normalizeValue={getNormalizedInputTextWhileTyping}
                                />
                            )}
                        />

                        <div className={styles['two-column-container']}>
                            <div className={styles['left-column']}>
                                {/*date picker*/}
                                <div className={styles['date-placeholder']}></div>
                                <Controller
                                    name="image"
                                    control={control}
                                    render={({ field }) => (
                                        <div className={styles['image-section']}>
                                            <InputLabel
                                                htmlFor="event-image"
                                                text={EVENTS_TEXT.FORM.LABEL.IMAGE}
                                                isRequired
                                            />
                                            <ImageInput
                                                value={field.value ?? null}
                                                onChange={(image) => field.onChange(image)}
                                                setError={handleImageError}
                                                id="event-image"
                                                name="image"
                                                variant="event"
                                                cropWidth={EVENT_VALIDATION.image.cropWidth}
                                                cropHeight={EVENT_VALIDATION.image.cropHeight}
                                                minWidth={EVENT_VALIDATION.image.minWidth}
                                                minHeight={EVENT_VALIDATION.image.minHeight}
                                                maxSizeMB={EVENT_VALIDATION.image.maxSizeMB}
                                                label={COMMON_TEXT_ADMIN.INPUT.ADD_FILE_HERE}
                                                subText={COMMON_TEXT_ADMIN.INPUT.getImageSizeSubText(
                                                    EVENT_VALIDATION.image.cropHeight,
                                                    EVENT_VALIDATION.image.cropWidth,
                                                )}
                                            />
                                            <InputError error={errors.image?.message} />
                                        </div>
                                    )}
                                />
                            </div>

                            <div>
                                <Controller
                                    name="additionalDescription"
                                    control={control}
                                    render={({ field }) => (
                                        <TextAreaWithCharacterLimitGroup
                                            name={field.name}
                                            value={field.value ?? ''}
                                            onChange={field.onChange}
                                            onBlur={handleTextFieldBlur(field)}
                                            label={EVENTS_TEXT.FORM.LABEL.ADDITIONAL_DESCRIPTION}
                                            id="event-additional-description"
                                            maxLength={EVENT_VALIDATION.additionalDescription.max}
                                            error={errors.additionalDescription?.message}
                                            rows={2}
                                            normalizeValue={getNormalizedInputTextWhileTyping}
                                        />
                                    )}
                                />
                            </div>
                        </div>

                        <div className={styles['divider']} />

                        <h4 className={styles['link-section-title']}>{EVENTS_TEXT.FORM.LINKS_SECTION_TITLE}</h4>

                        <Controller
                            name="linkUkr"
                            control={control}
                            render={({ field }) => (
                                <InputWithCharacterLimitGroup
                                    name={field.name}
                                    value={field.value}
                                    onChange={handleTextFieldChange(field)}
                                    onBlur={handleTextFieldBlur(field)}
                                    label={EVENTS_TEXT.FORM.LABEL.LINK_UKR}
                                    id="event-link-ukr"
                                    maxLength={EVENT_VALIDATION.linkUkr.max}
                                    error={errors.linkUkr?.message}
                                    isRequired
                                    showCounter={false}
                                    className={styles['link-ukr']}
                                />
                            )}
                        />

                        <Controller
                            name="linkEng"
                            control={control}
                            render={({ field }) => (
                                <InputWithCharacterLimitGroup
                                    name={field.name}
                                    value={field.value ?? ''}
                                    onChange={handleTextFieldChange(field)}
                                    onBlur={handleTextFieldBlur(field)}
                                    label={EVENTS_TEXT.FORM.LABEL.LINK_ENG}
                                    id="event-link-eng"
                                    maxLength={EVENT_VALIDATION.linkEng.max}
                                    error={errors.linkEng?.message}
                                    showCounter={false}
                                    className={styles['link-eng']}
                                />
                            )}
                        />
                    </form>
                </Modal.Content>

                <Modal.Actions>
                    <div className={styles['buttons-wrapper']}>
                        <Button
                            type="button"
                            buttonStyle="secondary"
                            disabled={true}
                            className={styles['action-button']}
                            onClick={handleSaveAsDraft}
                        >
                            {COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_DRAFT}
                        </Button>
                        <Button
                            type="button"
                            buttonStyle="primary"
                            disabled={true}
                            className={styles['action-button']}
                            onClick={handlePublish}
                        >
                            {COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_PUBLISHED}
                        </Button>
                    </div>
                </Modal.Actions>
            </Modal>

            <ConfirmationModal
                isOpen={showCloseConfirmModal}
                title={COMMON_TEXT_ADMIN.QUESTION.CHANGES_WILL_BE_LOST_WISH_TO_CONTINUE}
                onClose={handleCloseConfirmModalClose}
                onCancel={handleCloseConfirmModalClose}
                onConfirm={handleConfirmClose}
            />
        </>
    );
};
