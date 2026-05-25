import {
    formatCurrencyInput,
    formatNumberDecimalComma,
    formatNumberInput,
    formatWithSpaces,
} from '@/utils/functions/formatters/format-number';

describe('format-number formatters', () => {
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

    describe('formatWithSpaces', () => {
        it('formats numbers with spaces as thousands separators', () => {
            expect(formatWithSpaces(1000)).toBe('1 000');
            expect(formatWithSpaces(1234567)).toBe('1 234 567');
            expect(formatWithSpaces('987654321')).toBe('987 654 321');
        });

        it('handles zero correctly', () => {
            expect(formatWithSpaces(0)).toBe('0');
            expect(formatWithSpaces('0')).toBe('0');
        });

        it('preserves fractional parts without rounding', () => {
            expect(formatWithSpaces(1234.5678)).toBe('1 234.5678');
            expect(formatWithSpaces('9876.54321')).toBe('9 876.54321');
        });

        it('returns empty string for invalid numeric strings', () => {
            expect(formatWithSpaces('abc')).toBe('');
            expect(formatWithSpaces('12a')).toBe('');
            expect(formatWithSpaces('NaN')).toBe('');
        });
    });

    describe('formatNumberInput', () => {
        it('formats strings with only digits', () => {
            expect(formatNumberInput('1234')).toBe('1 234');
            expect(formatNumberInput('1234567')).toBe('1 234 567');
        });

        it('removes non-digit characters before formatting', () => {
            expect(formatNumberInput('12a34')).toBe('1 234');
            expect(formatNumberInput('12 34')).toBe('1 234');
            expect(formatNumberInput('a-1b.2_3')).toBe('123');
        });

        it('returns empty string if input contains no digits or is empty', () => {
            expect(formatNumberInput('')).toBe('');
            expect(formatNumberInput('abc')).toBe('');
            expect(formatNumberInput('!@#$')).toBe('');
        });
    });

    describe('formatCurrencyInput', () => {
        it('returns the string unchanged if it contains letters', () => {
            expect(formatCurrencyInput('abc')).toBe('abc');
            expect(formatCurrencyInput('12abc')).toBe('12abc');
            expect(formatCurrencyInput('1a2')).toBe('1a2');
        });

        it('formats integers with spaces as thousands separators', () => {
            expect(formatCurrencyInput('1000')).toBe('1 000');
            expect(formatCurrencyInput('1234567')).toBe('1 234 567');
        });

        it('replaces comma with dot before formatting', () => {
            expect(formatCurrencyInput('1000,50')).toBe('1 000.50');
            expect(formatCurrencyInput('999,9')).toBe('999.9');
        });

        it('truncates the decimal part to 2 decimal places', () => {
            expect(formatCurrencyInput('100.999')).toBe('100.99');
            expect(formatCurrencyInput('1.1234')).toBe('1.12');
        });

        it('ignores extra periods (more than one)', () => {
            expect(formatCurrencyInput('1.2.3')).toBe('1.23');
        });

        it('returns empty string for empty input', () => {
            expect(formatCurrencyInput('')).toBe('');
        });

        it('correctly handles spaces in the input (considered valid)', () => {
            expect(formatCurrencyInput('1 000')).toBe('1 000');
        });
    });
});
