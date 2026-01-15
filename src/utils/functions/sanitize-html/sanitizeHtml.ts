import DOMPurify from 'dompurify';

export const sanitizeHtml = (html: string): string => {
    return DOMPurify.sanitize(html, {
        ALLOWED_TAGS: ['strong', 'em', 'b', 'i', 'br'],
        ALLOWED_ATTR: [],
    });
};
