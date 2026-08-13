import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { FUNDS_EXPENDITURES_TEXT } from '@/const/admin/reports';
import {
    normalizeFundsExpendituresAmountInput,
    validateFundsExpendituresAmount,
    validateFundsExpendituresCategory,
    validateFundsExpendituresReportingYear,
} from './funds-expenditures-record-schema';

describe('FUNDS_EXPENDITURES_RECORD_VALIDATION_FUNCTIONS', () => {
    describe('normalizeFundsExpendituresAmountInput', () => {
        it('should trim leading spaces and normalize internal spaces', () => {
            expect(normalizeFundsExpendituresAmountInput('   1   200   ,5')).toBe('1 200 ,5');
        });

        it('should trim trailing spaces when trimEnd is true', () => {
            expect(normalizeFundsExpendituresAmountInput('   1 200   ', true)).toBe('1 200');
        });

        it('should convert dot separator to comma', () => {
            expect(normalizeFundsExpendituresAmountInput('1200.5')).toBe('1200,5');
        });

        it('should keep only first two digits after comma', () => {
            expect(normalizeFundsExpendituresAmountInput('1200,5678')).toBe('1200,56');
        });

        it('should prepend zero if input starts with a dot', () => {
            expect(normalizeFundsExpendituresAmountInput('.12')).toBe('0,12');
        });

        it('should prepend zero if input starts with a comma', () => {
            expect(normalizeFundsExpendituresAmountInput(',12')).toBe('0,12');
        });

        it('should prepend zero for negative values starting with a dot', () => {
            expect(normalizeFundsExpendituresAmountInput('-.12')).toBe('-0,12');
        });

        it('should prepend zero for negative values starting with a comma', () => {
            expect(normalizeFundsExpendituresAmountInput('-,12')).toBe('-0,12');
        });
        it('should handle dot with spaces before decimal digits', () => {
            expect(normalizeFundsExpendituresAmountInput('. 12')).toBe('0,12');
        });
    });

    describe('validateFundsExpendituresAmount', () => {
        it('should return required error for empty value on blur', () => {
            expect(validateFundsExpendituresAmount('   ', 'blur')).toBe(
                COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.FIELD_REQUIRED,
            );
        });

        it('should return numeric error for non-digit input', () => {
            expect(validateFundsExpendituresAmount('abc', 'change')).toBe(
                FUNDS_EXPENDITURES_TEXT.VALIDATION.AMOUNT_ONLY_NUMBER,
            );
        });

        it('should return max digits error when integer part is too long', () => {
            expect(validateFundsExpendituresAmount('1234567890', 'change')).toBe(
                FUNDS_EXPENDITURES_TEXT.VALIDATION.AMOUNT_MAX_DIGITS,
            );
        });

        it('should return negative error for negative values', () => {
            expect(validateFundsExpendituresAmount('-1', 'change')).toBe(
                FUNDS_EXPENDITURES_TEXT.VALIDATION.AMOUNT_NOT_NEGATIVE,
            );
        });

        it('should not return zero error on change', () => {
            expect(validateFundsExpendituresAmount('0', 'change')).toBeUndefined();
        });

        it('should return zero error on blur', () => {
            expect(validateFundsExpendituresAmount('0', 'blur')).toBe(
                FUNDS_EXPENDITURES_TEXT.VALIDATION.AMOUNT_NOT_ZERO,
            );
        });

        it('should return zero error on save', () => {
            expect(validateFundsExpendituresAmount('0', 'save')).toBe(
                FUNDS_EXPENDITURES_TEXT.VALIDATION.AMOUNT_NOT_ZERO,
            );
        });

        it('should pass valid value with comma decimals', () => {
            expect(validateFundsExpendituresAmount('1 200,50', 'save')).toBeUndefined();
        });

        it('should return error when user types more than two decimal digits', () => {
            expect(validateFundsExpendituresAmount('1 200,123', 'change')).toBe(
                FUNDS_EXPENDITURES_TEXT.VALIDATION.AMOUNT_MAX_DECIMALS,
            );
        });

        it('should ignore spaces when counting fractional digits', () => {
            expect(validateFundsExpendituresAmount('1 200, 12', 'change')).toBeUndefined();
            expect(validateFundsExpendituresAmount('1 200 , 12', 'change')).toBeUndefined();
        });

        it('should support dot input by normalizing it to comma', () => {
            expect(validateFundsExpendituresAmount('1 200.50', 'save')).toBeUndefined();
        });

        it('should pass valid value when user types dot and decimal digits without leading zero', () => {
            expect(validateFundsExpendituresAmount('.12', 'change')).toBeUndefined();
        });
        it('should validate negative comma-starting input and return negative error', () => {
            expect(validateFundsExpendituresAmount('-,12', 'change')).toBe(
                FUNDS_EXPENDITURES_TEXT.VALIDATION.AMOUNT_NOT_NEGATIVE,
            );
        });
    });

    describe('validateFundsExpendituresCategory', () => {
        const records = [
            { id: 1, categoryId: 1, type: 'income' as const, reportingYear: '2025', amountUah: '1', amountUsd: '1' },
            { id: 2, categoryId: 2, type: 'income' as const, reportingYear: '2024', amountUah: '1', amountUsd: '1' },
            { id: 3, categoryId: 3, type: 'expense' as const, reportingYear: '2024', amountUah: '1', amountUsd: '1' },
        ];

        it('should return required error for undefined category on blur', () => {
            expect(
                validateFundsExpendituresCategory({
                    recordId: 1,
                    recordType: 'income',
                    categoryId: undefined,
                    records,
                    trigger: 'blur',
                }),
            ).toBe(COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.FIELD_REQUIRED);
        });

        it('should return unique error for duplicate category in same type', () => {
            expect(
                validateFundsExpendituresCategory({
                    recordId: 1,
                    recordType: 'income',
                    categoryId: 2,
                    records,
                }),
            ).toBe(FUNDS_EXPENDITURES_TEXT.VALIDATION.CATEGORY_UNIQUE_INCOME);
        });

        it('should return expense-specific unique error for duplicate expense category', () => {
            expect(
                validateFundsExpendituresCategory({
                    recordId: 1,
                    recordType: 'expense',
                    categoryId: 3,
                    records,
                }),
            ).toBe(FUNDS_EXPENDITURES_TEXT.VALIDATION.CATEGORY_UNIQUE_EXPENSE);
        });

        it('should pass for unique category', () => {
            expect(
                validateFundsExpendituresCategory({
                    recordId: 1,
                    recordType: 'income',
                    categoryId: 3,
                    records,
                }),
            ).toBeUndefined();
        });
    });

    describe('validateFundsExpendituresReportingYear', () => {
        it('should return required error for empty value on blur', () => {
            expect(validateFundsExpendituresReportingYear(undefined, 'blur')).toBe(
                COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.FIELD_REQUIRED,
            );
        });

        it('should return required error for empty value on save', () => {
            expect(validateFundsExpendituresReportingYear('   ', 'save')).toBe(
                COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.FIELD_REQUIRED,
            );
        });

        it('should not return error for empty value on change', () => {
            expect(validateFundsExpendituresReportingYear(undefined, 'change')).toBeUndefined();
        });

        it('should pass for valid reporting year', () => {
            expect(validateFundsExpendituresReportingYear('2026', 'blur')).toBeUndefined();
        });
    });
});
