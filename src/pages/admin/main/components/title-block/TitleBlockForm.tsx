import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button } from '@/components/admin/button/Button';
import { ImageInput } from '@/components/admin/image-input/ImageInput';
import { InputWithCharacterLimitGroup } from '@/components/admin/input-groups/input-with-character-limit-group/InputWithCharacterLimitGroup';
import { TextAreaWithCharacterLimitGroup } from '@/components/admin/input-groups/text-area-with-character-limit-group/TextAreaWithCharacterLimitGroup';
import { TitleBlockValidationSchema } from '@/validation/admin/main-page-schema/main-page-schema';
import { MainPage, TitleBlockFormValues, TITLE_BLOCK_FORM_DEFAULTS } from '@/types/admin/main-page';
import { MAIN_PAGE_TEXT, MAIN_PAGE_VALIDATION } from '@/const/admin/main-page';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import DefaultPlaceholder from '@/assets/images/man-facing-horse-forehead.webp';

import styles from './TitleBlockForm.module.scss';

interface TitleBlockFormProps {
    initialData: MainPage | null;
}

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

export const TitleBlockForm = ({ initialData }: TitleBlockFormProps) => {
    const [imageError, setImageError] = useState<string | null>(null);

    const {
        control,
        handleSubmit,
        reset,
        formState: { isDirty, isValid, errors },
    } = useForm<TitleBlockFormValues>({
        mode: 'onChange',
        resolver: yupResolver(TitleBlockValidationSchema),
        defaultValues: TITLE_BLOCK_FORM_DEFAULTS,
    });

    useEffect(() => {
        setImageError(null);
        reset(
            initialData
                ? {
                      title: initialData.title || '',
                      description: initialData.description || '',
                      image: initialData.image || null,
                  }
                : TITLE_BLOCK_FORM_DEFAULTS,
        );
    }, [initialData, reset]);

    const onSubmit = () => {
        // API integration is intentionally deferred for the display-only phase.
    };

    return (
        <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
            <div className={styles.content}>
                <div className={styles['image-section']}>
                    <Controller
                        name="image"
                        control={control}
                        render={({ field: { onChange, value } }) => (
                            <div className={styles['image-wrapper']}>
                                <ImageInput
                                    value={value}
                                    onChange={onChange}
                                    setError={setImageError}
                                    variant="whoWeAre"
                                    {...IMAGE_CONFIG}
                                />
                                {(imageError || errors.image?.message) && (
                                    <p className={styles.error}> {imageError || errors.image?.message}</p>
                                )}
                            </div>
                        )}
                    />
                </div>

                <div className={styles['text-section']}>
                    <Controller
                        name="title"
                        control={control}
                        render={({ field: { onChange, value, onBlur } }) => (
                            <InputWithCharacterLimitGroup
                                id="title-block-title"
                                name={COMMON_TEXT_ADMIN.TYPE.TITLE}
                                label={MAIN_PAGE_TEXT.BLOCKS.TITLE.TITLE_LABEL}
                                value={value}
                                onChange={onChange}
                                onBlur={onBlur}
                                error={errors.title?.message}
                                maxLength={MAIN_PAGE_VALIDATION.titleBlock.title.max}
                                isRequired={true}
                            />
                        )}
                    />

                    <Controller
                        name="description"
                        control={control}
                        render={({ field: { onChange, value, onBlur } }) => (
                            <TextAreaWithCharacterLimitGroup
                                id="title-block-description"
                                name={COMMON_TEXT_ADMIN.TYPE.DESCRIPTION}
                                label={MAIN_PAGE_TEXT.BLOCKS.TITLE.DESCRIPTION_LABEL}
                                value={value}
                                onChange={onChange}
                                onBlur={onBlur}
                                error={errors.description?.message}
                                maxLength={MAIN_PAGE_VALIDATION.titleBlock.description.max}
                                isRequired={true}
                                className={styles['textarea-custom']}
                            />
                        )}
                    />
                </div>
            </div>

            <div className={styles.actions}>
                <Button
                    type="submit"
                    buttonStyle="primary"
                    disabled={!isDirty || !isValid || !!imageError}
                    className={styles['publish-button']}
                >
                    {MAIN_PAGE_TEXT.BUTTONS.PUBLISH}
                </Button>
            </div>
        </form>
    );
};
