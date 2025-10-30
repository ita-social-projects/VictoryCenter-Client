import * as Yup from 'yup';
import { IMAGE_VALIDATION } from '../../../const/admin/image';
import { getImageValidationSchema, IMAGE_VALIDATION_FUNCTIONS } from './image-schema';

const createTestFile = (size: number, type: string = 'image/jpeg', name: string = 'test.jpg'): File => {
    return new File(['content'.repeat(size / 10)], name, { type, lastModified: Date.now() });
};

describe('ImageValidationSchema', () => {

    const validationSchema = getImageValidationSchema();

    it('Accepts a valid image file', async () => {
        const validFile = createTestFile(1000, 'image/jpeg');
        await expect(validationSchema.validate(validFile)).resolves.toEqual(validFile);
    });

    it('rejects a file that is too large', async () => {
        const largeFile = createTestFile(IMAGE_VALIDATION.maxSizeBytes + 1);

        try {
            await validationSchema.validate(largeFile);
        } catch (error) {
            expect(error).toBeInstanceOf(Yup.ValidationError);
            expect((error as Yup.ValidationError).message).toBe(IMAGE_VALIDATION.getSizeError);
        }
    });

    it('rejects an invalid file type', async () => {
        const invalidTypeFile = createTestFile(100, 'text/plain');

        try {
            await validationSchema.validate(invalidTypeFile);
        } catch (error) {
            expect(error).toBeInstanceOf(Yup.ValidationError);
            expect((error as Yup.ValidationError).message).toBe(IMAGE_VALIDATION.getFormatError());
        }
    });

    it('rejects null or undefined input', async () => {
        await expect(validationSchema.validate(null)).rejects.toThrow(Yup.ValidationError);
        await expect(validationSchema.validate(undefined)).rejects.toThrow(Yup.ValidationError);
    });
});

describe('IMAGE_VALIDATION_FUNCTIONS', () => {
    it('returns UnexpectedError message when validation fails unexpectedly', async () => {
        const originalSchemaValidate = Yup.mixed.prototype.validate;
        Yup.mixed.prototype.validate = jest.fn(() => {
            throw new Error('Some unexpected error');
        });

        const validFile = createTestFile(1000, 'image/jpeg');
        const result = await IMAGE_VALIDATION_FUNCTIONS.validateImage(validFile);

        expect(result).toBe(IMAGE_VALIDATION.UnexpectedError());

        Yup.mixed.prototype.validate = originalSchemaValidate;
    });
});
