import { $getRoot } from 'lexical';

export const LINE_BREAK = '\n';

export const $getRichTextContent = (): string =>
    $getRoot()
        .getChildren()
        .map((node) => node.getTextContent())
        .join(LINE_BREAK);

const isParagraph = (node: Node | null) => node?.nodeName === 'P';

// Lexical drops a <br> that ends a paragraph on import.
const isIgnoredLineBreak = (node: Node) => isParagraph(node.parentNode) && node === node.parentNode?.lastChild;

const isWhitespaceText = (node: Node) => node.nodeType === Node.TEXT_NODE && !node.textContent?.trim();

const getInlineText = (node: Node): string => {
    if (node.nodeType === Node.TEXT_NODE) return node.textContent ?? '';
    if (node.nodeName === 'BR') return isIgnoredLineBreak(node) ? '' : LINE_BREAK;
    return Array.from(node.childNodes, getInlineText).join('');
};

export const getRichTextContentFromHtml = (html: string): string => {
    const { body } = new DOMParser().parseFromString(html, 'text/html');

    const lines: string[] = [];
    let inlineText: string | null = null;

    for (const node of Array.from(body.childNodes)) {
        if (isParagraph(node)) {
            if (inlineText !== null) lines.push(inlineText);
            inlineText = null;
            lines.push(getInlineText(node));
        } else if (!isWhitespaceText(node)) {
            inlineText = (inlineText ?? '') + getInlineText(node);
        }
    }
    if (inlineText !== null) lines.push(inlineText);

    return lines.join(LINE_BREAK);
};
