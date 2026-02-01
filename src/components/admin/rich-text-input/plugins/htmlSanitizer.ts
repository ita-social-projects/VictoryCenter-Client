import DOMPurify from 'dompurify';

/**
 * Sanitizes HTML by removing classes, styles, and redundant tags
 * Also preserves multiple consecutive spaces using &nbsp; entities
 */
export const sanitizeHtml = (html: string): string => {
    if (!html) return '';

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;

    tempDiv.querySelectorAll('[class]').forEach((el) => {
        el.removeAttribute('class');
    });

    tempDiv.querySelectorAll('[style]').forEach((el) => {
        el.removeAttribute('style');
    });

    tempDiv.querySelectorAll('b > strong').forEach((strong) => {
        const bTag = strong.parentElement;
        if (bTag && bTag.tagName === 'B') {
            bTag.replaceWith(strong);
        }
    });

    tempDiv.querySelectorAll('i > em').forEach((em) => {
        const iTag = em.parentElement;
        if (iTag && iTag.tagName === 'I') {
            iTag.replaceWith(em);
        }
    });

    tempDiv.querySelectorAll('span').forEach((span) => {
        if (!span.hasAttribute('style') && !span.hasAttribute('class')) {
            const parent = span.parentNode;
            while (span.firstChild) {
                parent?.insertBefore(span.firstChild, span);
            }
            span.remove();
        }
    });

    // Preserve multiple consecutive spaces by converting them to &nbsp;
    // This prevents HTML from collapsing spaces and avoids cursor jumping
    const preserveSpaces = (node: Node) => {
        if (node.nodeType === Node.TEXT_NODE && node.textContent) {
            // Replace sequences of 2+ spaces with nbsp entities
            // Keep first space as regular space, rest as nbsp for better word wrapping
            node.textContent = node.textContent.replace(/ {2,}/g, (match) => {
                return ' ' + '\u00A0'.repeat(match.length - 1);
            });
        }
        node.childNodes.forEach(preserveSpaces);
    };
    preserveSpaces(tempDiv);

    const cleanHtml = DOMPurify.sanitize(tempDiv.innerHTML, {
        ALLOWED_TAGS: ['p', 'strong', 'em', 'b', 'i', 'br'],
        ALLOWED_ATTR: [],
    });

    return cleanHtml;
};
