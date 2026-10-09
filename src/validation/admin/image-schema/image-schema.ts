import * as Yup from 'yup';
import { IMAGE_VALIDATION } from '@/const/admin/image';
import { detectImageMimeType } from '@/utils/functions/detect-image-mime-type/detect-image-mime-type';

type DecodeResult = { width: number; height: number } | null;

const decodeImage = (file: File): Promise<DecodeResult> =>
    new Promise((resolve) => {
        const img = new Image();
        img.src = URL.createObjectURL(file);

        img.onload = () => {
            URL.revokeObjectURL(img.src);
            resolve({ width: img.width, height: img.height });
        };

        img.onerror = () => {
            URL.revokeObjectURL(img.src);
            resolve(null);
        };
    });

export const getImageValidationSchema = (minWidth: number, minHeight: number, maxSizeMB: number) => {
    return (
        Yup.mixed<File>()
            .test(
                'fileType',
                IMAGE_VALIDATION.getFormatError,
                (file) => !!file && IMAGE_VALIDATION.allowedFormats.includes(file.type),
            )
            // Yup runs tests concurrently; chained here to keep format → size → dimensions priority.
            .test('fileContent', IMAGE_VALIDATION.getFormatError, async (file, context) => {
                if (!file) return false;

                if ((await detectImageMimeType(file)) === null) return false;

                if (file.size > maxSizeMB * 1024 * 1024) {
                    return context.createError({ message: IMAGE_VALIDATION.getSizeError(maxSizeMB) });
                }

                const decoded = await decodeImage(file);
                if (!decoded) return false;

                if (decoded.width < minWidth || decoded.height < minHeight) {
                    return context.createError({ message: IMAGE_VALIDATION.ImageDimensionsTooSmallError });
                }

                return true;
            })
    );
};

export const IMAGE_VALIDATION_FUNCTIONS = {
    validateImage: async (
        file: File,
        minWidth = 1920,
        minHeight = 1080,
        maxSizeMB = 5,
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
