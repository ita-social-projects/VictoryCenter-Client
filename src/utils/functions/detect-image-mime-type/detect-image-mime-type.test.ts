import { detectImageMimeType, getImageMimeTypeFromBytes } from './detect-image-mime-type';

const JPEG_BYTES = [0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01];
const PNG_BYTES = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d];
const WEBP_BYTES = [0x52, 0x49, 0x46, 0x46, 0x24, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50];
const WAV_BYTES = [0x52, 0x49, 0x46, 0x46, 0x24, 0x00, 0x00, 0x00, 0x57, 0x41, 0x56, 0x45];

describe('getImageMimeTypeFromBytes', () => {
    it.each([
        ['image/jpeg', JPEG_BYTES],
        ['image/png', PNG_BYTES],
        ['image/webp', WEBP_BYTES],
    ])('detects %s', (expected, bytes) => {
        expect(getImageMimeTypeFromBytes(new Uint8Array(bytes))).toBe(expected);
    });

    it.each([
        ['plain text', Array.from(new TextEncoder().encode('just some text'))],
        ['a RIFF file that is not WebP', WAV_BYTES],
        ['a truncated PNG signature', PNG_BYTES.slice(0, 4)],
        ['a RIFF header without the WEBP marker', WEBP_BYTES.slice(0, 8)],
        ['empty input', []],
    ])('returns null for %s', (_, bytes) => {
        expect(getImageMimeTypeFromBytes(new Uint8Array(bytes))).toBeNull();
    });
});

describe('detectImageMimeType', () => {
    it('detects the format from content regardless of the declared type', async () => {
        const file = new File([new Uint8Array(JPEG_BYTES), 'padding'], 'photo.png', { type: 'image/png' });

        await expect(detectImageMimeType(file)).resolves.toBe('image/jpeg');
    });

    it('returns null for a text file renamed to .png', async () => {
        const file = new File(['plain text content'], 'fake_text.png', { type: 'image/png' });

        await expect(detectImageMimeType(file)).resolves.toBeNull();
    });

    it('rejects when the file cannot be read', async () => {
        const readError = new Error('read failed');
        const readSpy = jest.spyOn(FileReader.prototype, 'readAsArrayBuffer').mockImplementation(function (
            this: FileReader,
        ) {
            Object.defineProperty(this, 'error', { value: readError });
            this.onerror?.({} as ProgressEvent<FileReader>);
        });

        await expect(detectImageMimeType(new File(['x'], 'x.png'))).rejects.toBe(readError);

        readSpy.mockRestore();
    });
});
