import * as Yup from 'yup';
import { IMAGE_VALIDATION } from '@/const/admin/image';

export const getImageValidationSchema = () => {
    return Yup.mixed<File>()
        .test('fileSize', IMAGE_VALIDATION.getSizeError, (file) => !!file && file.size <= IMAGE_VALIDATION.maxSizeBytes)
        .test(
            'fileType',
            IMAGE_VALIDATION.getFormatError,
            (file) => !!file && IMAGE_VALIDATION.allowedFormats.includes(file.type),
        );
};

export const IMAGE_VALIDATION_FUNCTIONS = {
    validateImage: async (file: File): Promise<string | undefined> => {
        try {
            const schema = getImageValidationSchema();
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
