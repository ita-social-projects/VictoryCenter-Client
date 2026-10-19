import { useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getRoot, $getSelection, $isRangeSelection, $isTextNode, LexicalEditor, TextNode } from 'lexical';
import { endsWithSpace, normalizeSpaces, startsWithSpace } from '@/utils/functions/normalize-spaces/normalize-spaces';

const isFirstTextNodeInField = (node: TextNode) => node.is($getRoot().getFirstDescendant());

const $normalizeTextNode = (node: TextNode) => {
    const text = node.getTextContent();
    const next = node.getNextSibling();
    if (endsWithSpace(text) && $isTextNode(next) && startsWithSpace(next.getTextContent())) {
        next.markDirty();
    }

    const previous = node.getPreviousSibling();
    const stripLeading =
        isFirstTextNodeInField(node) || ($isTextNode(previous) && endsWithSpace(previous.getTextContent()));
    const normalized = normalizeSpaces(text, stripLeading);

    if (normalized === text) return;

    const selection = $getSelection();
    const pointsInNode = $isRangeSelection(selection)
        ? [selection.anchor, selection.focus].filter((point) => point.key === node.getKey() && point.type === 'text')
        : [];
    const newOffsets = pointsInNode.map((point) => normalizeSpaces(text.slice(0, point.offset), stripLeading).length);

    node.setTextContent(normalized);
    pointsInNode.forEach((point, i) => point.set(node.getKey(), newOffsets[i], 'text'));
};

export const registerSpaceNormalization = (editor: LexicalEditor) =>
    editor.registerNodeTransform(TextNode, $normalizeTextNode);

export const SpaceNormalizationPlugin = () => {
    const [editor] = useLexicalComposerContext();

    useEffect(() => registerSpaceNormalization(editor), [editor]);

    return null;
};
