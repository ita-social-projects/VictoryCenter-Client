import { getImageSrc } from '@/utils/functions/image-helper/image-helper';

describe('getImageSrc', () => {
    it('returns empty string for null', () => {
        expect(getImageSrc(null)).toBe('');
    });

    it('returns empty string for undefined', () => {
        expect(getImageSrc(undefined)).toBe('');
    });

    it('returns the same string when input is a string', () => {
        expect(getImageSrc('https://example.com/img.png')).toBe('https://example.com/img.png');
    });

    it('returns url when image has url', () => {
        expect(
            getImageSrc({
                id: 1,
                url: 'https://example.com/img.jpg',
                mimeType: 'image/jpeg',
            } as any),
        ).toBe('https://example.com/img.jpg');
    });

    it('returns data url when image has base64', () => {
        expect(
            getImageSrc({
                base64: 'QUJD',
                mimeType: 'image/png',
            } as any),
        ).toBe('data:image/png;base64,QUJD');
    });

    it('returns empty string when object has neither url nor base64', () => {
        expect(
            getImageSrc({
                mimeType: 'image/png',
            } as any),
        ).toBe('');
    });

    it('returns empty string when url is empty', () => {
        expect(
            getImageSrc({
                url: '',
                mimeType: 'image/png',
            } as any),
        ).toBe('');
    });

    it('returns empty string when base64 is empty', () => {
        expect(
            getImageSrc({
                base64: '',
                mimeType: 'image/png',
            } as any),
        ).toBe('');
    });
});
