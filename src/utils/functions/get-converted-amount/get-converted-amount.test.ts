import { getConvertedAmount } from '@/utils/functions/get-converted-amount/get-converted-amount';

describe('getConvertedAmount', () => {
    it('returns USD when converting from UAH', () => {
        expect(getConvertedAmount('500000', '42')).toBe('11904,76');
    });

    it('returns null when exchange rate is empty', () => {
        expect(getConvertedAmount('1000', '')).toBeNull();
    });

    it('returns null when exchange rate is zero', () => {
        expect(getConvertedAmount('1000', '0')).toBeNull();
    });

    it('returns value rounded to two decimals for UAH to USD conversion', () => {
        expect(getConvertedAmount('100', '3')).toBe('33,33');
    });

    it('rounds half up when the third decimal is exactly 5', () => {
        expect(getConvertedAmount('89', '40')).toBe('2,23');
    });

    it('rounds down when the third decimal is less than 5', () => {
        expect(getConvertedAmount('100', '45')).toBe('2,22');
    });

    it('rounds half up when floating-point division introduces representation error (100.5 / 100 = 1.005)', () => {
        expect(getConvertedAmount('100.5', '100')).toBe('1,01');
    });

    it('should return null for empty or invalid source amount', () => {
        expect(getConvertedAmount('', '40')).toBeNull();
        expect(getConvertedAmount('   ', '40')).toBeNull();
        expect(getConvertedAmount('abc', '40')).toBeNull();
    });
});
