import { isUsdAmountMismatch } from '@/utils/functions/validate-usd-amount-mismatch/validate-usd-amount-mismatch';

describe('isUsdAmountMismatch', () => {
    it('returns false when USD matches UAH conversion rounded to two decimals', () => {
        expect(isUsdAmountMismatch('100', '2.38', '42')).toBe(false);
    });

    it('returns true when USD does not match UAH conversion', () => {
        expect(isUsdAmountMismatch('100', '2.35', '42')).toBe(true);
    });

    it('returns false when values are incomplete or invalid', () => {
        expect(isUsdAmountMismatch('', '2.39', '42')).toBe(false);
        expect(isUsdAmountMismatch('100', '', '42')).toBe(false);
        expect(isUsdAmountMismatch('100', '2.39', null)).toBe(false);
        expect(isUsdAmountMismatch('abc', '2.39', '42')).toBe(false);
    });

    it('supports spaces and comma decimal separator', () => {
        expect(isUsdAmountMismatch('1 000,5', '23,82', '42')).toBe(false);
    });
});
