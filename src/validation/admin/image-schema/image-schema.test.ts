import * as Yup from 'yup';
import { IMAGE_VALIDATION } from '../../../const/admin/image'; // Переконайтеся, що шлях вірний
import { getImageValidationSchema, IMAGE_VALIDATION_FUNCTIONS } from './image-schema';

const originalImage = global.Image;
const originalCreateObjectURL = global.URL.createObjectURL;
const originalRevokeObjectURL = global.URL.revokeObjectURL;

const createTestFile = (size: number, type: string = 'image/jpeg', name: string = 'test.jpg'): File => {
    const bits = [new Array(size).fill('a').join('')];
    return new File(bits, name, { type, lastModified: Date.now() });
};

describe('ImageValidationSchema', () => {
    const MIN_WIDTH = 1920;
    const MIN_HEIGHT = 1080;
    const validationSchema = getImageValidationSchema(MIN_WIDTH, MIN_HEIGHT);

    beforeAll(() => {
        global.URL.createObjectURL = jest.fn(() => 'mock-url');
        global.URL.revokeObjectURL = jest.fn();
    });

    afterAll(() => {
        global.Image = originalImage;
        global.URL.createObjectURL = originalCreateObjectURL;
        global.URL.revokeObjectURL = originalRevokeObjectURL;
    });

    const mockImageDimensions = (width: number, height: number, triggerError = false) => {
        // @ts-ignore
        global.Image = class {
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
        mockImageDimensions(1920, 1080); // Розміри ок, але файл великий
        const largeFile = createTestFile(IMAGE_VALIDATION.maxSizeBytes + 1024);

        await expect(validationSchema.validate(largeFile)).rejects.toThrow(IMAGE_VALIDATION.getSizeError());
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
            `Неправильні розміри зображення. Мінімум ${MIN_WIDTH}x${MIN_HEIGHT}px`,
        );
    });

    it('rejects an image with height smaller than minHeight', async () => {
        mockImageDimensions(1920, 1079);
        const validFile = createTestFile(1000, 'image/jpeg');

        await expect(validationSchema.validate(validFile)).rejects.toThrow(
            `Неправильні розміри зображення. Мінімум ${MIN_WIDTH}x${MIN_HEIGHT}px`,
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
        global.Image = class {
            set src(_: string) {
                setTimeout(() => this.onload && this.onload(), 10);
            }
            onload = () => {};
            width = 2000;
            height = 2000;
        };
        global.URL.createObjectURL = jest.fn(() => 'mock');
        global.URL.revokeObjectURL = jest.fn();
    });

    afterAll(() => {
        global.Image = originalImage;
        global.URL.createObjectURL = originalCreateObjectURL;
        global.URL.revokeObjectURL = originalRevokeObjectURL;
    });

    it('returns UnexpectedError message when validation fails unexpectedly', async () => {
        jest.spyOn(Yup.mixed.prototype, 'validate').mockImplementation(() => {
            throw new Error('Some unexpected error');
        });

        const validFile = createTestFile(1000, 'image/jpeg');
        const result = await IMAGE_VALIDATION_FUNCTIONS.validateImage(validFile);

        const expectedError = IMAGE_VALIDATION.UnexpectedError
            ? IMAGE_VALIDATION.UnexpectedError()
            : 'Unexpected error';
        expect(result).toBe(expectedError);

        (Yup.mixed.prototype.validate as jest.Mock).mockRestore();
    });

    it('returns undefined for valid image', async () => {
        const validFile = createTestFile(1000, 'image/jpeg');
        const result = await IMAGE_VALIDATION_FUNCTIONS.validateImage(validFile);
        expect(result).toBeUndefined();
    });
});
