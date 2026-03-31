import * as Yup from 'yup';
import { IMAGE_VALIDATION } from '@/const/admin/image';

export const getImageValidationSchema = (minWidth: number, minHeight: number, maxSizeMB: number) => {
    return Yup.mixed<File>()
        .test(
            'fileType',
            IMAGE_VALIDATION.getFormatError,
            (file) => !!file && IMAGE_VALIDATION.allowedFormats.includes(file.type),
        )
        .test(
            'fileSize',
            IMAGE_VALIDATION.getSizeError(maxSizeMB),
            (file) => !!file && file.size <= maxSizeMB * 1024 * 1024,
        )
        .test(
            'fileDimensions',
            IMAGE_VALIDATION.ImageDimensionsTooSmallError,
            (file) =>
                new Promise((resolve) => {
                    if (!file) return resolve(false);

                    const img = new Image();
                    img.src = URL.createObjectURL(file);

                    img.onload = () => {
                        const valid = img.width >= minWidth && img.height >= minHeight;
                        URL.revokeObjectURL(img.src);
                        resolve(valid);
                    };

                    img.onerror = () => {
                        URL.revokeObjectURL(img.src);
                        resolve(false);
                    };
                }),
        );
};

export const IMAGE_VALIDATION_FUNCTIONS = {
    validateImage: async (
        file: File,
        minWidth = 1920,
        minHeight = 1080,
        maxSizeMB = 3,
    ): Promise<string | undefined> => {
        try {
            const schema = getImageValidationSchema(minWidth, minHeight, maxSizeMB);
            await schema.validate(file, { abortEarly: true });
            return undefined;
        } catch (err) {
            if (err instanceof Yup.ValidationError) {
                return err.message;
            }
            return IMAGE_VALIDATION.UnexpectedError();
        }
    },
};
