import { getConvertedAmount } from '@/utils/functions/get-converted-amount/get-converted-amount';

describe('getConvertedAmount', () => {
    it('returns USD when converting from UAH', () => {
        expect(getConvertedAmount('500000', 'amountUah', '42')).toBe('11904.76');
    });

    it('returns UAH when converting from USD', () => {
        expect(getConvertedAmount('13500', 'amountUsd', '42')).toBe('567000');
    });

    it('returns null when exchange rate is empty', () => {
        expect(getConvertedAmount('1000', 'amountUah', '')).toBeNull();
    });

    it('returns null when exchange rate is zero', () => {
        expect(getConvertedAmount('1000', 'amountUah', '0')).toBeNull();
    });

    it('returns rounded value to two decimals', () => {
        expect(getConvertedAmount('100', 'amountUah', '3')).toBe('33.33');
    });

    it('should return null for empty or invalid source amount', () => {
        expect(getConvertedAmount('', 'amountUah', '40')).toBeNull();
        expect(getConvertedAmount('   ', 'amountUah', '40')).toBeNull();
        expect(getConvertedAmount('abc', 'amountUsd', '40')).toBeNull();
    });
});
