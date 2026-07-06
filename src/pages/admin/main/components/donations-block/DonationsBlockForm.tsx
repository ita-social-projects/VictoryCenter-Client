import DefaultPlaceholder from '@/assets/images/man-facing-horse-forehead.webp';
import { Button } from '@/components/admin/button/Button';
import { RichTextInputGroup } from '@/components/admin/input-groups/rich-text-input-group/RichTextInputGroup';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { MAIN_PAGE_TEXT, MAIN_PAGE_VALIDATION } from '@/const/admin/main-page';
import { ImageUploadForm } from '@/pages/admin/main/components/common/image-upload-form/ImageUploadForm';
import { MainPageFormValues } from '@/types/admin/main-page';
import { useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import styles from './DonationsBlockForm.module.scss';

const IMAGE_CONFIG = {
    cropWidth: 1440,
    cropHeight: 720,
    minWidth: 1440,
    minHeight: 720,
    maxSizeMB: 5,
    label: 'Додайте файл сюди',
    subText: 'Розмір: 1440x720',
    style: {
        width: '100%',
        aspectRatio: '1440 / 720',
        backgroundImage: `linear-gradient(rgba(245, 245, 245, 0.85), rgba(245, 245, 245, 0.85)), url(${DefaultPlaceholder})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
    },
};

interface DonationsBlockFormProps {
    isPublishDisabled: boolean;
    onPublish: () => void;
    isReadOnly?: boolean;
}

const useDonationsFormState = () => {
    const context = useFormContext<MainPageFormValues>();
    const [imgError, setImgError] = useState<string | null>(null);

    return {
        formControl: context.control,
        formErrors: context.formState.errors,
        imgError,
        setImgError,
    };
};

export const DonationsBlockForm = ({ isPublishDisabled, onPublish, isReadOnly = false }: DonationsBlockFormProps) => {
    const { formControl, formErrors, imgError, setImgError } = useDonationsFormState();

    const titleField = isReadOnly ? 'donationsTitleEn' : 'donationsTitleUa';
    const descriptionField = isReadOnly ? 'donationsDescriptionEn' : 'donationsDescriptionUa';

    const renderActions = () => {
        if (isReadOnly) return null;
        return (
            <div className={styles.actions}>
                <Button
                    type="button"
                    buttonStyle="primary"
                    disabled={isPublishDisabled || !!imgError}
                    className={styles['publish-button']}
                    onClick={onPublish}
                >
                    {MAIN_PAGE_TEXT.BUTTONS.PUBLISH}
                </Button>
            </div>
        );
    };

    return (
        <div className={styles.form}>
            <div className={styles.content}>
                <ImageUploadForm
                    control={formControl as any}
                    errors={formErrors}
                    imageError={imgError}
                    setImageError={setImgError}
                    imageConfig={IMAGE_CONFIG}
                    variant="whoWeAre"
                    name="donationsImage"
                    disabled={isReadOnly}
                />

                <div className={styles['text-section']}>
                    <Controller
                        name={titleField}
                        control={formControl}
                        render={({ field: { onChange, value, onBlur } }) => (
                            <RichTextInputGroup
                                id="donations-block-title"
                                name={COMMON_TEXT_ADMIN.TYPE.TITLE}
                                label={MAIN_PAGE_TEXT.BLOCKS.DONATIONS.TITLE_LABEL}
                                value={value}
                                onChange={onChange}
                                onBlur={onBlur}
                                error={isReadOnly ? undefined : formErrors.donationsTitleUa?.message}
                                maxLength={MAIN_PAGE_VALIDATION.donationsBlock.title.max}
                                isRequired={true}
                                disabled={isReadOnly}
                            />
                        )}
                    />

                    <Controller
                        name={descriptionField}
                        control={formControl}
                        render={({ field: { onChange, value, onBlur } }) => (
                            <RichTextInputGroup
                                id="donations-block-description"
                                name={COMMON_TEXT_ADMIN.TYPE.DESCRIPTION}
                                label={MAIN_PAGE_TEXT.BLOCKS.DONATIONS.DESCRIPTION_LABEL}
                                value={value}
                                onChange={onChange}
                                onBlur={onBlur}
                                error={isReadOnly ? undefined : formErrors.donationsDescriptionUa?.message}
                                maxLength={MAIN_PAGE_VALIDATION.donationsBlock.description.max}
                                isRequired={true}
                                className={styles['rich-text-custom']}
                                disabled={isReadOnly}
                            />
                        )}
                    />
                </div>
            </div>

            {renderActions()}
        </div>
    );
};
