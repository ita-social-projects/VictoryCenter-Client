import { formatSummaryAmount } from '@/utils/functions/format-summary-amount/format-summary-amount';

describe('formatSummaryAmount', () => {
    it('should return empty string when value is undefined', () => {
        expect(formatSummaryAmount()).toBe('');
    });

    it('should format integer with thousand separators', () => {
        expect(formatSummaryAmount(7265)).toBe('7 265');
    });

    it('should round decimals to nearest integer', () => {
        expect(formatSummaryAmount(1249854.99)).toBe('1 249 855');
    });

    it('should round up on .9 values', () => {
        expect(formatSummaryAmount(9.9)).toBe('10');
    });
});
