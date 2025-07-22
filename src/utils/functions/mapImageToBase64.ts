import { Image, ImageValues } from '../../types/Image';

export function mapImageToBase64(image: Image | ImageValues | null): string | null {
    if (!image) {
        return null;
    }

    return `data:${image.mimeType};base64,${image.base64}`;
}
