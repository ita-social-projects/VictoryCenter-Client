import { getMediaType } from './get-media-type';

describe('getMediaType', () => {
    it('returns "video" for mp4 files', () => {
        expect(getMediaType('video.mp4')).toBe('video');
    });

    it('is case-insensitive', () => {
        expect(getMediaType('VIDEO.MP4')).toBe('video');
    });

    it('returns "image" for image files', () => {
        expect(getMediaType('image.jpg')).toBe('image');
        expect(getMediaType('photo.png')).toBe('image');
    });

    it('returns "image" for unknown extensions', () => {
        expect(getMediaType('file.pdf')).toBe('image');
    });

    it('returns "image" when no extension is present', () => {
        expect(getMediaType('https://example.com/media')).toBe('image');
    });
});
