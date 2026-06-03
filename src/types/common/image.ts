export interface Image {
    id: number | null;
    url: string;
    mimeType: string;
    updatedAt?: string;
}

export interface ImageValues {
    base64: string;
    mimeType: string;
}
