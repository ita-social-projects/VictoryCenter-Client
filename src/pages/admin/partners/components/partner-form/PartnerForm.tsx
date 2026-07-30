import React, { memo, useCallback } from 'react';
import { Image, ImageValues } from '@/types/common/image';
import { ImageInput } from '@/components/admin/image-input/ImageInput';
import { IconButton } from '@/components/admin/icon-button/IconButton';
import { InputError } from '@/components/admin/input-error/InputError';
import { TextAreaWithCharacterLimitGroup } from '@/components/admin/input-groups/text-area-with-character-limit-group/TextAreaWithCharacterLimitGroup';
import { PARTNER_VALIDATION_FUNCTIONS } from '@/validation/admin/partner-schema/partner-schema';
import { PARTNER_VALIDATION, PARTNERS_TEXT } from '@/const/admin/partners';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { DEFAULT_LOCALE } from '@/const/common/locales';
import { LocalizationLanguage } from '@/types/common/language';
import styles from './PartnerForm.module.scss';
import './PartnerForm.scss';
import { ACTION_ICONS } from '@/const/common/action-icons';

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
    language: LocalizationLanguage;
    translatedDescription?: string;
    disableStructuralActions?: boolean;
}

const PartnerFormComponent = ({
    values,
    errors,
    disabled,
    onValuesChange,
    onDelete,
    language,
    translatedDescription,
    disableStructuralActions = false,
}: PartnerFormProps) => {
    const isBaseLanguage = language.code === DEFAULT_LOCALE;
    const displayedDescription = isBaseLanguage ? values.description : (translatedDescription ?? '');
    const handleDescriptionChange = useCallback(
        (e: React.ChangeEvent<HTMLTextAreaElement>) => {
            if (!isBaseLanguage) return;
            const value = e.target.value;
            const error = PARTNER_VALIDATION_FUNCTIONS.validateDescription(value);
            onValuesChange({ ...values, description: value }, { ...errors, description: error });
        },
        [onValuesChange, values, errors, isBaseLanguage],
    );

    const handleImageChange = useCallback(
        (value: ImageValues | null) => {
            if (!isBaseLanguage) return;
            onValuesChange({ ...values, image: value, imageId: null }, { ...errors, image: undefined });
        },
        [onValuesChange, values, errors, isBaseLanguage],
    );

    const handleImageError = useCallback(
        (error: string | null) => {
            if (!isBaseLanguage) return;
            if (!error) {
                return;
            }
            onValuesChange({ ...values }, { ...errors, image: error });
        },
        [onValuesChange, values, errors, isBaseLanguage],
    );

    const handleDelete = useCallback(() => {
        onDelete(values.localId);
    }, [onDelete, values.localId]);

    const cardHtmlId = values.localId;

    return (
        <div className={styles.root} data-testid={`partner-form-${cardHtmlId}`}>
            <div className={styles.header}>
                <IconButton
                    type="button"
                    className={styles['delete-button']}
                    onClick={handleDelete}
                    data-testid={`partner-form-delete-button-${cardHtmlId}`}
                    DefaultIcon={ACTION_ICONS.delete.default}
                    FilledIcon={ACTION_ICONS.delete.hover}
                    disabled={disabled || disableStructuralActions}
                />
            </div>
            <div className={styles.content}>
                <div className={styles.image}>
                    <ImageInput
                        key={values.localId}
                        value={values.image}
                        id={`partner-form-image-${cardHtmlId}`}
                        name={`partner-form-image-${cardHtmlId}`}
                        onChange={handleImageChange}
                        setError={handleImageError}
                        disabled={disabled || !isBaseLanguage}
                        enableCrop={true}
                        cropWidth={PARTNER_VALIDATION.image.width}
                        cropHeight={PARTNER_VALIDATION.image.height}
                        minWidth={PARTNER_VALIDATION.image.width}
                        minHeight={PARTNER_VALIDATION.image.height}
                        label={PARTNERS_TEXT.PARTNER.IMAGE_LABEL}
                        subText={COMMON_TEXT_ADMIN.INPUT.getImageSizeSubText(
                            PARTNER_VALIDATION.image.height,
                            PARTNER_VALIDATION.image.width,
                        )}
                        style={{ width: '13rem', height: '13rem' }}
                    />
                    <div className={styles['image-error']}>
                        <InputError error={errors.image} />
                    </div>
                </div>

                <div className={styles.description}>
                    <TextAreaWithCharacterLimitGroup
                        label={PARTNERS_TEXT.PARTNER.DESCRIPTION_LABEL}
                        placeholder={PARTNERS_TEXT.PARTNER.DESCRIPTION_PLACEHOLDER}
                        value={displayedDescription}
                        error={errors.description}
                        onChange={handleDescriptionChange}
                        name={`partner-form-description-${cardHtmlId}`}
                        id={`partner-form-description-${cardHtmlId}`}
                        maxLength={PARTNER_VALIDATION.description.max}
                        isRequired={true}
                        disabled={disabled || !isBaseLanguage}
                        rows={3}
                    />
                </div>
            </div>
        </div>
    );
};

export const PartnerForm = memo(PartnerFormComponent);
