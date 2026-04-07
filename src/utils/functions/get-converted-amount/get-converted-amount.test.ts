import { getConvertedAmount } from '@/utils/functions/get-converted-amount/get-converted-amount';

describe('getConvertedAmount', () => {
    it('returns USD when converting from UAH', () => {
        expect(getConvertedAmount('500000', 'amountUah', '42')).toBe('11904.77');
    });

    it('returns null when exchange rate is empty', () => {
        expect(getConvertedAmount('1000', 'amountUah', '')).toBeNull();
    });

    it('returns null when exchange rate is zero', () => {
        expect(getConvertedAmount('1000', 'amountUah', '0')).toBeNull();
    });

    it('returns value rounded up to two decimals for UAH to USD conversion', () => {
        expect(getConvertedAmount('100', 'amountUah', '3')).toBe('33.34');
    });

    it('should return null for empty or invalid source amount', () => {
        expect(getConvertedAmount('', 'amountUah', '40')).toBeNull();
        expect(getConvertedAmount('   ', 'amountUah', '40')).toBeNull();
        expect(getConvertedAmount('abc', 'amountUah', '40')).toBeNull();
    });
});
