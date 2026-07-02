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

const removeEditorArtifacts = (container: HTMLElement): void => {
    container.querySelectorAll('[class], [style]').forEach((el) => {
        el.removeAttribute('class');
        el.removeAttribute('style');
    });

    container.querySelectorAll('b > strong').forEach((strong) => {
        const bTag = strong.parentElement;
        if (bTag?.tagName === 'B') {
            bTag.replaceWith(strong);
        }
    });

    container.querySelectorAll('i > em').forEach((em) => {
        const iTag = em.parentElement;
        if (iTag?.tagName === 'I') {
            iTag.replaceWith(em);
        }
    });

    container.querySelectorAll('span').forEach((span) => {
        const parent = span.parentNode;
        while (span.firstChild) {
            parent?.insertBefore(span.firstChild, span);
        }
        span.remove();
    });
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

export const normalizeRichTextHtmlForComparison = (html: string): string => {
    const normalizedHtml = normalizeHtml(html);

    if (!normalizedHtml) return '';

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = normalizedHtml;
    removeEditorArtifacts(tempDiv);

    if (tempDiv.children.length === 0) {
        const paragraph = document.createElement('p');
        paragraph.textContent = normalizedHtml;
        tempDiv.textContent = '';
        tempDiv.appendChild(paragraph);
    }

    return tempDiv.innerHTML.replace(/>\s+</g, '><').trim();
};
