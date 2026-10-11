import { getVideoThumbnailUrl, getYouTubeVideoId } from './video-thumbnail';

describe('getYouTubeVideoId', () => {
    it.each([
        ['https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'dQw4w9WgXcQ'],
        ['https://youtube.com/watch?v=dQw4w9WgXcQ&t=42s', 'dQw4w9WgXcQ'],
        ['https://m.youtube.com/watch?v=dQw4w9WgXcQ', 'dQw4w9WgXcQ'],
        ['https://youtu.be/dQw4w9WgXcQ', 'dQw4w9WgXcQ'],
        ['https://youtu.be/dQw4w9WgXcQ?si=abc', 'dQw4w9WgXcQ'],
        ['https://www.youtube.com/shorts/dQw4w9WgXcQ', 'dQw4w9WgXcQ'],
        ['https://www.youtube.com/embed/dQw4w9WgXcQ', 'dQw4w9WgXcQ'],
        ['https://www.youtube.com/live/dQw4w9WgXcQ', 'dQw4w9WgXcQ'],
    ])('extracts the id from %s', (link, expected) => {
        expect(getYouTubeVideoId(link)).toBe(expected);
    });

    it.each([
        [null],
        [undefined],
        [''],
        ['not a url'],
        ['https://www.facebook.com/watch/?v=123456789'],
        ['https://www.youtube.com/channel/UC123'],
        ['https://www.youtube.com/watch?v=tooShort'],
        ['https://youtu.be/'],
    ])('returns null for %s', (link) => {
        expect(getYouTubeVideoId(link)).toBeNull();
    });
});

describe('getVideoThumbnailUrl', () => {
    it('builds a YouTube thumbnail URL for YouTube links', () => {
        expect(getVideoThumbnailUrl('https://youtu.be/dQw4w9WgXcQ')).toBe(
            'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
        );
    });

    it('returns null for non-YouTube links', () => {
        expect(getVideoThumbnailUrl('https://www.facebook.com/watch/?v=123456789')).toBeNull();
    });
});
