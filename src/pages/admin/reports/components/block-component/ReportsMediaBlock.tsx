import { Image, ImageValues } from '@/types/common/image';
import React, { useCallback } from 'react';
import styles from './ReportsMediaBlock.module.scss';
import { InputError } from '@/components/admin/input-error/InputError';
import { REPORTS_TEXT } from '@/const/admin/reports';
import { ImageInput } from '@/components/admin/image-input/ImageInput';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { TextAreaWithCharacterLimitGroup } from '@/components/admin/input-groups/text-area-with-character-limit-group/TextAreaWithCharacterLimitGroup';
import { getNormalizedInputText } from '@/utils/functions/formatters/text-formatters';
import './ReportsMediaBlock.scss';

export interface ReportsMediaBlockValues {
    title: string;
    titleEn: string;
    totalAmount: number | string;
    image: ImageValues | Image | null;
    imageId: number | null;
}

export interface ReportsMediaBlockProps {
    values: ReportsMediaBlockValues;
    titleError?: string;
    titleEnError?: string;
    totalAmountError?: string;
    imageError?: string;
    windowTitle: string;
    windowDescription: string;
    descriptionTitle: string;
    imageWidth: number;
    imageHeight: number;
    imageUrl: string;
    isValueEditable: boolean;
    totalAmountMaxLength: number;
    onTitleChange: (value: string) => void;
    onTitleBlur: (normalizedValue: string) => void;
    onTitleEnChange: (value: string) => void;
    onTitleEnBlur: (normalizedValue: string) => void;
    onTotalAmountChange: (value: string) => void;
    onImageChange: (value: ImageValues | null) => void;
    onImageError: (error: string | null) => void;
}

export const ReportsMediaBlock = ({
    values,
    titleError,
    titleEnError,
    totalAmountError,
    imageError,
    windowTitle,
    windowDescription,
    descriptionTitle,
    imageWidth,
    imageHeight,
    imageUrl,
    isValueEditable,
    totalAmountMaxLength,
    onTitleChange,
    onTitleBlur,
    onTitleEnChange,
    onTitleEnBlur,
    onTotalAmountChange,
    onImageChange,
    onImageError,
}: ReportsMediaBlockProps) => {
    const handleTitleChange = useCallback(
        (e: React.ChangeEvent<HTMLTextAreaElement>) => {
            onTitleChange(e.target.value);
        },
        [onTitleChange],
    );

    const handleTitleBlur = useCallback(
        (_e: React.FocusEvent<HTMLTextAreaElement>) => {
            const normalizedTitle = getNormalizedInputText(values.title);
            if (normalizedTitle !== values.title) {
                onTitleBlur(normalizedTitle);
            }
        },
        [onTitleBlur, values.title],
    );

    const handleTitleEnChange = useCallback(
        (e: React.ChangeEvent<HTMLTextAreaElement>) => {
            onTitleEnChange(e.target.value);
        },
        [onTitleEnChange],
    );

    const handleTitleEnBlur = useCallback(
        (_e: React.FocusEvent<HTMLTextAreaElement>) => {
            const normalizedTitle = getNormalizedInputText(values.titleEn);
            if (normalizedTitle !== values.titleEn) {
                onTitleEnBlur(normalizedTitle);
            }
        },
        [onTitleEnBlur, values.titleEn],
    );

    const handleTotalAmountChange = useCallback(
        (e: React.ChangeEvent<HTMLTextAreaElement>) => {
            onTotalAmountChange(e.target.value);
        },
        [onTotalAmountChange],
    );

    const handleImageChange = useCallback(
        (value: ImageValues | null) => {
            onImageChange(value);
        },
        [onImageChange],
    );

    const handleImageErrorInternal = useCallback(
        (error: string | null) => {
            if (!error) return;
            onImageError(error);
        },
        [onImageError],
    );

    return (
        <div className={styles.root}>
            <div className={styles.content}>
                <div className={styles.inputs}>
                    <div className={styles.header}>
                        <div className={styles['title-wrapper']}>
                            <p className={styles.title}>{windowTitle}</p>
                            <p className={styles.description}>{windowDescription}</p>
                        </div>
                    </div>

                    <div className={styles['title-input']}>
                        <TextAreaWithCharacterLimitGroup
                            label={REPORTS_TEXT.FORM.LABEL.TITLE}
                            id={`${windowTitle}-title`}
                            name={`${windowTitle}-title`}
                            value={values.title}
                            onChange={handleTitleChange}
                            onBlur={handleTitleBlur}
                            maxLength={REPORTS_TEXT.FORM.MAX_LENGTH.TITLE}
                            maxLimitWarning={COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMaxError(
                                REPORTS_TEXT.FORM.MAX_LENGTH.TITLE,
                            )}
                            error={titleError}
                            rows={1}
                            isRequired={true}
                            errorCounterContainerClassName={styles['error-counter']}
                        />
                    </div>

                    <div className={styles['title-input']}>
                        <TextAreaWithCharacterLimitGroup
                            label={REPORTS_TEXT.FORM.LABEL.TITLE_EN}
                            id={`${windowTitle}-title-en`}
                            name={`${windowTitle}-title-en`}
                            value={values.titleEn}
                            onChange={handleTitleEnChange}
                            onBlur={handleTitleEnBlur}
                            maxLength={REPORTS_TEXT.FORM.MAX_LENGTH.TITLE}
                            maxLimitWarning={COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMaxError(
                                REPORTS_TEXT.FORM.MAX_LENGTH.TITLE,
                            )}
                            error={titleEnError}
                            rows={1}
                            isRequired={true}
                            errorCounterContainerClassName={styles['error-counter']}
                        />
                    </div>

                    <div className={styles['total-amount-input']}>
                        <TextAreaWithCharacterLimitGroup
                            label={descriptionTitle}
                            id={`${windowTitle}-value`}
                            name={`${windowTitle}-value`}
                            value={String(values.totalAmount)}
                            onChange={handleTotalAmountChange}
                            maxLength={totalAmountMaxLength}
                            disabled={!isValueEditable}
                            error={totalAmountError}
                            rows={1}
                            isRequired={true}
                            errorCounterContainerClassName={styles['error-counter']}
                        />
                    </div>
                </div>

                <div className={styles.image}>
                    <div className={styles['image-wrapper']}>
                        <ImageInput
                            variant="partnerBanner"
                            label={COMMON_TEXT_ADMIN.INPUT.ADD_FILE_HERE}
                            subText={COMMON_TEXT_ADMIN.INPUT.getImageSizeSubText(imageWidth, imageHeight)}
                            value={values.image && 'base64' in values.image ? values.image : null}
                            onChange={handleImageChange}
                            setError={handleImageErrorInternal}
                            cropWidth={imageWidth}
                            cropHeight={imageHeight}
                            minWidth={imageWidth}
                            minHeight={imageHeight}
                            style={{
                                backgroundImage: `
                                    linear-gradient(rgba(245, 245, 245, 0.85), rgba(245, 245, 245, 0.85)),
                                    url(${imageUrl})
                                `,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                backgroundRepeat: 'no-repeat',
                            }}
                        />
                        <div className={styles['image-error']}>
                            <InputError error={imageError} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
