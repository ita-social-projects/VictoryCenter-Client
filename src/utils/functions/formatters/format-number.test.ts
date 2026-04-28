import { formatNumberDecimalComma } from '@/utils/functions/formatters/format-number';

describe('formatNumberDecimalComma', () => {
    it('returns empty string for null and undefined', () => {
        expect(formatNumberDecimalComma(null)).toBe('');
        expect(formatNumberDecimalComma(undefined)).toBe('');
    });

    it('formats numbers and strings with dot to comma', () => {
        expect(formatNumberDecimalComma(123)).toBe('123');
        expect(formatNumberDecimalComma(123.45)).toBe('123,45');
        expect(formatNumberDecimalComma('1000.5')).toBe('1000,5');
        // only the first dot is replaced (keeps previous behaviour)
        expect(formatNumberDecimalComma('1.2.3')).toBe('1,2.3');
    });

    it('leaves strings without dot unchanged', () => {
        expect(formatNumberDecimalComma('1000')).toBe('1000');
    });
});
