import { endsWithSpace, normalizeSpaces } from '@/utils/functions/normalize-spaces/normalize-spaces';

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

const INLINE_FORMATS = new Set(['STRONG', 'EM', 'B', 'I']);

const isTextRunBoundary = (node: Node) => !INLINE_FORMATS.has(node.nodeName);

const isBlank = (node: Node) => !(node.textContent ?? '').trim();

// Mirrors removeEmptyTags in the editor's sanitizer.
const removeBlankElements = (container: HTMLElement): void => {
    container.querySelectorAll('strong, em, b, i').forEach((el) => {
        if (isBlank(el)) el.replaceWith(document.createTextNode(el.textContent ?? ''));
    });

    container.querySelectorAll('p').forEach((p) => {
        if (isBlank(p)) p.remove();
    });
};

const isBlockElement = (node: Node | null) =>
    node?.nodeType === Node.ELEMENT_NODE && isTextRunBoundary(node) && node.nodeName !== 'BR';

const HAS_SOURCE_WHITESPACE = /[\t\r\n]/;
const SOURCE_WHITESPACE = /[ \t\r\n]*[\t\r\n][ \t\r\n]*/g;
const LEADING_SOURCE_WHITESPACE = /^[ \t\r\n]*[\t\r\n][ \t\r\n]*/;
const TRAILING_SOURCE_WHITESPACE = /[ \t\r\n]*[\t\r\n][ \t\r\n]*$/;

const isLineEdge = (sibling: Node | null, parent: Node | null) =>
    sibling ? isBlockElement(sibling) || sibling.nodeName === 'BR' : isBlockElement(parent);

// The editor never outputs newlines or tabs, so these come from formatted HTML source.
const collapseSourceWhitespace = (container: HTMLElement): void => {
    const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
    const textNodes: Node[] = [];

    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        if (HAS_SOURCE_WHITESPACE.test(node.textContent ?? '')) textNodes.push(node);
    }

    textNodes.forEach((node) => {
        let text = node.textContent ?? '';
        if (isLineEdge(node.previousSibling, node.parentNode)) text = text.replace(LEADING_SOURCE_WHITESPACE, '');
        if (isLineEdge(node.nextSibling, node.parentNode)) text = text.replace(TRAILING_SOURCE_WHITESPACE, '');
        text = text.replace(SOURCE_WHITESPACE, ' ');

        if (text) {
            node.textContent = text;
        } else {
            node.parentNode?.removeChild(node);
        }
    });
};

const removeWhitespaceBetweenBlocks = (container: HTMLElement): void => {
    const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
    const whitespaceNodes: Node[] = [];

    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        const { previousSibling, nextSibling, parentNode } = node;
        if (
            isBlank(node) &&
            !INLINE_FORMATS.has(parentNode?.nodeName ?? '') &&
            (!previousSibling || isBlockElement(previousSibling)) &&
            (!nextSibling || isBlockElement(nextSibling))
        ) {
            whitespaceNodes.push(node);
        }
    }

    whitespaceNodes.forEach((node) => node.parentNode?.removeChild(node));
};

const removeEmptyBranch = (node: Node, container: Node): void => {
    let current: Node | null = node;

    while (current && current !== container) {
        const parent: Node | null = current.parentNode;
        current.parentNode?.removeChild(current);
        current = parent && parent.childNodes.length === 0 ? parent : null;
    }
};

// Must produce the same text as SpaceNormalizationPlugin does in the editor.
const applyEditorSpaceRules = (container: HTMLElement): void => {
    const walker = document.createTreeWalker(container, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
    const nodes: Node[] = [];

    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        nodes.push(node);
    }

    // The editor strips leading spaces only from the field's first descendant.
    let atFieldStart = true;
    const leadingBoundaries: Node[] = [];
    let previousEndsWithSpace = false;

    nodes.forEach((node) => {
        if (node.nodeType !== Node.TEXT_NODE) {
            if (isTextRunBoundary(node)) {
                previousEndsWithSpace = false;
                if (atFieldStart) leadingBoundaries.push(node);
            }
            return;
        }

        const isFirstDescendant = atFieldStart && leadingBoundaries.every((boundary) => boundary.contains(node));
        const text = normalizeSpaces(node.textContent ?? '', isFirstDescendant || previousEndsWithSpace);

        if (!text) {
            removeEmptyBranch(node, container);
            return;
        }

        node.textContent = text;
        atFieldStart = false;
        previousEndsWithSpace = endsWithSpace(text);
    });
};

export interface RichTextComparisonOptions {
    collapseSpaces?: boolean;
}

export const normalizeRichTextHtmlForComparison = (
    html: string,
    { collapseSpaces = false }: RichTextComparisonOptions = {},
): string => {
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

    removeBlankElements(tempDiv);
    collapseSourceWhitespace(tempDiv);
    removeWhitespaceBetweenBlocks(tempDiv);

    if (collapseSpaces) {
        applyEditorSpaceRules(tempDiv);
    }

    return tempDiv.innerHTML.trim();
};
