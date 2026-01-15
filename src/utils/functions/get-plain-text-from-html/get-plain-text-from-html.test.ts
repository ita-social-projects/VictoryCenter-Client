import { getPlainTextFromHtml } from './get-plain-text-from-html';

describe('getPlainTextFromHtml', () => {
    // Test cases with standard assertions
    test.each([
        ['plain text input', 'Sample Text', 'Sample Text'],
        ['simple HTML tags', '<p>Sample Text</p>', 'Sample Text'],
        ['nested HTML tags', '<div><p><strong>Important</strong> Message</p></div>', 'Important Message'],
        ['HTML with attributes', '<p class="custom" data-id="123">Sample Text</p>', 'Sample Text'],
        ['empty string', '', ''],
        ['HTML with only tags and no text', '<span></span>', ''],
        ['whitespace between text nodes', '<span>First</span> <span>Second</span>', 'First Second'],
        ['HTML with line breaks', '<p>First Line<br>Second Line</p>', 'First LineSecond Line'],
        ['HTML with multiple paragraphs', '<p>Paragraph One</p><p>Paragraph Two</p>', 'Paragraph OneParagraph Two'],
        [
            'HTML with bold and italic tags',
            '<p><strong>Strong</strong> and <em>Emphasis</em></p>',
            'Strong and Emphasis',
        ],
        ['HTML with special characters and entities', '<p>Price &amp; Value &lt;100&gt;</p>', 'Price & Value <100>'],
        ['HTML with self-closing tags', '<p>Before<img src="image.png">After</p>', 'BeforeAfter'],
        [
            'complex nested HTML structure',
            '<article><header><h1>Article Title</h1></header><section><p>Content with <strong>bold</strong> and <em>italic</em> formatting.</p></section></article>',
            'Article TitleContent with bold and italic formatting.',
        ],
        ['HTML with comments', '<p>Visible<!-- hidden comment -->Text</p>', 'VisibleText'],
        ['HTML with script tags', '<p>Before<script>console.log("test");</script>After</p>', 'BeforeAfter'],
        ['HTML with style tags', '<p>Before<style>.class { margin: 0; }</style>After</p>', 'BeforeAfter'],
        ['HTML entities', '<p>&quot;Quoted Text&quot; &apos;Single Quote&apos;</p>', '"Quoted Text" \'Single Quote\''],
        ['HTML with links', '<p>Visit <a href="https://example.com">Example</a> site</p>', 'Visit Example site'],
        ['HTML with lists', '<ul><li>Item One</li><li>Item Two</li></ul>', 'Item OneItem Two'],
        ['HTML with headings', '<h1>Main</h1><h2>Sub</h2><h3>Detail</h3>', 'MainSubDetail'],
        [
            'HTML with mixed formatting',
            '<p>Normal <strong>Bold <em>Bold Italic</em> Back Bold</strong> Normal</p>',
            'Normal Bold Bold Italic Back Bold Normal',
        ],
        ['HTML with nested divs and spans', '<div><div><span>Inner</span></div><div>Outer</div></div>', 'InnerOuter'],
        [
            'HTML with table structure',
            '<table><tr><td>Cell One</td><td>Cell Two</td></tr><tr><td>Cell Three</td><td>Cell Four</td></tr></table>',
            'Cell OneCell TwoCell ThreeCell Four',
        ],
        [
            'HTML with form elements',
            '<form><label>Name</label><input type="text"><button>Submit</button></form>',
            'NameSubmit',
        ],
    ])('should handle %s', (_description, input, expected) => {
        const result = getPlainTextFromHtml(input);
        expect(result).toBe(expected);
    });

    // Special case test that uses .trim() assertion
    it('should handle whitespace-only HTML', () => {
        const result = getPlainTextFromHtml('<p>   </p>');
        expect(result.trim()).toBe('');
    });
});
