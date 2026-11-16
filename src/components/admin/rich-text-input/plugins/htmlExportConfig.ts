import {
    $isLineBreakNode,
    DOMExportOutput,
    HTMLConfig,
    isHTMLElement,
    LexicalEditor,
    LexicalNode,
    ParagraphNode,
} from 'lexical';

// Lexical drops a <br> that ends a paragraph on import, so one more is exported to keep the line break.
const exportParagraph = (editor: LexicalEditor, node: LexicalNode): DOMExportOutput => {
    const paragraph = node as ParagraphNode;

    return {
        ...paragraph.exportDOM(editor),
        after: (element) => {
            if (isHTMLElement(element) && $isLineBreakNode(paragraph.getLastChild())) {
                element.append(document.createElement('br'));
            }
            return null;
        },
    };
};

export const HTML_EXPORT_CONFIG: HTMLConfig = {
    export: new Map([[ParagraphNode, exportParagraph]]),
};
