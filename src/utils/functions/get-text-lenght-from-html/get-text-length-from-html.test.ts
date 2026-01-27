import { getTextLengthFromHtml } from './get-text-length-from-html';

describe('getTextLengthFromHtml', () => {
    it('should return length of plain text when input is plain text', () => {
        const result = getTextLengthFromHtml('Hello World');
        expect(result).toBe(11);
    });

    it('should return length of text extracted from simple HTML tags', () => {
        const result = getTextLengthFromHtml('<p>Hello World</p>');
        expect(result).toBe(11);
    });

    it('should return length of text from nested HTML tags', () => {
        const result = getTextLengthFromHtml('<div><p><strong>Bold</strong> Text</p></div>');
        expect(result).toBe(9);
    });

    it('should handle HTML with attributes', () => {
        const result = getTextLengthFromHtml('<p class="test" id="myId">Hello World</p>');
        expect(result).toBe(11);
    });

    it('should return 0 for empty string', () => {
        const result = getTextLengthFromHtml('');
        expect(result).toBe(0);
    });

    it('should return 0 for HTML with only tags and no text', () => {
        const result = getTextLengthFromHtml('<div></div>');
        expect(result).toBe(0);
    });

    it('should count whitespace between text nodes', () => {
        const result = getTextLengthFromHtml('<p>Hello</p> <p>World</p>');
        expect(result).toBe(11);
    });

    it('should remove newline characters from count', () => {
        const result = getTextLengthFromHtml('<p>Line 1<br>Line 2</p>');
        expect(result).toBe(12);
    });

    it('should handle HTML with multiple paragraphs', () => {
        const result = getTextLengthFromHtml('<p>First paragraph</p><p>Second paragraph</p>');
        expect(result).toBe(31);
    });

    it('should handle HTML with bold and italic tags', () => {
        const result = getTextLengthFromHtml('<p><strong>Bold</strong> and <em>Italic</em></p>');
        expect(result).toBe(15);
    });

    it('should handle HTML with special characters', () => {
        const result = getTextLengthFromHtml('<p>Hello &amp; World &lt;test&gt;</p>');
        expect(result).toBe(20);
    });

    it('should handle HTML with self-closing tags', () => {
        const result = getTextLengthFromHtml('<p>Text<img src="test.jpg">More text</p>');
        expect(result).toBe(13);
    });

    it('should handle complex nested HTML structure', () => {
        const result = getTextLengthFromHtml(
            '<div><h1>Title</h1><p>Paragraph with <strong>bold</strong> and <em>italic</em> text.</p></div>',
        );
        expect(result).toBe(41);
    });

    it('should preserve newline characters in text and count them', () => {
        const result = getTextLengthFromHtml('<p>Line 1\nLine 2\nLine 3</p>');
        expect(result).toBe(20);
    });

    it('should handle HTML with line breaks and preserve other whitespace', () => {
        const result = getTextLengthFromHtml('<p>Text   with   spaces\nand\nnewlines</p>');
        expect(result).toBe(33);
    });

    it('should handle HTML with comments', () => {
        const result = getTextLengthFromHtml('<p>Text<!-- comment -->More text</p>');
        expect(result).toBe(13);
    });

    it('should handle HTML with script tags', () => {
        const result = getTextLengthFromHtml('<p>Text<script>alert("test");</script>More text</p>');
        expect(result).toBe(13);
    });

    it('should handle HTML with style tags', () => {
        const result = getTextLengthFromHtml('<p>Text<style>body { color: red; }</style>More text</p>');
        expect(result).toBe(13);
    });

    it('should count whitespace in HTML', () => {
        const result = getTextLengthFromHtml('<p>   </p>');
        expect(result).toBe(3);
    });

    it('should handle HTML entities', () => {
        const result = getTextLengthFromHtml('<p>&quot;Quote&quot; &apos;Apostrophe&apos;</p>');
        expect(result).toBe(20);
    });

    it('should handle mixed newlines and HTML tags', () => {
        const result = getTextLengthFromHtml('<p>Text\nwith\n<strong>bold</strong>\ncontent</p>');
        expect(result).toBe(22);
    });

    it('should return correct length for single character', () => {
        const result = getTextLengthFromHtml('<p>A</p>');
        expect(result).toBe(1);
    });

    it('should handle HTML with only whitespace and newlines', () => {
        const result = getTextLengthFromHtml('<p>   \n   \n   </p>');
        expect(result).toBe(11);
    });
});
