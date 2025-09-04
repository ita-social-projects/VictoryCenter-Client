import { Image, ImageValues } from '../../../../types/common/image';

export function mapImageToBase64(image: Image | ImageValues | null): string | null {
    if (!image || !image.base64 || image.base64.trim() === '') {
        return null;
    }

    return `data:${image.mimeType};base64,${image.base64}`;
}

export const ImageToImageValue = (image: Image | null) => {
    if (!image) return null;

    const imageValue: ImageValues = {
        size: image.size,
        base64: image.base64,
        mimeType: image.mimeType,
    };

    return imageValue;
};

export const ImageValuesToImage = (imageValues: ImageValues | null) => {
    if (!imageValues) return null;

    const image: Image = {
        id: null,
        size: imageValues.size,
        base64: imageValues.base64,
        mimeType: imageValues.mimeType,
    };
    return image;
};
