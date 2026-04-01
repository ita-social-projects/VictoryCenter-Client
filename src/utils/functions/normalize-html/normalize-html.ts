const trimTrailingWhitespace = (container: Node): void => {
    let child = container.lastChild;

    while (child) {
        const prev = child.previousSibling;

        if (child.nodeType === Node.TEXT_NODE) {
            child.textContent = child.textContent?.trimEnd() ?? '';
            if (child.textContent.length > 0) return;
            child.remove();
        } else if (child.nodeType === Node.ELEMENT_NODE) {
            const el = child as HTMLElement;
            trimTrailingWhitespace(el);

            if (el.childNodes.length === 0 && el.tagName !== 'BR') {
                el.remove();
            } else {
                return;
            }
        }

        child = prev;
    }
};

export const normalizeHtml = (html: string): string => {
    if (!html) return '';

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;

    const paragraphs = tempDiv.querySelectorAll('p');

    if (paragraphs.length > 0) {
        paragraphs.forEach(trimTrailingWhitespace);
    }

    trimTrailingWhitespace(tempDiv);

    return tempDiv.innerHTML;
};
