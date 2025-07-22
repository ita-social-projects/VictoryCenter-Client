import { ImageValues } from '../../types/Image';

export function convertFileToBase64(file: File): Promise<ImageValues> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => {
            const result = reader.result as string;
            const base64 = result.split(',')[1];
            resolve({
                base64,
                mimeType: file.type,
            });
        };

        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}
