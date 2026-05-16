import { ImageInput, ImageInputVariant } from '@/components/admin/image-input/ImageInput';
import { Control, Controller, FieldErrors, FieldValues, useFormContext } from 'react-hook-form';
import styles from './ImageUploadForm.module.scss';

type ImageUploadConfig = {
    cropWidth: number;
    cropHeight: number;
    minWidth: number;
    minHeight: number;
    label: string;
    subText: string;
    style: React.CSSProperties;
};

interface ImageUploadFormProps<TFormValues extends FieldValues> {
    control: Control<TFormValues>;
    errors: FieldErrors<TFormValues>;
    imageError: string | null;
    setImageError: (error: string | null) => void;
    imageConfig: ImageUploadConfig;
    variant?: ImageInputVariant;
    name?: string;
}

export const ImageUploadForm = <TFormValues extends FieldValues>({
    control,
    errors,
    imageError,
    setImageError,
    imageConfig,
    variant = 'whoWeAre',
    name = 'image',
}: ImageUploadFormProps<TFormValues>) => {
    const { setValue } = useFormContext();

    return (
        <div className={styles.imageSection}>
            <Controller
                name={name as never}
                control={control}
                render={({ field: { onChange, value } }) => (
                    <div className={styles.imageWrapper}>
                        <ImageInput
                            value={value}
                            onChange={(newValue) => {
                                onChange(newValue);
                                setValue(name, newValue, {
                                    shouldDirty: true,
                                    shouldValidate: true,
                                });
                            }}
                            setError={setImageError}
                            variant={variant}
                            {...imageConfig}
                        />
                        {(imageError || errors[name]?.message) && (
                            <p className={styles.error}>{imageError || (errors[name] as any)?.message}</p>
                        )}
                    </div>
                )}
            />
        </div>
    );
};
