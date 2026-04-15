import { normalizeHtml } from './normalize-html';

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
});
