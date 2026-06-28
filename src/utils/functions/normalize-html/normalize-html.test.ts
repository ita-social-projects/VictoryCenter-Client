import { normalizeHtml, normalizeRichTextHtmlForComparison } from './normalize-html';

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
        expect(normalizeRichTextHtmlForComparison(input)).toBe(
            '<p>Text <strong>Bold</strong> and <em>italic</em></p>',
        );
    });

    it('preserves formatting differences for rich text comparison', () => {
        expect(normalizeRichTextHtmlForComparison('<p><strong>Text</strong></p>')).not.toBe(
            normalizeRichTextHtmlForComparison('<p><em>Text</em></p>'),
        );
    });
});
