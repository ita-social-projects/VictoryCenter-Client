import { Image, ImageValues } from '@/types/common/image';

export const getImageSrc = (image: Image | ImageValues | string | null | undefined): string => {
    if (!image) {
        return '';
    }

    if (typeof image === 'string') {
        return image;
    }

    if ('url' in image && image.url) {
        const v = image.updatedAt ? `?v=${new Date(image.updatedAt).getTime()}` : '';
        return `${image.url}${v}`;
    }

    if ('base64' in image && image.base64) {
        return `data:${image.mimeType};base64,${image.base64}`;
    }

    return '';
};
