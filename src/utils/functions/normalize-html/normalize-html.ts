export const normalizeHtml = (html: string): string => html.replace(/\s+</g, '<').replace(/>\s+/g, '>').trim();
