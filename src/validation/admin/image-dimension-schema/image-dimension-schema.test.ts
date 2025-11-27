import * as Yup from 'yup';
import { getImageDimensionSchema, IMAGE_DIMENSION_VALIDATION_FUNCTIONS } from './image-dimension-schema'; // Змініть шлях
import { ImageValues } from '../../../types/common/image';

const originalImage = global.Image;

describe('Image Dimension Validation', () => {
    const TARGET_WIDTH = 500;
    const TARGET_HEIGHT = 300;
    const ERROR_MSG = `Зображення завелике. Це може вплинути на якість. Обріжте до рекомендованного.`;

    beforeAll(() => {
        class MockImage {
            onload: (() => void) | null = null;
            onerror: (() => void) | null = null;
            width = 0;
            height = 0;
            private _src = '';

            set src(value: string) {
                this._src = value;

                setTimeout(() => {
                    if (value.includes('ERROR_LOAD')) {
                        if (this.onerror) this.onerror();
                    } else if (value.includes('WRONG_SIZE')) {
                        this.width = 100; // Якесь неправильне число
                        this.height = 100;
                        if (this.onload) this.onload();
                    } else {
                        this.width = TARGET_WIDTH;
                        this.height = TARGET_HEIGHT;
                        if (this.onload) this.onload();
                    }
                }, 0);
            }

            get src() {
                return this._src;
            }
        }

        global.Image = MockImage as any;
    });

    afterAll(() => {
        global.Image = originalImage;
    });

    describe('getImageDimensionSchema', () => {
        it('should pass validation when image dimensions match', async () => {
            const schema = getImageDimensionSchema(TARGET_WIDTH, TARGET_HEIGHT);
            const validImage: ImageValues = {
                base64: 'VALID_IMAGE_DATA',
                mimeType: 'image/jpeg',
            };

            await expect(schema.isValid(validImage)).resolves.toBe(true);
        });

        it('should fail validation when image dimensions do not match', async () => {
            const schema = getImageDimensionSchema(TARGET_WIDTH, TARGET_HEIGHT);
            const invalidImage: ImageValues = {
                base64: 'WRONG_SIZE_DATA',
                mimeType: 'image/jpeg',
            };

            await expect(schema.validate(invalidImage)).rejects.toThrow(ERROR_MSG);
        });

        it('should fail validation when image fails to load (onerror)', async () => {
            const schema = getImageDimensionSchema(TARGET_WIDTH, TARGET_HEIGHT);
            const brokenImage: ImageValues = {
                base64: 'ERROR_LOAD_DATA',
                mimeType: 'image/jpeg',
            };

            await expect(schema.validate(brokenImage)).rejects.toThrow(ERROR_MSG);
        });

        it('should fail immediately if image object is undefined', async () => {
            const schema = getImageDimensionSchema(TARGET_WIDTH, TARGET_HEIGHT);
            await expect(schema.isValid(undefined)).resolves.toBe(false);
        });

        it('should fail immediately if base64 is missing', async () => {
            const schema = getImageDimensionSchema(TARGET_WIDTH, TARGET_HEIGHT);
            const imageWithoutBase64 = { mimeType: 'image/png' } as ImageValues;

            await expect(schema.isValid(imageWithoutBase64)).resolves.toBe(false);
        });

        it('should fail immediately if mimeType is missing', async () => {
            const schema = getImageDimensionSchema(TARGET_WIDTH, TARGET_HEIGHT);
            const imageWithoutMime = { base64: 'some_data' } as ImageValues;

            await expect(schema.isValid(imageWithoutMime)).resolves.toBe(false);
        });
    });

    describe('IMAGE_DIMENSION_VALIDATION_FUNCTIONS.validateImage', () => {
        it('should return undefined when validation succeeds', async () => {
            const validImage: ImageValues = {
                base64: 'VALID_DATA',
                mimeType: 'image/jpeg',
            };

            const result = await IMAGE_DIMENSION_VALIDATION_FUNCTIONS.validateImage(
                validImage,
                TARGET_WIDTH,
                TARGET_HEIGHT,
            );

            expect(result).toBeUndefined();
        });

        it('should return error message when validation fails due to dimensions', async () => {
            const invalidImage: ImageValues = {
                base64: 'WRONG_SIZE_DATA',
                mimeType: 'image/jpeg',
            };

            const result = await IMAGE_DIMENSION_VALIDATION_FUNCTIONS.validateImage(
                invalidImage,
                TARGET_WIDTH,
                TARGET_HEIGHT,
            );

            expect(result).toBe(ERROR_MSG);
        });

        it('should return error message when generic validation error occurs', async () => {
            const brokenImage: ImageValues = {
                base64: 'ERROR_LOAD_DATA',
                mimeType: 'image/jpeg',
            };

            const result = await IMAGE_DIMENSION_VALIDATION_FUNCTIONS.validateImage(
                brokenImage,
                TARGET_WIDTH,
                TARGET_HEIGHT,
            );

            expect(result).toBe(ERROR_MSG);
        });

        it('should handle non-Yup errors gracefully', async () => {
            const schemaSpy = jest.spyOn(Yup, 'mixed').mockImplementation(() => {
                throw new Error('Some unexpected system error');
            });

            const image: ImageValues = { base64: 'data', mimeType: 'image/png' };
            const result = await IMAGE_DIMENSION_VALIDATION_FUNCTIONS.validateImage(image, 100, 100);

            expect(result).toBe('Несподівана помилка валідації зображення.');

            schemaSpy.mockRestore();
        });
    });
});
