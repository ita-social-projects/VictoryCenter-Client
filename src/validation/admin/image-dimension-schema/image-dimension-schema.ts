import * as Yup from 'yup';
import { ImageValues } from '../../../types/common/image';

export const getImageDimensionSchema = (width: number, height: number) => {
    return Yup.mixed<ImageValues>().test(
        'base64Dimensions',
        `Зображення завелике. Це може вплинути на якість. Обріжте до рекомендованного.`,
        (image: ImageValues | undefined) =>
            new Promise((resolve) => {
                if (!image) {
                    return resolve(false);
                }

                if (!image.base64) {
                    return resolve(false);
                }

                if (!image.mimeType) {
                    return resolve(false);
                }

                const img = new Image();

                img.onload = () => {
                    const valid = img.width === width && img.height === height;
                    resolve(valid);
                };

                img.onerror = () => {
                    resolve(false);
                };

                img.src = `data:${image.mimeType};base64,${image.base64}`;
            }),
    );
};

export const IMAGE_DIMENSION_VALIDATION_FUNCTIONS = {
    validateImage: async (image: ImageValues, width: number, height: number): Promise<string | undefined> => {
        try {
            const schema = getImageDimensionSchema(width, height);
            await schema.validate(image, { abortEarly: true });
            return undefined;
        } catch (err) {
            if (err instanceof Yup.ValidationError) {
                return err.message;
            }
            return 'Несподівана помилка валідації зображення.';
        }
    },
};
