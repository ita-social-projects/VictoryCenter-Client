import { normalizeRichTextInitialHtml } from './richTextInitialHtml';

describe('normalizeRichTextInitialHtml', () => {
    it('keeps existing HTML unchanged', () => {
        expect(normalizeRichTextInitialHtml('<p>Horses with healing experience</p>')).toBe(
            '<p>Horses with healing experience</p>',
        );
    });

    it('keeps supported rich text HTML unchanged', () => {
        expect(normalizeRichTextInitialHtml('<p>First<br><strong>Second</strong></p>')).toBe(
            '<p>First<br><strong>Second</strong></p>',
        );
    });

    it('wraps plain text in a paragraph for Lexical import', () => {
        expect(normalizeRichTextInitialHtml('About us and who we are')).toBe('<p>About us and who we are</p>');
    });

    it('escapes supported tag substrings in plain text', () => {
        expect(normalizeRichTextInitialHtml('Use <br> literally')).toBe('<p>Use &lt;br&gt; literally</p>');
        expect(normalizeRichTextInitialHtml('Write <b>bold</b> in docs')).toBe(
            '<p>Write &lt;b&gt;bold&lt;/b&gt; in docs</p>',
        );
    });

    it('escapes plain text before wrapping it', () => {
        expect(normalizeRichTextInitialHtml('Victory <Centre> & partners')).toBe(
            '<p>Victory &lt;Centre&gt; &amp; partners</p>',
        );
    });

    it('preserves line breaks in plain text', () => {
        expect(normalizeRichTextInitialHtml('First line\nSecond line')).toBe('<p>First line<br>Second line</p>');
    });

    it('returns an empty paragraph for empty input', () => {
        expect(normalizeRichTextInitialHtml('')).toBe('<p></p>');
    });
});
