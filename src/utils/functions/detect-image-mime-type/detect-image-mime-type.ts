const SIGNATURE_LENGTH = 12;

const startsWith = (bytes: Uint8Array, signature: number[], offset = 0) =>
    bytes.length >= offset + signature.length && signature.every((byte, i) => bytes[offset + i] === byte);

const JPEG = [0xff, 0xd8, 0xff];
const PNG = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
const RIFF = [0x52, 0x49, 0x46, 0x46];
const WEBP = [0x57, 0x45, 0x42, 0x50];

export const getImageMimeTypeFromBytes = (bytes: Uint8Array): string | null => {
    if (startsWith(bytes, JPEG)) return 'image/jpeg';
    if (startsWith(bytes, PNG)) return 'image/png';
    if (startsWith(bytes, RIFF) && startsWith(bytes, WEBP, 8)) return 'image/webp';
    return null;
};

// FileReader instead of Blob.arrayBuffer(): jsdom doesn't implement the latter.
export const detectImageMimeType = (file: Blob): Promise<string | null> =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(getImageMimeTypeFromBytes(new Uint8Array(reader.result as ArrayBuffer)));
        reader.onerror = () => reject(reader.error);
        reader.readAsArrayBuffer(file.slice(0, SIGNATURE_LENGTH));
    });
