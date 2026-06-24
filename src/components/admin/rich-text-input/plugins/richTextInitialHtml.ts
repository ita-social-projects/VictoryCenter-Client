const RICH_TEXT_HTML_TAG_PATTERN = /<\/?(p|strong|em|b|i|br)(\s[^>]*)?>/i;

const escapeHtml = (value: string) =>
    value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');

export const normalizeRichTextInitialHtml = (value: string): string => {
    if (!value) {
        return '<p></p>';
    }

    if (RICH_TEXT_HTML_TAG_PATTERN.test(value)) {
        return value;
    }

    return `<p>${escapeHtml(value).replace(/\r\n|\r|\n/g, '<br>')}</p>`;
};
