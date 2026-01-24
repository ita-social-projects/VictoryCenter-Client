export type MediaType = 'video' | 'image';

export const getMediaType = (url: string): MediaType => {
    if (/\.(mp4|webm|mov)$/i.test(url)) return 'video';
    return 'image';
};
