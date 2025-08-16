export interface Image {
    id: number | null;
    base64: string;
    mimeType: string;
    size: number;
}

export interface ImageValues {
    base64: string;
    mimeType: string;
    size: number;
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
