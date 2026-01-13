import { getPlainTextFromHtml } from './get-plain-text-from-html';

describe('getPlainTextFromHtml', () => {
    it('should return plain text when input is plain text', () => {
        const result = getPlainTextFromHtml('Hello World 2');
        expect(result).toBe('Hello World 2');
    });

    it('should extract text from simple HTML tags', () => {
        const result = getPlainTextFromHtml('<p>Hello World 2</p>');
        expect(result).toBe('Hello World 2');
    });

    it('should extract text from nested HTML tags', () => {
        const result = getPlainTextFromHtml('<div><p><strong>Bold</strong> Text 2</p></div>');
        expect(result).toBe('Bold Text 2');
    });

    it('should handle HTML with attributes', () => {
        const result = getPlainTextFromHtml('<p class="test" id="myId">Hello World 2</p>');
        expect(result).toBe('Hello World 2');
    });

    it('should handle empty string', () => {
        const result = getPlainTextFromHtml('');
        expect(result).toBe('');
    });

    it('should handle HTML with only tags and no text', () => {
        const result = getPlainTextFromHtml('<div></div>');
        expect(result).toBe('');
    });

    it('should preserve whitespace between text nodes', () => {
        const result = getPlainTextFromHtml('<p>Hello 2</p> <p>World 2</p>');
        expect(result).toBe('Hello 2 World 2');
    });

    it('should handle HTML with line breaks', () => {
        const result = getPlainTextFromHtml('<p>Line 1 2<br>Line 2 2</p>');
        expect(result).toBe('Line 1 2Line 2 2');
    });

    it('should handle HTML with multiple paragraphs', () => {
        const result = getPlainTextFromHtml('<p>First paragraph 2</p><p>Second paragraph 2</p>');
        expect(result).toBe('First paragraph 2Second paragraph 2');
    });

    it('should handle HTML with bold and italic tags', () => {
        const result = getPlainTextFromHtml('<p><strong>Bold 2</strong> and <em>Italic 2</em></p>');
        expect(result).toBe('Bold 2 and Italic 2');
    });

    it('should handle HTML with special characters', () => {
        const result = getPlainTextFromHtml('<p>Hello &amp; World &lt;test 2&gt;</p>');
        expect(result).toBe('Hello & World <test 2>');
    });

    it('should handle HTML with self-closing tags', () => {
        const result = getPlainTextFromHtml('<p>Text<img src="test.jpg">More text 2</p>');
        expect(result).toBe('TextMore text 2');
    });

    it('should handle complex nested HTML structure', () => {
        const result = getPlainTextFromHtml(
            '<div><h1>Title 2</h1><p>Paragraph with <strong>bold 2</strong> and <em>italic 2</em> text 2.</p></div>',
        );
        expect(result).toBe('Title 2Paragraph with bold 2 and italic 2 text 2.');
    });

    it('should handle HTML with comments', () => {
        const result = getPlainTextFromHtml('<p>Text<!-- comment -->More text 2</p>');
        expect(result).toBe('TextMore text 2');
    });

    it('should handle HTML with script tags', () => {
        const result = getPlainTextFromHtml('<p>Text<script>alert("test");</script>More text 2</p>');
        expect(result).toBe('Textalert("test");More text 2');
    });

    it('should handle HTML with style tags', () => {
        const result = getPlainTextFromHtml('<p>Text<style>body { color: red; }</style>More text 2</p>');
        expect(result).toBe('Textbody { color: red; }More text 2');
    });

    it('should return empty string for whitespace-only HTML', () => {
        const result = getPlainTextFromHtml('<p>   </p>');
        expect(result.trim()).toBe('');
    });

    it('should handle HTML entities', () => {
        const result = getPlainTextFromHtml('<p>&quot;Quote 2&quot; &apos;Apostrophe 2&apos;</p>');
        expect(result).toBe('"Quote 2" \'Apostrophe 2\'');
    });
});
