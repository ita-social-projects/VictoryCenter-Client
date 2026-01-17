import * as Yup from 'yup';
import { IMAGE_VALIDATION } from '@/const/admin/image';
import { getImageValidationSchema, IMAGE_VALIDATION_FUNCTIONS } from './image-schema';

const originalImage = globalThis.Image;
const originalCreateObjectURL = globalThis.URL.createObjectURL;
const originalRevokeObjectURL = globalThis.URL.revokeObjectURL;

const createTestFile = (size: number, type: string = 'image/jpeg', name: string = 'test.jpg'): File => {
    const bits = [new Array(size).fill('a').join('')];
    return new File(bits, name, { type, lastModified: Date.now() });
};

describe('ImageValidationSchema', () => {
    const MIN_WIDTH = 1920;
    const MIN_HEIGHT = 1080;
    const MAX_SIZE_MB = 3;
    const validationSchema = getImageValidationSchema(MIN_WIDTH, MIN_HEIGHT, MAX_SIZE_MB);

    beforeAll(() => {
        globalThis.URL.createObjectURL = jest.fn(() => 'mock-url');
        globalThis.URL.revokeObjectURL = jest.fn();
    });

    afterAll(() => {
        globalThis.Image = originalImage;
        globalThis.URL.createObjectURL = originalCreateObjectURL;
        globalThis.URL.revokeObjectURL = originalRevokeObjectURL;
    });

    const mockImageDimensions = (width: number, height: number, triggerError = false) => {
        // @ts-ignore
        globalThis.Image = class {
            width = width;
            height = height;
            onload: () => void = () => {};
            onerror: () => void = () => {};
            set src(_: string) {
                setTimeout(() => {
                    if (triggerError) {
                        this.onerror();
                    } else {
                        this.onload();
                    }
                }, 10);
            }
        };
    };

    it('Accepts a valid image file (correct size, type, and dimensions)', async () => {
        mockImageDimensions(1920, 1080);
        const validFile = createTestFile(1000, 'image/jpeg');

        await expect(validationSchema.validate(validFile)).resolves.toEqual(validFile);
    });

    it('rejects a file that is too large', async () => {
        mockImageDimensions(1920, 1080);
        const largeFile = createTestFile(IMAGE_VALIDATION.maxSizeBytes + 1024);

        await expect(validationSchema.validate(largeFile)).rejects.toThrow(IMAGE_VALIDATION.getSizeError(MAX_SIZE_MB));
    });

    it('rejects a file exceeding custom maxSizeMB', async () => {
        const customMaxMB = 5;
        const customSchema = getImageValidationSchema(MIN_WIDTH, MIN_HEIGHT, customMaxMB);
        mockImageDimensions(1920, 1080);
        const largeFile = createTestFile(customMaxMB * 1024 * 1024 + 1024);

        await expect(customSchema.validate(largeFile)).rejects.toThrow(IMAGE_VALIDATION.getSizeError(customMaxMB));
    });

    it('rejects an invalid file type', async () => {
        mockImageDimensions(1920, 1080);
        const invalidTypeFile = createTestFile(100, 'text/plain');

        await expect(validationSchema.validate(invalidTypeFile)).rejects.toThrow(IMAGE_VALIDATION.getFormatError());
    });

    it('rejects null or undefined input', async () => {
        await expect(validationSchema.validate(null)).rejects.toThrow();
        await expect(validationSchema.validate(undefined)).rejects.toThrow();
    });

    it('rejects an image with width smaller than minWidth', async () => {
        mockImageDimensions(1919, 1080);
        const validFile = createTestFile(1000, 'image/jpeg');

        await expect(validationSchema.validate(validFile)).rejects.toThrow(
            IMAGE_VALIDATION.ImageDimensionsTooSmallError,
        );
    });

    it('rejects an image with height smaller than minHeight', async () => {
        mockImageDimensions(1920, 1079);
        const validFile = createTestFile(1000, 'image/jpeg');

        await expect(validationSchema.validate(validFile)).rejects.toThrow(
            IMAGE_VALIDATION.ImageDimensionsTooSmallError,
        );
    });

    it('rejects a file that fails to load as an image', async () => {
        mockImageDimensions(0, 0, true);
        const validFile = createTestFile(1000, 'image/jpeg');

        await expect(validationSchema.validate(validFile)).rejects.toThrow();
    });
});

describe('IMAGE_VALIDATION_FUNCTIONS', () => {
    beforeAll(() => {
        // @ts-ignore
        globalThis.Image = class {
            set src(_: string) {
                setTimeout(() => this.onload?.(), 10);
            }
            onload = () => {};
            width = 2000;
            height = 2000;
        };
        globalThis.URL.createObjectURL = jest.fn(() => 'mock');
        globalThis.URL.revokeObjectURL = jest.fn();
    });

    afterAll(() => {
        globalThis.Image = originalImage;
        globalThis.URL.createObjectURL = originalCreateObjectURL;
        globalThis.URL.revokeObjectURL = originalRevokeObjectURL;
    });

    it('returns UnexpectedError message when validation fails unexpectedly', async () => {
        jest.spyOn(Yup.mixed.prototype, 'validate').mockImplementation(() => {
            throw new Error('Some unexpected error');
        });

        const validFile = createTestFile(1000, 'image/jpeg');
        const result = await IMAGE_VALIDATION_FUNCTIONS.validateImage(validFile);

        const expectedError = IMAGE_VALIDATION.UnexpectedError();
        expect(result).toBe(expectedError);

        (Yup.mixed.prototype.validate as jest.Mock).mockRestore();
    });

    it('returns Yup ValidationError message when err instanceof Yup.ValidationError is true', async () => {
        const validationErrorMessage = 'Image must be at least 1920x1080px';
        jest.spyOn(Yup.mixed.prototype, 'validate').mockImplementation(() => {
            throw new Yup.ValidationError(validationErrorMessage);
        });

        const validFile = createTestFile(1000, 'image/jpeg');
        const result = await IMAGE_VALIDATION_FUNCTIONS.validateImage(validFile);

        expect(result).toBe(validationErrorMessage);

        (Yup.mixed.prototype.validate as jest.Mock).mockRestore();
    });

    it('returns undefined for valid image', async () => {
        const validFile = createTestFile(1000, 'image/jpeg');
        const result = await IMAGE_VALIDATION_FUNCTIONS.validateImage(validFile);
        expect(result).toBeUndefined();
    });
});
