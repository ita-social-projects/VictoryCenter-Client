import { getPlainTextFromHtml } from './get-plain-text-from-html';

describe('getPlainTextFromHtml', () => {
    it('should return plain text when input is plain text', () => {
        const result = getPlainTextFromHtml('Sample Text');
        expect(result).toBe('Sample Text');
    });

    it('should extract text from simple HTML tags', () => {
        const result = getPlainTextFromHtml('<p>Sample Text</p>');
        expect(result).toBe('Sample Text');
    });

    it('should extract text from nested HTML tags', () => {
        const result = getPlainTextFromHtml('<div><p><strong>Important</strong> Message</p></div>');
        expect(result).toBe('Important Message');
    });

    it('should handle HTML with attributes', () => {
        const result = getPlainTextFromHtml('<p class="custom" data-id="123">Sample Text</p>');
        expect(result).toBe('Sample Text');
    });

    it('should handle empty string', () => {
        const result = getPlainTextFromHtml('');
        expect(result).toBe('');
    });

    it('should handle HTML with only tags and no text', () => {
        const result = getPlainTextFromHtml('<span></span>');
        expect(result).toBe('');
    });

    it('should preserve whitespace between text nodes', () => {
        const result = getPlainTextFromHtml('<span>First</span> <span>Second</span>');
        expect(result).toBe('First Second');
    });

    it('should handle HTML with line breaks', () => {
        const result = getPlainTextFromHtml('<p>First Line<br>Second Line</p>');
        expect(result).toBe('First LineSecond Line');
    });

    it('should handle HTML with multiple paragraphs', () => {
        const result = getPlainTextFromHtml('<p>Paragraph One</p><p>Paragraph Two</p>');
        expect(result).toBe('Paragraph OneParagraph Two');
    });

    it('should handle HTML with bold and italic tags', () => {
        const result = getPlainTextFromHtml('<p><strong>Strong</strong> and <em>Emphasis</em></p>');
        expect(result).toBe('Strong and Emphasis');
    });

    it('should handle HTML with special characters and entities', () => {
        const result = getPlainTextFromHtml('<p>Price &amp; Value &lt;100&gt;</p>');
        expect(result).toBe('Price & Value <100>');
    });

    it('should handle HTML with self-closing tags', () => {
        const result = getPlainTextFromHtml('<p>Before<img src="image.png">After</p>');
        expect(result).toBe('BeforeAfter');
    });

    it('should handle complex nested HTML structure', () => {
        const result = getPlainTextFromHtml(
            '<article><header><h1>Article Title</h1></header><section><p>Content with <strong>bold</strong> and <em>italic</em> formatting.</p></section></article>',
        );
        expect(result).toBe('Article TitleContent with bold and italic formatting.');
    });

    it('should handle HTML with comments', () => {
        const result = getPlainTextFromHtml('<p>Visible<!-- hidden comment -->Text</p>');
        expect(result).toBe('VisibleText');
    });

    it('should handle HTML with script tags', () => {
        const result = getPlainTextFromHtml('<p>Before<script>console.log("test");</script>After</p>');
        expect(result).toBe('Beforeconsole.log("test");After');
    });

    it('should handle HTML with style tags', () => {
        const result = getPlainTextFromHtml('<p>Before<style>.class { margin: 0; }</style>After</p>');
        expect(result).toBe('Before.class { margin: 0; }After');
    });

    it('should handle whitespace-only HTML', () => {
        const result = getPlainTextFromHtml('<p>   </p>');
        expect(result.trim()).toBe('');
    });

    it('should handle HTML entities', () => {
        const result = getPlainTextFromHtml('<p>&quot;Quoted Text&quot; &apos;Single Quote&apos;</p>');
        expect(result).toBe('"Quoted Text" \'Single Quote\'');
    });

    it('should handle HTML with links', () => {
        const result = getPlainTextFromHtml('<p>Visit <a href="https://example.com">Example</a> site</p>');
        expect(result).toBe('Visit Example site');
    });

    it('should handle HTML with lists', () => {
        const result = getPlainTextFromHtml('<ul><li>Item One</li><li>Item Two</li></ul>');
        expect(result).toBe('Item OneItem Two');
    });

    it('should handle HTML with headings', () => {
        const result = getPlainTextFromHtml('<h1>Main</h1><h2>Sub</h2><h3>Detail</h3>');
        expect(result).toBe('MainSubDetail');
    });

    it('should handle HTML with mixed formatting', () => {
        const result = getPlainTextFromHtml(
            '<p>Normal <strong>Bold <em>Bold Italic</em> Back Bold</strong> Normal</p>',
        );
        expect(result).toBe('Normal Bold Bold Italic Back Bold Normal');
    });

    it('should handle HTML with nested divs and spans', () => {
        const result = getPlainTextFromHtml('<div><div><span>Inner</span></div><div>Outer</div></div>');
        expect(result).toBe('InnerOuter');
    });

    it('should handle HTML with table structure', () => {
        const result = getPlainTextFromHtml(
            '<table><tr><td>Cell One</td><td>Cell Two</td></tr><tr><td>Cell Three</td><td>Cell Four</td></tr></table>',
        );
        expect(result).toBe('Cell OneCell TwoCell ThreeCell Four');
    });

    it('should handle HTML with form elements', () => {
        const result = getPlainTextFromHtml('<form><label>Name</label><input type="text"><button>Submit</button></form>');
        expect(result).toBe('NameSubmit');
    });
});
