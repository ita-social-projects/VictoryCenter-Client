import { getPlainTextFromHtml } from './get-plain-text-from-html';

describe('getPlainTextFromHtml', () => {
    it('should return plain text when input is plain text', () => {
        const result = getPlainTextFromHtml('Hello World');
        expect(result).toBe('Hello World');
    });

    it('should extract text from simple HTML tags', () => {
        const result = getPlainTextFromHtml('<p>Hello World</p>');
        expect(result).toBe('Hello World');
    });

    it('should extract text from nested HTML tags', () => {
        const result = getPlainTextFromHtml('<div><p><strong>Bold</strong> Text</p></div>');
        expect(result).toBe('Bold Text');
    });

    it('should handle HTML with attributes', () => {
        const result = getPlainTextFromHtml('<p class="test" id="myId">Hello World</p>');
        expect(result).toBe('Hello World');
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
        const result = getPlainTextFromHtml('<p>Hello</p> <p>World</p>');
        expect(result).toBe('Hello World');
    });

    it('should handle HTML with line breaks', () => {
        const result = getPlainTextFromHtml('<p>Line 1<br>Line 2</p>');
        expect(result).toBe('Line 1Line 2');
    });

    it('should handle HTML with multiple paragraphs', () => {
        const result = getPlainTextFromHtml('<p>First paragraph</p><p>Second paragraph</p>');
        expect(result).toBe('First paragraphSecond paragraph');
    });

    it('should handle HTML with bold and italic tags', () => {
        const result = getPlainTextFromHtml('<p><strong>Bold</strong> and <em>Italic</em></p>');
        expect(result).toBe('Bold and Italic');
    });

    it('should handle HTML with special characters', () => {
        const result = getPlainTextFromHtml('<p>Hello &amp; World &lt;test&gt;</p>');
        expect(result).toBe('Hello & World <test>');
    });

    it('should handle HTML with self-closing tags', () => {
        const result = getPlainTextFromHtml('<p>Text<img src="test.jpg">More text</p>');
        expect(result).toBe('TextMore text');
    });

    it('should handle complex nested HTML structure', () => {
        const result = getPlainTextFromHtml(
            '<div><h1>Title</h1><p>Paragraph with <strong>bold</strong> and <em>italic</em> text.</p></div>',
        );
        expect(result).toBe('TitleParagraph with bold and italic text.');
    });

    it('should handle HTML with comments', () => {
        const result = getPlainTextFromHtml('<p>Text<!-- comment -->More text</p>');
        expect(result).toBe('TextMore text');
    });

    it('should handle HTML with script tags', () => {
        const result = getPlainTextFromHtml('<p>Text<script>alert("test");</script>More text</p>');
        expect(result).toBe('Textalert("test");More text');
    });

    it('should handle HTML with style tags', () => {
        const result = getPlainTextFromHtml('<p>Text<style>body { color: red; }</style>More text</p>');
        expect(result).toBe('Textbody { color: red; }More text');
    });

    it('should return empty string for whitespace-only HTML', () => {
        const result = getPlainTextFromHtml('<p>   </p>');
        expect(result.trim()).toBe('');
    });

    it('should handle HTML entities', () => {
        const result = getPlainTextFromHtml('<p>&quot;Quote&quot; &apos;Apostrophe&apos;</p>');
        expect(result).toBe('"Quote" \'Apostrophe\'');
    });
});
