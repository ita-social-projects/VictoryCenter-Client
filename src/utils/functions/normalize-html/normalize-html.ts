export const normalizeHtml = (html: string): string =>
    html
        .split('</p>')
        .map((part) => part.trimEnd())
        .join('</p>')
        .trim();
