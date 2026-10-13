import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html';
import { $getRoot, $insertNodes, createEditor } from 'lexical';
import { registerSpaceNormalization } from '@/components/admin/rich-text-input/plugins/SpaceNormalizationPlugin';
import { sanitizeHtml } from '@/components/admin/rich-text-input/plugins/htmlSanitizer';
import { normalizeHtml, normalizeRichTextHtmlForComparison } from './normalize-html';

// Loads stored HTML the way RichTextInput does and returns what OnChangePlugin would emit.
const getEditorHtml = (html: string): string => {
    const editor = createEditor({
        onError: (error) => {
            throw error;
        },
    });
    editor.update(
        () => {
            const dom = new DOMParser().parseFromString(html, 'text/html');
            $getRoot().clear();
            $insertNodes($generateNodesFromDOM(editor, dom));
        },
        { discrete: true },
    );
    registerSpaceNormalization(editor);
    editor.update(() => {}, { discrete: true });

    return editor.getEditorState().read(() => sanitizeHtml($generateHtmlFromNodes(editor)));
};

describe('normalizeHtml', () => {
    it('returns the same string for plain text', () => {
        expect(normalizeHtml('Hello World')).toBe('Hello World');
    });

    it('returns the same string for clean single paragraph', () => {
        expect(normalizeHtml('<p>Text</p>')).toBe('<p>Text</p>');
    });

    it('trims trailing spaces before closing p tag', () => {
        expect(normalizeHtml('<p>Text  </p>')).toBe('<p>Text</p>');
    });

    it('trims trailing spaces for multiple paragraphs', () => {
        const input = '<p>First   </p><p>Second   </p>';
        const output = '<p>First</p><p>Second</p>';
        expect(normalizeHtml(input)).toBe(output);
    });

    it('returns empty string for empty input', () => {
        expect(normalizeHtml('')).toBe('');
    });

    it('returns empty string for whitespace-only input', () => {
        expect(normalizeHtml('   ')).toBe('');
    });

    it('keeps content between paragraphs intact', () => {
        const input = '<p>First   </p>\n  <p>Second   </p>';
        const output = '<p>First</p>\n  <p>Second</p>';
        expect(normalizeHtml(input)).toBe(output);
    });

    it('trims spaces after inline tags before closing p', () => {
        const input = '<p><strong>Bold</strong>   </p>';
        const output = '<p><strong>Bold</strong></p>';
        expect(normalizeHtml(input)).toBe(output);
    });

    it('preserves spaces between text and inline tags', () => {
        const input = '<p>Text <em>Italic</em> more</p>';
        expect(normalizeHtml(input)).toBe(input);
    });

    it('trims spaces after text with inline tags', () => {
        const input = '<p>Text <strong>Bold</strong>   </p>';
        const output = '<p>Text <strong>Bold</strong></p>';
        expect(normalizeHtml(input)).toBe(output);
    });

    it('trims nbsp symbols after text', () => {
        const input = '<p>Text &nbsp;</p>';
        const output = '<p>Text</p>';
        expect(normalizeHtml(input)).toBe(output);
    });

    it('trims whitespace characters wrapped in text formatting elements', () => {
        const input = '<p>Text <strong>   </strong></p>';
        const output = '<p>Text</p>';
        expect(normalizeHtml(input)).toBe(output);
    });

    it('preserves attributes during basic normalization', () => {
        const input = '<p class="editor-paragraph" style="margin: 0">Text</p>';
        expect(normalizeHtml(input)).toBe(input);
    });

    it('preserves spans during basic normalization', () => {
        const input = '<p><span>Text <strong>Bold</strong></span></p>';
        expect(normalizeHtml(input)).toBe(input);
    });

    it('preserves nested bold and italic tags during basic normalization', () => {
        const input = '<p><b><strong>Bold</strong></b> and <i><em>italic</em></i></p>';
        expect(normalizeHtml(input)).toBe(input);
    });

    it('normalizes plain text and equivalent rich text paragraphs the same for rich text comparison', () => {
        expect(normalizeRichTextHtmlForComparison('Text')).toBe('<p>Text</p>');
        expect(normalizeRichTextHtmlForComparison('<p class="editor">Text </p>')).toBe('<p>Text</p>');
    });

    it('removes editor-only wrappers for rich text comparison', () => {
        const input = '<p><span>Text <b><strong>Bold</strong></b> and <i><em>italic</em></i></span></p>';
        expect(normalizeRichTextHtmlForComparison(input)).toBe('<p>Text <strong>Bold</strong> and <em>italic</em></p>');
    });

    it('keeps nbsp and leading spaces for rich text comparison by default', () => {
        expect(normalizeRichTextHtmlForComparison('<p>A,&nbsp;b</p>')).not.toBe(
            normalizeRichTextHtmlForComparison('<p>A, b</p>'),
        );
    });

    it.each([
        ['nbsp between words', '<p>Учасники/ці,&nbsp;які вірять</p>'],
        ['leading nbsp', '<p>&nbsp;Партнери</p>'],
        ['leading space and nbsp', '<p> &nbsp;Благодійники/ці</p>'],
        ['repeated spaces', '<p>A &nbsp; &nbsp;b</p>'],
        ['space repeated across formatting', '<p>A <strong>&nbsp;B</strong></p>'],
        ['field-leading space split across formatting', '<p>&nbsp;<strong>&nbsp;Партнери</strong></p>'],
        ['formatting that only wraps a space', '<p>A <strong>&nbsp;</strong>B</p>'],
        ['leading nbsp in a later paragraph', '<p>A</p><p>&nbsp;B</p>'],
        ['leading nbsp after a line break', '<p>A<br>&nbsp;B</p>'],
    ])('matches what the editor makes of %s when collapsing spaces', (_, stored) => {
        expect(normalizeRichTextHtmlForComparison(stored, { collapseSpaces: true })).toBe(
            normalizeRichTextHtmlForComparison(getEditorHtml(stored), { collapseSpaces: true }),
        );
    });

    it('keeps a leading space in a later paragraph, as the editor does', () => {
        expect(normalizeRichTextHtmlForComparison('<p>A</p><p>&nbsp;B</p>', { collapseSpaces: true })).not.toBe(
            normalizeRichTextHtmlForComparison('<p>A</p><p>B</p>', { collapseSpaces: true }),
        );
    });

    it('preserves word boundaries when normalizing spaces', () => {
        expect(normalizeRichTextHtmlForComparison('<p>A b</p>', { collapseSpaces: true })).not.toBe(
            normalizeRichTextHtmlForComparison('<p>Ab</p>', { collapseSpaces: true }),
        );
    });

    it('preserves formatting differences for rich text comparison', () => {
        expect(normalizeRichTextHtmlForComparison('<p><strong>Text</strong></p>')).not.toBe(
            normalizeRichTextHtmlForComparison('<p><em>Text</em></p>'),
        );
    });
});
