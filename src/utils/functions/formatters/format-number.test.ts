import {
    formatCurrencyInput,
    formatNumberDecimalComma,
    formatNumberInput,
    formatWithSpaces,
    normalizeFormattedNumber,
    parseFormattedNumber,
} from '@/utils/functions/formatters/format-number';

const expectFormatCases = (formatter: (value: string) => string, cases: Array<[string, string]>) => {
    cases.forEach(([input, expected]) => {
        expect(formatter(input)).toBe(expected);
    });
};

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
            expect(formatNumberDecimalComma('1.2.3')).toBe('1,2,3');
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
        const formatCurrencyInputCases: Array<{
            description: string;
            cases: Array<[input: string, expected: string]>;
        }> = [
            {
                description: 'removes invalid characters before formatting',
                cases: [
                    ['abc', ''],
                    ['12abc', '12'],
                    ['1a2', '12'],
                ],
            },
            {
                description: 'formats integers with spaces as thousands separators',
                cases: [
                    ['1000', '1 000'],
                    ['1234567', '1 234 567'],
                ],
            },
            {
                description: 'replaces comma with dot before formatting',
                cases: [
                    ['1000,50', '1 000.50'],
                    ['999,9', '999.9'],
                    ['1,2,3', '1.23'],
                ],
            },
            {
                description: 'truncates the decimal part to 2 decimal places',
                cases: [
                    ['100.999', '100.99'],
                    ['1.1234', '1.12'],
                ],
            },
            {
                description: 'ignores extra periods more than one',
                cases: [['1.2.3', '1.23']],
            },
        ];

        it.each(formatCurrencyInputCases)('$description', ({ cases }) => {
            expectFormatCases(formatCurrencyInput, cases);
        });
    });

    describe('formatted number parsing', () => {
        it('normalizes spaces and comma separators', () => {
            expect(normalizeFormattedNumber('1 234,50')).toBe('1234.50');
        });

        it('parses valid formatted decimal numbers', () => {
            expect(parseFormattedNumber('1 234,50')).toBe(1234.5);
            expect(parseFormattedNumber('1 234.50')).toBe(1234.5);
            expect(parseFormattedNumber('-1 234.50')).toBe(-1234.5);
        });

        it('returns null for malformed values', () => {
            expect(parseFormattedNumber('1.2.3')).toBeNull();
            expect(parseFormattedNumber('abc')).toBeNull();
        });
    });
});
