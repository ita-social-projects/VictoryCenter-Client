import { useCallback, useState } from 'react';
import cn from 'classnames';
import { InputWithCharacterLimitGroup } from '@/components/admin/input-groups/input-with-character-limit-group/InputWithCharacterLimitGroup';
import { ImageInput } from '@/components/admin/image-input/ImageInput';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { REPORTS_TEXT } from '@/const/admin/reports';
import { Image, ImageValues } from '@/types/common/image';
import styles from './ReportsMediaBlock.module.scss';
import { InputWithCharacterLimit } from '@/components/admin/input-with-character-limit/InputWithCharacterLimit';
import { InputError } from '@/components/admin/input-error/InputError';
import { REPORTS_MEDIA_SETTINGS_CHANGED_LIVES_VALIDATION_FUNCTIONS } from '@/validation/admin/reports-schema/reports-media-settings/reports-media-settings-schema';

export interface ReportsMediaBlockValues {
    title: string;
    totalAmount: number;
    image: Image | ImageValues | null;
    imageId: number | null;
}

export interface ReportsMediaBlockErrors {
    title?: string;
    totalAmount?: string;
    image?: string;
}

export interface ReportsMediaBlockProps {
    values: ReportsMediaBlockValues;
    errors: ReportsMediaBlockErrors;
    windowTitle: string;
    windowDescription: string;
    descriptionTitle: string;
    imageWidth: number;
    imageHeight: number;
    imageUrl: string;
    isEditing: boolean;
    isValueEditable: boolean;
    totalAmountMaxLength: number;
    onValuesChange: (values: ReportsMediaBlockValues, errors: ReportsMediaBlockErrors) => void;
}

export const ReportsMediaBlock = ({
    values,
    errors,
    windowTitle,
    windowDescription,
    descriptionTitle,
    imageWidth,
    imageHeight,
    imageUrl,
    isEditing,
    isValueEditable,
    totalAmountMaxLength,
    onValuesChange,
}: ReportsMediaBlockProps) => {
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

    const handleTotalAmountChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value;
            const error = REPORTS_MEDIA_SETTINGS_CHANGED_LIVES_VALIDATION_FUNCTIONS.validateChangedLives(Number(value));
            onValuesChange({ ...values, totalAmount: Number(value) }, { ...errors, totalAmount: error });
        },
        [onValuesChange, values, errors],
    );

    const handleTotalAmountBlur = useCallback(() => {
        const error = REPORTS_MEDIA_SETTINGS_CHANGED_LIVES_VALIDATION_FUNCTIONS.validateChangedLives(
            values.totalAmount,
        );
        onValuesChange({ ...values }, { ...errors, totalAmount: error });
    }, [onValuesChange, values, errors]);

    const handleTitleChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value;
            const error = REPORTS_MEDIA_SETTINGS_CHANGED_LIVES_VALIDATION_FUNCTIONS.validateTitle(value);
            onValuesChange({ ...values, title: value }, { ...errors, title: error });
        },
        [onValuesChange, values, errors],
    );

    const handleTitleBlur = useCallback(() => {
        const error = REPORTS_MEDIA_SETTINGS_CHANGED_LIVES_VALIDATION_FUNCTIONS.validateTitle(values.title);
        onValuesChange({ ...values }, { ...errors, title: error });
    }, [onValuesChange, values, errors]);

    return (
        <div className={cn(styles.root, { [styles['root--editing']]: isEditing })}>
            <div className={styles.content}>
                <div className={styles.inputs}>
                    <div className={styles.header}>
                        <div className={styles['title-wrapper']}>
                            <p className={styles.title}>{windowTitle}</p>
                            <p className={styles.description}>{windowDescription}</p>
                        </div>
                    </div>
                    <div className={styles.field1}>
                        <InputWithCharacterLimit
                            id={`${windowTitle}-title`}
                            name={`${windowTitle}-title`}
                            value={values.title}
                            onChange={handleTitleChange}
                            onBlur={handleTitleBlur}
                            maxLength={REPORTS_TEXT.FORM.MAX_LENGTH.TITLE}
                            disabled={!isEditing}
                        />
                        <InputError error={errors.title} />
                    </div>
                    <div className={styles.field2}>
                        <InputWithCharacterLimitGroup
                            label={descriptionTitle}
                            id={`${windowTitle}-value`}
                            name={`${windowTitle}-value`}
                            value={values.totalAmount.toString()}
                            onChange={handleTotalAmountChange}
                            onBlur={handleTotalAmountBlur}
                            maxLength={totalAmountMaxLength}
                            type="text"
                            disabled={!isEditing || !isValueEditable}
                            error={errors.totalAmount}
                        />
                    </div>
                </div>
                <div className={styles.image}>
                    <div className={styles['image-wrapper']}>
                        <ImageInput
                            variant="partnerBanner"
                            label={COMMON_TEXT_ADMIN.INPUT.ADD_FILE_HERE}
                            subText={COMMON_TEXT_ADMIN.INPUT.getImageSizeSubText(imageWidth, imageHeight)}
                            value={values.image}
                            onChange={handleImageChange}
                            setError={handleImageError}
                            disabled={!isEditing}
                            style={{
                                backgroundImage: `
                                linear-gradient(rgba(245, 245, 245, 0.85), rgba(245, 245, 245, 0.85)),
                                url(${imageUrl})
                              `,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                backgroundRepeat: 'no-repeat',
                            }}
                            cropHeight={imageHeight}
                            cropWidth={imageWidth}
                        />
                        <InputError error={errors.image} />
                    </div>
                </div>
            </div>
        </div>
    );
};
