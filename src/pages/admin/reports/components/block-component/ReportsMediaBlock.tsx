import { Image, ImageValues } from '@/types/common/image';
import { useCallback } from 'react';
import cn from 'classnames';
import styles from './ReportsMediaBlock.module.scss';
import { InputWithCharacterLimit } from '@/components/admin/input-with-character-limit/InputWithCharacterLimit';
import { InputError } from '@/components/admin/input-error/InputError';
import { InputWithCharacterLimitGroup } from '@/components/admin/input-groups/input-with-character-limit-group/InputWithCharacterLimitGroup';
import { REPORTS_TEXT } from '@/const/admin/reports';
import { ImageInput } from '@/components/admin/image-input/ImageInput';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';

export interface ReportsMediaBlockValues {
    title: string;
    totalAmount: number;
    image: ImageValues | Image | null;
    imageId: number | null;
}

export interface ReportsMediaBlockErrors {
    title?: string;
    totalAmount?: string;
    image?: string;
}

export interface ReportsMediaBlockValidationFunctions {
    validateTitle: (value: string) => string | undefined;
    validateTotalAmount?: (value: number) => string | undefined;
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
    validationFunctions: ReportsMediaBlockValidationFunctions;
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
    validationFunctions,
    onValuesChange,
}: ReportsMediaBlockProps) => {
    const handleTitleChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value;
            const error = validationFunctions.validateTitle(value);
            onValuesChange({ ...values, title: value }, { ...errors, title: error });
        },
        [onValuesChange, values, errors, validationFunctions],
    );

    const handleTitleBlur = useCallback(() => {
        const error = validationFunctions.validateTitle(values.title);
        onValuesChange({ ...values }, { ...errors, title: error });
    }, [onValuesChange, values, errors, validationFunctions]);

    const handleTotalAmountChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const value = Number(e.target.value);
            const error = validationFunctions.validateTotalAmount?.(value);
            onValuesChange({ ...values, totalAmount: value }, { ...errors, totalAmount: error });
        },
        [onValuesChange, values, errors, validationFunctions],
    );

    const handleTotalAmountBlur = useCallback(() => {
        const error = validationFunctions.validateTotalAmount?.(values.totalAmount);
        onValuesChange({ ...values }, { ...errors, totalAmount: error });
    }, [onValuesChange, values, errors, validationFunctions]);

    const handleImageChange = useCallback(
        (value: ImageValues | null) => {
            onValuesChange(
                { ...values, image: value, imageId: value ? values.imageId : null },
                { ...errors, image: undefined },
            );
        },
        [onValuesChange, values, errors],
    );

    const handleImageError = useCallback(
        (error: string | null) => {
            if (!error) return;
            onValuesChange({ ...values }, { ...errors, image: error });
        },
        [onValuesChange, values, errors],
    );

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
                            value={values.image && 'base64' in values.image ? values.image : null}
                            onChange={handleImageChange}
                            setError={handleImageError}
                            disabled={!isEditing}
                            cropWidth={imageWidth}
                            cropHeight={imageHeight}
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
                        <InputError error={errors.image} />
                    </div>
                </div>
            </div>
        </div>
    );
};
