import DOMPurify from 'dompurify';

const removeEmptyTags = (container: Element): void => {
    container.querySelectorAll('strong, em, b, i').forEach((el) => {
        const text = el.textContent ?? '';
        if (!text.trim()) {
            el.replaceWith(document.createTextNode(text));
        }
    });

    container.querySelectorAll('p').forEach((p) => {
        const text = p.textContent ?? '';
        if (!text.trim()) {
            p.remove();
        }
    });
};

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

    const preserveSpaces = (node: Node) => {
        if (node.nodeType === Node.TEXT_NODE && node.textContent) {
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

    const resultDiv = document.createElement('div');
    resultDiv.innerHTML = cleanHtml;
    removeEmptyTags(resultDiv);

    return resultDiv.innerHTML;
};
