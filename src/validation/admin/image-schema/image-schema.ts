import * as Yup from 'yup';
import { IMAGE_VALIDATION } from '../../../const/admin/image';

export const getImageValidationSchema = (minWidth: number, minHeight: number) => {
    return Yup.mixed<File>()
        .test('fileSize', IMAGE_VALIDATION.getSizeError, (file) => !!file && file.size <= IMAGE_VALIDATION.maxSizeBytes)
        .test(
            'fileType',
            IMAGE_VALIDATION.getFormatError,
            (file) => !!file && IMAGE_VALIDATION.allowedFormats.includes(file.type),
        );

    // todo
    //uncomment and improve this code when the cropper logic is done

    // .test(
    //     'fileDimensions',
    //     `Неправильні розміри зображення. Мінімум ${minWidth}x${minHeight}px`,
    //     (file) =>
    //         new Promise((resolve) => {
    //             if (!file) return resolve(false);
    //
    //             const img = new Image();
    //             img.src = URL.createObjectURL(file);
    //
    //             img.onload = () => {
    //                 const valid = img.width >= minWidth && img.height >= minHeight;
    //                 URL.revokeObjectURL(img.src);
    //                 resolve(valid);
    //             };
    //
    //             img.onerror = () => resolve(false);
    //         }),
    // );
};

export const IMAGE_VALIDATION_FUNCTIONS = {
    validateImage: async (file: File, maxWidth = 1920, maxHeight = 1080): Promise<string | undefined> => {
        try {
            const schema = getImageValidationSchema(maxWidth, maxHeight);
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
