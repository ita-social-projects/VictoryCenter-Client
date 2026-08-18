import { formatSummaryAmount } from '@/utils/functions/format-summary-amount/format-summary-amount';

const normalizeSpaces = (value: string) => value.replace(/\u00a0/g, ' ');

describe('formatSummaryAmount', () => {
    it('should return empty string when value is undefined', () => {
        expect(formatSummaryAmount()).toBe('');
    });

    it('should format integer with thousand separators', () => {
        expect(normalizeSpaces(formatSummaryAmount(7265))).toBe('7 265');
    });

    it('should round decimals to nearest integer', () => {
        expect(normalizeSpaces(formatSummaryAmount(1249854.99))).toBe('1 249 855');
    });

    it('should round up on .9 values', () => {
        expect(formatSummaryAmount(9.9)).toBe('10');
    });

    it('should round up on .5 boundary values', () => {
        expect(formatSummaryAmount(9.5)).toBe('10');
    });

    it('should round down on values below .5 boundary', () => {
        expect(formatSummaryAmount(9.49)).toBe('9');
    });
});
