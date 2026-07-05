import DefaultPlaceholder from '@/assets/images/man-facing-horse-forehead.webp';
import { Button } from '@/components/admin/button/Button';
import { RichTextInputGroup } from '@/components/admin/input-groups/rich-text-input-group/RichTextInputGroup';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { MAIN_PAGE_TEXT, MAIN_PAGE_VALIDATION } from '@/const/admin/main-page';
import { ImageUploadForm } from '@/pages/admin/main/components/common/image-upload-form/ImageUploadForm';
import { MainPageFormValues } from '@/types/admin/main-page';
import { useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import styles from './TitleBlockForm.module.scss';

const IMAGE_CONFIG = {
    cropWidth: 1440,
    cropHeight: 860,
    minWidth: 1440,
    minHeight: 860,
    label: 'Додайте файл сюди',
    subText: 'Розмір: 1440x860',
    style: {
        width: '100%',
        aspectRatio: '1440 / 860',
        backgroundImage: `linear-gradient(rgba(245, 245, 245, 0.85), rgba(245, 245, 245, 0.85)), url(${DefaultPlaceholder})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
    },
};

interface TitleBlockFormProps {
    isPublishDisabled: boolean;
    onPublish: () => void;
    isReadOnly?: boolean;
}

export const TitleBlockForm = ({ isPublishDisabled, onPublish, isReadOnly = false }: TitleBlockFormProps) => {
    const [imageError, setImageError] = useState<string | null>(null);

    const {
        control,
        formState: { errors },
    } = useFormContext<MainPageFormValues>();

    const titleName = isReadOnly ? 'titleEn' : 'titleUa';
    const descriptionName = isReadOnly ? 'descriptionEn' : 'descriptionUa';

    return (
        <div className={styles.form}>
            <div className={styles.content}>
                <ImageUploadForm
                    control={control as any}
                    errors={errors}
                    imageError={imageError}
                    setImageError={setImageError}
                    imageConfig={IMAGE_CONFIG}
                    variant="whoWeAre"
                    name="image"
                    disabled={isReadOnly}
                />

                <div className={styles['text-section']}>
                    <Controller
                        name={titleName}
                        control={control}
                        render={({ field: { onChange, value, onBlur } }) => (
                            <RichTextInputGroup
                                id="title-block-title"
                                name={COMMON_TEXT_ADMIN.TYPE.TITLE}
                                label={MAIN_PAGE_TEXT.BLOCKS.TITLE.TITLE_LABEL}
                                value={value}
                                onChange={onChange}
                                onBlur={onBlur}
                                error={isReadOnly ? undefined : errors.titleUa?.message}
                                maxLength={MAIN_PAGE_VALIDATION.titleBlock.title.max}
                                isRequired={true}
                                disabled={isReadOnly}
                            />
                        )}
                    />

                    <Controller
                        name={descriptionName}
                        control={control}
                        render={({ field: { onChange, value, onBlur } }) => (
                            <RichTextInputGroup
                                id="title-block-description"
                                name={COMMON_TEXT_ADMIN.TYPE.DESCRIPTION}
                                label={MAIN_PAGE_TEXT.BLOCKS.TITLE.DESCRIPTION_LABEL}
                                value={value}
                                onChange={onChange}
                                onBlur={onBlur}
                                error={isReadOnly ? undefined : errors.descriptionUa?.message}
                                maxLength={MAIN_PAGE_VALIDATION.titleBlock.description.max}
                                isRequired={true}
                                className={styles['rich-text-custom']}
                                disabled={isReadOnly}
                            />
                        )}
                    />
                </div>
            </div>

            {!isReadOnly && (
                <div className={styles.actions}>
                    <Button
                        type="button"
                        buttonStyle="primary"
                        disabled={isPublishDisabled || !!imageError}
                        className={styles['publish-button']}
                        onClick={onPublish}
                    >
                        {MAIN_PAGE_TEXT.BUTTONS.PUBLISH}
                    </Button>
                </div>
            )}
        </div>
    );
};
