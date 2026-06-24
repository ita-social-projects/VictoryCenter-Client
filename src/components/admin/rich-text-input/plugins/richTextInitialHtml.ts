const escapeHtml = (value: string) =>
    value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');

const ALLOWED_TAGS = new Set(['P', 'STRONG', 'EM', 'B', 'I', 'BR']);

const isSupportedRichTextNode = (node: ChildNode): boolean => {
    if (node.nodeType === Node.TEXT_NODE) {
        return true;
    }

    if (node.nodeType !== Node.ELEMENT_NODE) {
        return false;
    }

    const element = node as HTMLElement;

    return ALLOWED_TAGS.has(element.tagName) && Array.from(element.childNodes).every(isSupportedRichTextNode);
};

const isSupportedRichTextHtml = (value: string): boolean => {
    const parser = new DOMParser();
    const document = parser.parseFromString(value, 'text/html');
    const topLevelNodes = Array.from(document.body.childNodes);

    return (
        topLevelNodes.length > 0 &&
        topLevelNodes.every((node) => node.nodeType === Node.ELEMENT_NODE) &&
        topLevelNodes.every(isSupportedRichTextNode)
    );
};

export const normalizeRichTextInitialHtml = (value: string): string => {
    if (!value) {
        return '<p></p>';
    }

    if (isSupportedRichTextHtml(value)) {
        return value;
    }

    return `<p>${escapeHtml(value).replace(/\r\n|\r|\n/g, '<br>')}</p>`;
};
