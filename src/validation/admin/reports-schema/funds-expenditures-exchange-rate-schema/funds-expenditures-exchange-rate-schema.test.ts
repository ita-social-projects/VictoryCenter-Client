import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { FUNDS_EXPENDITURES_TEXT } from '@/const/admin/reports';
import {
    normalizeFundsExpendituresExchangeRateInput,
    validateFundsExpendituresExchangeRate,
} from './funds-expenditures-exchange-rate-schema';

describe('funds-expenditures-exchange-rate-schema', () => {
    describe('normalizeFundsExpendituresExchangeRateInput', () => {
        it('removes spaces from input', () => {
            expect(normalizeFundsExpendituresExchangeRateInput(' 4 2. 1 2 ')).toBe('42,12');
        });

        it('trims value when trimEnd is true', () => {
            expect(normalizeFundsExpendituresExchangeRateInput(' 42.12 ', true)).toBe('42,12');
        });

        it('converts dot decimal separator to comma', () => {
            expect(normalizeFundsExpendituresExchangeRateInput('42.123456')).toBe('42,123456');
        });

        it('passes through comma decimal separator unchanged', () => {
            expect(normalizeFundsExpendituresExchangeRateInput('42,123456')).toBe('42,123456');
        });

        it('collapses multiple commas keeping only the first', () => {
            expect(normalizeFundsExpendituresExchangeRateInput('42,12,34')).toBe('42,1234');
        });
    });

    describe('validateFundsExpendituresExchangeRate', () => {
        it('returns required on blur for empty value', () => {
            expect(validateFundsExpendituresExchangeRate('', 'blur')).toBe(
                COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.FIELD_REQUIRED,
            );
        });

        it('does not return required on change for empty value', () => {
            expect(validateFundsExpendituresExchangeRate('', 'change')).toBeUndefined();
        });

        it('returns numeric validation for non-numeric value', () => {
            expect(validateFundsExpendituresExchangeRate('abc')).toBe(
                FUNDS_EXPENDITURES_TEXT.VALIDATION.EXCHANGE_RATE_ONLY_NUMERIC,
            );
        });

        it('returns numeric validation for integer with a leading zero', () => {
            expect(validateFundsExpendituresExchangeRate('012345678')).toBe(
                FUNDS_EXPENDITURES_TEXT.VALIDATION.EXCHANGE_RATE_ONLY_NUMERIC,
            );
        });

        it('returns numeric validation for decimal with a leading zero before the comma', () => {
            expect(validateFundsExpendituresExchangeRate('01,5')).toBe(
                FUNDS_EXPENDITURES_TEXT.VALIDATION.EXCHANGE_RATE_ONLY_NUMERIC,
            );
        });

        it('accepts a single zero integer part followed by a decimal', () => {
            expect(validateFundsExpendituresExchangeRate('0,5')).toBeUndefined();
        });

        it('returns gt-zero validation for zero', () => {
            expect(validateFundsExpendituresExchangeRate('0')).toBe(
                FUNDS_EXPENDITURES_TEXT.VALIDATION.EXCHANGE_RATE_GT_ZERO,
            );
        });

        it('returns gt-zero validation for negative value', () => {
            expect(validateFundsExpendituresExchangeRate('-1')).toBe(
                FUNDS_EXPENDITURES_TEXT.VALIDATION.EXCHANGE_RATE_ONLY_NUMERIC,
            );
        });

        it('returns max-digits validation for too many integer digits', () => {
            expect(validateFundsExpendituresExchangeRate('1234567890')).toBe(
                FUNDS_EXPENDITURES_TEXT.VALIDATION.EXCHANGE_RATE_MAX_DIGITS,
            );
        });

        it('returns max-digits validation for too many decimal digits', () => {
            expect(validateFundsExpendituresExchangeRate('1.1234567')).toBe(
                FUNDS_EXPENDITURES_TEXT.VALIDATION.EXCHANGE_RATE_MAX_DIGITS,
            );
        });

        it('accepts valid decimal value', () => {
            expect(validateFundsExpendituresExchangeRate('42.123456')).toBeUndefined();
        });

        it('accepts valid integer value', () => {
            expect(validateFundsExpendituresExchangeRate('42')).toBeUndefined();
        });
    });
});
