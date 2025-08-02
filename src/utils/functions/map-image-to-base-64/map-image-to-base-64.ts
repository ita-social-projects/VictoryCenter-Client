import { Image, ImageValues } from '../../../types/common/image';

export function mapImageToBase64(image: Image | ImageValues | null): string | null {
    if (!image || !image.base64 || image.base64.trim() === '') {
        return null;
    }

    return `data:${image.mimeType};base64,${image.base64}`;
}
