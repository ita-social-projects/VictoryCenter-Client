import React, { forwardRef, useCallback, useMemo } from 'react';
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
import { InputError } from '../../../../../components/admin/input-error/InputError';

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

        const { formState, setFormState, errors, setErrors, isSubmitting, isValid } = useFormManager<
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

        const handleDescriptionBlur = useCallback(() => {
            setErrors((prev) => ({
                ...prev,
                description: PARTNER_VALIDATION_FUNCTIONS.validateDescription(formState.description, false),
            }));
        }, [formState.description, setErrors]);

        const handleImageChange = useCallback(
            (value: ImageValues | null) => {
                setFormState((prev) => ({ ...prev, image: value }));
                setErrors((prev) => ({
                    ...prev,
                    image: PARTNER_VALIDATION_FUNCTIONS.validateImage(value, false),
                }));
            },
            [setFormState, setErrors],
        );

        const handleImageBlur = useCallback(() => {
            setErrors((prev) => ({
                ...prev,
                image: PARTNER_VALIDATION_FUNCTIONS.validateImage(formState.image, false),
            }));
        }, [formState.image, setErrors]);

        const handlePublish = useCallback(() => {
            if (!formDisabled && !isSubmitting) {
                handleSubmit(formState, VisibilityStatus.Published);
            }
        }, [formState, formDisabled, isSubmitting, handleSubmit]);

        return (
            <div className="partner-banner-form">
                <div className="partner-banner-form__container">
                    <div className="image-wrapper">
                        <ImageInput
                            value={formState.image}
                            onChange={handleImageChange}
                            onBlur={handleImageBlur}
                            disabled={formDisabled || isSubmitting}
                            id="partner-image"
                            name="partner-image"
                        />
                        {errors.image && <InputError error={errors.image} />}
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
                                disabled={formDisabled || isSubmitting}
                            />
                            {errors.title && (
                                <div className="title-error inp1">
                                    <InputError error={errors.title} />
                                </div>
                            )}
                        </div>

                        <div className="form-group inp2">
                            <InputLabel htmlFor="description" text={PARTNERS_TEXT.FORM.LABEL.DESCRIPTION} />
                            <TextAreaWithCharacterLimit
                                value={formState.description}
                                onChange={handleDescriptionChange}
                                onBlur={handleDescriptionBlur}
                                id="description"
                                name="description"
                                disabled={formDisabled || isSubmitting}
                                maxLength={PARTNER_VALIDATION.description.max}
                                rows={2}
                            />
                            {errors.description && (
                                <div className="description-error inp2">
                                    <InputError error={errors.description} />
                                </div>
                            )}
                        </div>

                        <button
                            type="button"
                            className="partner-banner-form__submit-btn"
                            onClick={handlePublish}
                            disabled={formDisabled || isSubmitting || !isValid(true)}
                        >
                            {PARTNERS_TEXT.BUTTON.PUBLISH}
                        </button>
                    </div>
                </div>
            </div>
        );
    },
);
