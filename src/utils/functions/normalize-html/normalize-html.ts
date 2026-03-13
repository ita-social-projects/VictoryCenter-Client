export const normalizeHtml = (html: string): string =>
    html
        .replace(/[ \t\r\n]+</g, '<')
        .replace(/>[ \t\r\n]+/g, '>')
        .trim();
