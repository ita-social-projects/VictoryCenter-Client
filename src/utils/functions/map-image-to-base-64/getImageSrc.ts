import {Image, ImageValues} from "../../../types/common/image";

export const getImageSrc = (img: Image | ImageValues | null) => {
    if (!img) return undefined;

    if ('url' in img && img.url) {
        // Створюємо "cache buster" на основі поточної дати в мілісекундах
        const cacheBuster = `?t=${new Date().getTime()}`;
        return `${img.url}${cacheBuster}`;
    }

    if ('base64' in img) {
        return `data:${img.mimeType};base64,${img.base64}`;
    }

    return undefined;
};