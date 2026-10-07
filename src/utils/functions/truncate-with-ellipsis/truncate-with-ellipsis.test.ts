import { truncateWithEllipsis } from './truncate-with-ellipsis';

describe('truncateWithEllipsis', () => {
    it('returns the original text when it is shorter than maxLength', () => {
        expect(truncateWithEllipsis('Short title', 50)).toBe('Short title');
    });

    it('returns the original text when it is exactly maxLength', () => {
        const text = 'a'.repeat(50);
        expect(truncateWithEllipsis(text, 50)).toBe(text);
    });

    it('truncates and appends an ellipsis when the text exceeds maxLength', () => {
        const text = 'a'.repeat(51);
        expect(truncateWithEllipsis(text, 50)).toBe(`${'a'.repeat(50)}...`);
    });

    it('returns an empty string unchanged', () => {
        expect(truncateWithEllipsis('', 50)).toBe('');
    });

    it('handles non-Latin (Cyrillic) text correctly', () => {
        const text = 'Фестиваль '.repeat(10);
        const result = truncateWithEllipsis(text, 50);
        expect(result).toBe(`${text.slice(0, 50)}...`);
        expect(result.endsWith('...')).toBe(true);
    });

    it('handles maxLength of 0 by always appending an ellipsis to non-empty text', () => {
        expect(truncateWithEllipsis('abc', 0)).toBe('...');
    });
});
