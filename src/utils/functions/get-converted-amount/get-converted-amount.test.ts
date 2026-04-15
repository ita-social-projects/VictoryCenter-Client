import { getConvertedAmount } from '@/utils/functions/get-converted-amount/get-converted-amount';

describe('getConvertedAmount', () => {
    it('returns USD when converting from UAH', () => {
        expect(getConvertedAmount('500000', '42')).toBe('11904.77');
    });

    it('returns null when exchange rate is empty', () => {
        expect(getConvertedAmount('1000', '')).toBeNull();
    });

    it('returns null when exchange rate is zero', () => {
        expect(getConvertedAmount('1000', '0')).toBeNull();
    });

    it('returns value rounded up to two decimals for UAH to USD conversion', () => {
        expect(getConvertedAmount('100', '3')).toBe('33.34');
    });

    it('should return null for empty or invalid source amount', () => {
        expect(getConvertedAmount('', '40')).toBeNull();
        expect(getConvertedAmount('   ', '40')).toBeNull();
        expect(getConvertedAmount('abc', '40')).toBeNull();
    });
});
