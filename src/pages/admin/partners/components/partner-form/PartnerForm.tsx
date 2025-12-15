import React, { memo, useCallback } from 'react';
import { Image, ImageValues } from '@/types/common/image';
import { ImageInput } from '@/components/admin/image-input/ImageInput';
import { InputError } from '@/components/admin/input-error/InputError';
import { TextAreaWithCharacterLimitGroup } from '@/components/admin/input-groups/text-area-with-character-limit-group/TextAreaWithCharacterLimitGroup';
import { PARTNER_VALIDATION_FUNCTIONS } from '@/validation/admin/partner-schema/partner-schema';
import { PARTNER_VALIDATION, PARTNERS_TEXT } from '@/const/admin/partners';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import styles from './PartnerForm.module.scss';
import './PartnerForm.scss';

export interface PartnerFormValues {
    localId: string;
    partnerId: number | null;
    description: string;
    image: ImageValues | Image | null;
    imageId: number | null;
}

export interface PartnerFormErrors {
    description?: string;
    image?: string;
}

export interface PartnerFormProps {
    values: PartnerFormValues;
    errors: PartnerFormErrors;
    disabled: boolean;
    onValuesChange: (values: PartnerFormValues, errors: PartnerFormErrors) => void;
    onDelete: (localId: string) => void;
}

const PartnerFormComponent = ({ values, errors, disabled, onValuesChange, onDelete }: PartnerFormProps) => {
    const handleDescriptionChange = useCallback(
        (e: React.ChangeEvent<HTMLTextAreaElement>) => {
            const value = e.target.value;
            const error = PARTNER_VALIDATION_FUNCTIONS.validateDescription(value);
            onValuesChange({ ...values, description: value }, { ...errors, description: error });
        },
        [onValuesChange, values, errors],
    );

    const handleImageChange = useCallback(
        (value: ImageValues | null) => {
            onValuesChange({ ...values, image: value, imageId: value ? values.imageId : null }, { ...errors });
        },
        [onValuesChange, values, errors],
    );

    const handleImageError = useCallback(
        (error: string | null) => {
            onValuesChange({ ...values }, { ...errors, image: error ? error : undefined });
        },
        [onValuesChange, values, errors],
    );

    const handleDelete = useCallback(() => {
        onDelete(values.localId);
    }, [onDelete, values.localId]);

    const cardHtmlId = values.localId;

    return (
        <div className={styles.root} data-testid={`partner-form-${cardHtmlId}`}>
            <div className={styles.header}>
                <button
                    type="button"
                    className={styles['delete-button']}
                    onClick={handleDelete}
                    data-testid={`partner-form-delete-button-${cardHtmlId}`}
                />
            </div>
            <div className={styles.content}>
                <div className={styles.image}>
                    <ImageInput
                        value={values.image}
                        id={`partner-form-image-${cardHtmlId}`}
                        name={`partner-form-image-${cardHtmlId}`}
                        onChange={handleImageChange}
                        setError={handleImageError}
                        disabled={disabled}
                        label={PARTNERS_TEXT.PARTNER.IMAGE_LABEL}
                        subText={COMMON_TEXT_ADMIN.INPUT.getImageSizeSubText(
                            PARTNER_VALIDATION.image.height,
                            PARTNER_VALIDATION.image.width,
                        )}
                    />
                    <InputError error={errors.image} />
                </div>

                <div className={styles.description}>
                    <TextAreaWithCharacterLimitGroup
                        label={PARTNERS_TEXT.PARTNER.DESCRIPTION_LABEL}
                        placeholder={PARTNERS_TEXT.PARTNER.DESCRIPTION_PLACEHOLDER}
                        value={values.description}
                        error={errors.description}
                        onChange={handleDescriptionChange}
                        name={`partner-form-description-${cardHtmlId}`}
                        id={`partner-form-description-${cardHtmlId}`}
                        maxLength={PARTNER_VALIDATION.description.max}
                        isRequired={true}
                        disabled={disabled}
                        rows={3}
                    />
                </div>
            </div>
        </div>
    );
};

export const PartnerForm = memo(PartnerFormComponent);
