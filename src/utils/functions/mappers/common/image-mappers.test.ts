import { mapImageToBase64, ImageToImageValue, ImageValuesToImage } from './image-mappers';
import { Image, ImageValues } from '../../../../types/common/image';

describe('mapImageToBase64', () => {
    it('returns base64 string with mime type when image is valid', () => {
        const image: Image = {
            id: 1,
            size: 1234,
            base64: 'abcd1234',
            mimeType: 'image/png',
        };
        expect(mapImageToBase64(image)).toBe('data:image/png;base64,abcd1234');
    });

    it('returns null if image is null', () => {
        expect(mapImageToBase64(null)).toBeNull();
    });

    it('returns null if base64 is empty', () => {
        const image: Image = {
            id: 1,
            size: 1234,
            base64: '',
            mimeType: 'image/png',
        };
        expect(mapImageToBase64(image)).toBeNull();
    });

    it('returns null if base64 is only whitespace', () => {
        const image: Image = {
            id: 1,
            size: 1234,
            base64: '   ',
            mimeType: 'image/png',
        };
        expect(mapImageToBase64(image)).toBeNull();
    });
});

describe('ImageToImageValue', () => {
    it('maps Image to ImageValues', () => {
        const image: Image = {
            id: 1,
            size: 100,
            base64: 'xyz',
            mimeType: 'image/jpeg',
        };
        expect(ImageToImageValue(image)).toEqual({
            size: 100,
            base64: 'xyz',
            mimeType: 'image/jpeg',
        });
    });

    it('returns null if image is null', () => {
        expect(ImageToImageValue(null)).toBeNull();
    });
});

describe('ImageValuesToImage', () => {
    it('maps ImageValues to Image with id null', () => {
        const imageValues: ImageValues = {
            size: 200,
            base64: 'abc',
            mimeType: 'image/gif',
        };
        expect(ImageValuesToImage(imageValues)).toEqual({
            id: null,
            size: 200,
            base64: 'abc',
            mimeType: 'image/gif',
        });
    });

    it('returns null if imageValues is null', () => {
        expect(ImageValuesToImage(null)).toBeNull();
    });
});
