import { ImageValues } from '@/types/common/image';

export const fetchDefaultImageAsImageValues = (imageUrl: string, width: number, height: number): Promise<ImageValues> =>
    new Promise((resolve, reject) => {
        const img = new window.Image();
        img.onload = () => {
            try {
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error('Canvas 2d context is not available'));
                    return;
                }

                ctx.imageSmoothingQuality = 'high';
                ctx.drawImage(img, 0, 0, width, height);

                const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
                const base64 = dataUrl.split(',')[1];

                resolve({ base64, mimeType: 'image/jpeg' });
            } catch (error) {
                reject(error);
            }
        };
        img.onerror = () => reject(new Error(`Failed to load image: ${imageUrl}`));
        img.src = imageUrl;
    });
