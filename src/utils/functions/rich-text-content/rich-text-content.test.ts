import { $createLineBreakNode, $createParagraphNode, $createTextNode, $getRoot, createEditor } from 'lexical';
import { $getRichTextContent, getRichTextContentFromHtml } from './rich-text-content';

describe('$getRichTextContent', () => {
    it('counts a line break and a paragraph boundary as one character each', () => {
        const editor = createEditor({
            onError: (error) => {
                throw error;
            },
        });
        editor.update(
            () => {
                $getRoot().append(
                    $createParagraphNode().append($createTextNode('ab'), $createLineBreakNode(), $createTextNode('c')),
                    $createParagraphNode().append($createTextNode('d')),
                );
            },
            { discrete: true },
        );

        expect(editor.getEditorState().read($getRichTextContent)).toBe('ab\nc\nd');
    });
});

describe('getRichTextContentFromHtml', () => {
    it.each([
        ['line breaks and paragraphs', '<p>ab<br>c</p><p>d</p>', 'ab\nc\nd'],
        ['line breaks at the start', '<p><br><br>тест коня</p>', '\n\nтест коня'],
        ['a <br> that ends a paragraph, which Lexical does not import', '<p>a<br><br></p>', 'a\n'],
        ['an empty paragraph', '<p><br></p>', ''],
        ['a line break inside formatting', '<p><strong>a<br></strong>b</p>', 'a\nb'],
        ['whitespace between paragraphs', '<p>a</p>\n<p>b</p>', 'a\nb'],
        ['text outside of paragraphs', 'a<strong>b</strong><p>c</p>d', 'ab\nc\nd'],
        ['an empty value', '', ''],
    ])('reads %s', (_, html, expected) => {
        expect(getRichTextContentFromHtml(html)).toBe(expected);
    });
});
