import React, { forwardRef, useCallback, useMemo, useState } from 'react';
import { ReactComponent as UploadImage } from '../../../../../assets/icons/cloud-with-down-arrow.svg';
import { ImageValues, Image } from '../../../../../types/common/image';
import './PartnerBannerForm.scss';
import { useFormManager } from '../../../../../hooks/admin/use-form-manager/useFormManager';
import { PARTNER_VALIDATION_FUNCTIONS } from '../../../../../validation/admin/partner-schema/partner-schema';
import { VisibilityStatus } from '../../../../../types/admin/common';
import { InputLabel } from '../../../../../components/admin/input-label/InputLabel';
import { InputWithCharacterLimit } from '../../../../../components/admin/input-with-character-limit/InputWithCharacterLimit';
import { PARTNER_VALIDATION, PARTNERS_TEXT } from '../../../../../const/admin/partners';
import { ImageInput } from '../../../../../components/admin/image-input/ImageInput';
import { TextAreaWithCharacterLimit } from '../../../../../components/admin/textarea-with-character-limit/TextAreaWithCharacterLimit';

export interface PartnerBannerFormValues {
    title: string;
    description: string;
    image: ImageValues | Image | null;
    imageId: number | null;
}

export interface PartnerBannerFormErrorState {
    title?: string;
    description?: string;
    image?: string;
    [key: string]: string | undefined;
}

export interface PartnerBannerFormRef {
    submit: (isPublishing: boolean) => void;
    isValid: (isPublishing?: boolean) => boolean;
    isDirty: () => boolean;
}

export interface PartnerBannerFormProps {
    onSubmit: (data: PartnerBannerFormValues, isPublishing: boolean) => void;
    initialData?: PartnerBannerFormValues | null;
    formDisabled?: boolean;
    onValidationChange?: (isValid: boolean) => void;
}

const validateForm = (formState: PartnerBannerFormValues, isPublishing: boolean): PartnerBannerFormErrorState => {
    return {
        title: PARTNER_VALIDATION_FUNCTIONS.validateTitle(formState.title, isPublishing),
        description: PARTNER_VALIDATION_FUNCTIONS.validateDescription(formState.description, isPublishing),
        image: PARTNER_VALIDATION_FUNCTIONS.validateImage(formState.image, isPublishing),
    };
};

export const PartnerBannerForm = forwardRef<PartnerBannerFormRef, PartnerBannerFormProps>(
    ({ initialData = null, onSubmit, formDisabled, onValidationChange }: PartnerBannerFormProps, ref) => {
        const defaultFormState = useMemo<PartnerBannerFormValues>(
            () => ({
                title: '',
                description: '',
                imageId: null,
                image: null,
            }),
            [],
        );

        const handleSubmit = useCallback(
            (data: PartnerBannerFormValues, status: VisibilityStatus) => {
                const isPublishing = status === VisibilityStatus.Published;
                onSubmit(data, isPublishing);
            },
            [onSubmit],
        );

        const { formState, setFormState, errors, setErrors, isSubmitting } = useFormManager<
            PartnerBannerFormValues,
            PartnerBannerFormErrorState
        >({
            defaultFormState,
            initialData,
            validateForm,
            onSubmit: handleSubmit,
            onValidationChange,
            ref,
        });

        const handleTitleChange = useCallback(
            (e: React.ChangeEvent<HTMLInputElement>) => {
                const newValue = e.target.value;
                setFormState((prev) => ({ ...prev, title: newValue }));
                setErrors((prev) => ({
                    ...prev,
                    title: PARTNER_VALIDATION_FUNCTIONS.validateTitle(newValue, false),
                }));
            },
            [setErrors, setFormState],
        );

        const handleTitleBlur = useCallback(() => {
            setErrors((prev) => ({
                ...prev,
                title: PARTNER_VALIDATION_FUNCTIONS.validateTitle(formState.title, false),
            }));
        }, [formState.title, setErrors]);

        const handleDescriptionChange = useCallback(
            (e: React.ChangeEvent<HTMLTextAreaElement>) => {
                const newValue = e.target.value;
                setFormState((prev) => ({ ...prev, description: newValue }));
                setErrors((prev) => ({
                    ...prev,
                    description: PARTNER_VALIDATION_FUNCTIONS.validateDescription(newValue, false),
                }));
            },
            [setFormState, setErrors],
        );

        const hadleDescriptionBlur = useCallback(() => {
            setErrors((prev) => ({
                ...prev,
                description: PARTNER_VALIDATION_FUNCTIONS.validateDescription(formState.description, false),
            }));
        }, [formState.description, setErrors]);

        const handleImgChange = useCallback(
            (file: ImageValues | Image | null) => {
                const error = PARTNER_VALIDATION_FUNCTIONS.validateImage(file, false);
                setErrors((prev) => ({
                    ...prev,
                    image: error,
                }));

                if (!error) {
                    setFormState((prev) => ({ ...prev, image: file }));
                }
            },
            [setFormState, setErrors],
        );

        const [isDragging, setIsDragging] = useState(false);

        const handleImageUpload = useCallback(
            (file: File) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    const result = reader.result as string;
                    const parts = result.split(',');
                    if (parts.length === 2) {
                        const imageData: ImageValues = {
                            base64: parts[1],
                            mimeType: file.type,
                            size: file.size,
                        };
                        handleImgChange(imageData);
                    }
                };
                reader.readAsDataURL(file);
            },
            [handleImgChange],
        );

        const handleFileInputChange = useCallback(
            (e: React.ChangeEvent<HTMLInputElement>) => {
                const file = e.target.files?.[0];
                if (file) {
                    handleImageUpload(file);
                }
            },
            [handleImageUpload],
        );

        const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragging(true);
        }, []);

        const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragging(false);
        }, []);

        const handleDrop = useCallback(
            (e: React.DragEvent<HTMLDivElement>) => {
                e.preventDefault();
                e.stopPropagation();
                setIsDragging(false);

                const file = e.dataTransfer.files?.[0];
                if (file && file.type.startsWith('image/')) {
                    handleImageUpload(file);
                }
            },
            [handleImageUpload],
        );

        const imagePreview = useMemo(() => {
            if (formState.image) {
                if ('url' in formState.image && formState.image.url) {
                    return formState.image.url;
                } else if ('base64' in formState.image) {
                    return `data:${formState.image.mimeType};base64,${formState.image.base64}`;
                }
            }
            return null;
        }, [formState.image]);

        return (
            <div className="partner-banner-form">
                <div className="partner-banner-form__container">
                    <div className="partner-banner-form__left">
                        <div
                            className={`partner-banner-form__upload-area ${isDragging ? 'partner-banner-form__upload-area--dragging' : ''} ${imagePreview ? 'partner-banner-form__upload-area--has-image' : ''}`}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                        >
                            <input
                                type="file"
                                id="partner-image-upload"
                                className="partner-banner-form__file-input"
                                accept="image/*"
                                onChange={handleFileInputChange}
                                disabled={formDisabled}
                            />

                            {imagePreview ? (
                                <>
                                    <img
                                        src={imagePreview}
                                        alt="Preview"
                                        className="partner-banner-form__preview-image"
                                    />
                                    <label
                                        htmlFor="partner-image-upload"
                                        className="partner-banner-form__upload-overlay partner-banner-form__upload-overlay--visible"
                                    >
                                        <UploadImage className="partner-banner-form__upload-icon" />
                                    </label>
                                </>
                            ) : (
                                <label htmlFor="partner-image-upload" className="partner-banner-form__upload-label">
                                    <UploadImage className="partner-banner-form__upload-icon" />
                                </label>
                            )}
                        </div>
                        {errors.image && <p className="error">{errors.image}</p>}
                    </div>

                    <div className="partner-banner-form__right">
                        <div className="form-group inp1">
                            <InputLabel htmlFor="title" text={PARTNERS_TEXT.FORM.LABEL.TITLE} />
                            <InputWithCharacterLimit
                                value={formState.title}
                                onChange={handleTitleChange}
                                onBlur={handleTitleBlur}
                                name="title"
                                id="title"
                                maxLength={PARTNER_VALIDATION.title.max}
                                disabled={formDisabled}
                            />
                            {errors.title && <p className="error title-error">{errors.title}</p>}
                        </div>

                        <div className="form-group inp2">
                            <InputLabel htmlFor="description" text={PARTNERS_TEXT.FORM.LABEL.DESCRIPTION} />
                            <TextAreaWithCharacterLimit
                                value={formState.description}
                                onChange={handleDescriptionChange}
                                onBlur={hadleDescriptionBlur}
                                id="description"
                                name="description"
                                disabled={formDisabled || isSubmitting}
                                maxLength={PARTNER_VALIDATION.description.max}
                                rows={2}
                            />
                            {errors.description && <p className="error desc-error">{errors.description}</p>}
                        </div>

                        <button
                            type="button"
                            className="partner-banner-form__submit-btn"
                            disabled={formDisabled || isSubmitting}
                        >
                            {PARTNERS_TEXT.BUTTON.PUBLISH}
                        </button>
                    </div>
                </div>
            </div>
        );
    },
);
