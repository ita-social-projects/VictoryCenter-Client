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
