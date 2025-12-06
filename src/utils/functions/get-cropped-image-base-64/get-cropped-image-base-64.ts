import { Crop } from 'react-image-crop';
import { Image, ImageValues } from '../../../types/common/image';

export const getCroppedImageBase64 = (
    image: HTMLImageElement | null,
    cropToUse: Crop | undefined,
    width: number,
    height: number,
    rawImage: ImageValues | Image | null,
): string | null => {
    if (!image || !cropToUse) {
        return null;
    }

    const canvas = document.createElement('canvas');

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
        throw new Error('No 2d context');
    }

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    let sourceX, sourceY, sourceWidth, sourceHeight;

    if (cropToUse.unit === '%') {
        sourceX = (cropToUse.x / 100) * image.naturalWidth;
        sourceY = (cropToUse.y / 100) * image.naturalHeight;
        sourceWidth = (cropToUse.width / 100) * image.naturalWidth;
        sourceHeight = (cropToUse.height / 100) * image.naturalHeight;
    } else {
        sourceX = cropToUse.x * scaleX;
        sourceY = cropToUse.y * scaleY;
        sourceWidth = cropToUse.width * scaleX;
        sourceHeight = cropToUse.height * scaleY;
    }

    ctx.imageSmoothingQuality = 'high';

    ctx.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, width, height);

    return canvas.toDataURL(rawImage?.mimeType || 'image/jpeg');
};
