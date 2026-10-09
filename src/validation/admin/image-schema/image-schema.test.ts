import * as Yup from 'yup';
import { IMAGE_VALIDATION } from '@/const/admin/image';
import { getImageValidationSchema, IMAGE_VALIDATION_FUNCTIONS } from './image-schema';

const originalImage = globalThis.Image;
const originalCreateObjectURL = globalThis.URL.createObjectURL;
const originalRevokeObjectURL = globalThis.URL.revokeObjectURL;

const SIGNATURES: Record<string, number[]> = {
    'image/jpeg': [0xff, 0xd8, 0xff],
    'image/png': [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
    'image/webp': [0x52, 0x49, 0x46, 0x46, 0x00, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50],
};

const createTestFile = (
    size: number,
    type: string = 'image/jpeg',
    name: string = 'test.jpg',
    contentType: string = type,
): File => {
    const signature = SIGNATURES[contentType] ?? [];
    const padding = new Array(Math.max(size - signature.length, 0)).fill('a').join('');
    return new File([new Uint8Array(signature), padding], name, { type, lastModified: Date.now() });
};

describe('ImageValidationSchema', () => {
    const MIN_WIDTH = 1920;
    const MIN_HEIGHT = 1080;
    const MAX_SIZE_MB = 5;
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

    it('returns file type error first when format is invalid and size is too large', async () => {
        mockImageDimensions(1920, 1080);
        const invalidLargeTypeFile = createTestFile(IMAGE_VALIDATION.maxSizeBytes + 1024, 'text/plain');

        await expect(validationSchema.validate(invalidLargeTypeFile)).rejects.toThrow(
            IMAGE_VALIDATION.getFormatError(),
        );
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

    it('rejects a file with a valid signature that fails to decode with the format error', async () => {
        mockImageDimensions(0, 0, true);
        const corruptedFile = createTestFile(1000, 'image/jpeg');

        await expect(validationSchema.validate(corruptedFile)).rejects.toThrow(IMAGE_VALIDATION.getFormatError());
    });

    it('rejects a text file renamed to .png with the format error', async () => {
        mockImageDimensions(0, 0, true);
        const fakePng = new File(['this is plain text, not an image'], 'fake_text.png', { type: 'image/png' });

        await expect(validationSchema.validate(fakePng)).rejects.toThrow(IMAGE_VALIDATION.getFormatError());
    });

    it('returns the format error before the size error for an oversized fake image', async () => {
        mockImageDimensions(1920, 1080);
        const largeFake = createTestFile(IMAGE_VALIDATION.maxSizeBytes + 1024, 'image/png', 'big.png', 'text/plain');

        await expect(validationSchema.validate(largeFake)).rejects.toThrow(IMAGE_VALIDATION.getFormatError());
    });

    it.each(['image/png', 'image/webp'])('accepts a valid %s file', async (type) => {
        mockImageDimensions(1920, 1080);
        const file = createTestFile(1000, type, 'image');

        await expect(validationSchema.validate(file)).resolves.toEqual(file);
    });

    it('accepts a real image whose extension does not match its content', async () => {
        mockImageDimensions(1920, 1080);
        const jpegNamedPng = createTestFile(1000, 'image/png', 'photo.png', 'image/jpeg');

        await expect(validationSchema.validate(jpegNamedPng)).resolves.toEqual(jpegNamedPng);
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
