import { updateFundsAmounts, type FundsAmountsState } from './update-funds-amounts';
import { getConvertedAmount } from '@/utils/functions/get-converted-amount/get-converted-amount';
import {
    normalizeFundsExpendituresAmountInput,
    validateFundsExpendituresAmount,
} from '@/validation/admin/reports-schema/funds-expenditures-record-schema/funds-expenditures-record-schema';

jest.mock('@/utils/functions/get-converted-amount/get-converted-amount');
jest.mock('@/validation/admin/reports-schema/funds-expenditures-record-schema/funds-expenditures-record-schema');

describe('updateFundsAmounts', () => {
    const mockGetConvertedAmount = getConvertedAmount as jest.MockedFunction<typeof getConvertedAmount>;
    const mockNormalizeFundsExpendituresAmountInput = normalizeFundsExpendituresAmountInput as jest.MockedFunction<
        typeof normalizeFundsExpendituresAmountInput
    >;
    const mockValidateFundsExpendituresAmount = validateFundsExpendituresAmount as jest.MockedFunction<
        typeof validateFundsExpendituresAmount
    >;

    const initialState = {
        amountUah: '100',
        amountUsd: '3',
        errors: {
            amountUah: undefined as string | undefined,
            amountUsd: undefined as string | undefined,
        },
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Field update with change trigger', () => {
        it('should update amountUah on change trigger', () => {
            mockNormalizeFundsExpendituresAmountInput.mockReturnValue('200');
            mockValidateFundsExpendituresAmount.mockReturnValue(undefined);
            mockGetConvertedAmount.mockReturnValue(null);

            const updater = updateFundsAmounts('amountUah', '200', '33.5', 'change');
            const result = updater(initialState);

            expect(result.amountUah).toBe('200');
            expect(result.amountUsd).toBe('3');
            expect(mockNormalizeFundsExpendituresAmountInput).toHaveBeenCalledWith('200', false);
        });

        it('should update amountUsd on change trigger', () => {
            mockNormalizeFundsExpendituresAmountInput.mockReturnValue('5');
            mockValidateFundsExpendituresAmount.mockReturnValue(undefined);
            mockGetConvertedAmount.mockReturnValue(null);

            const updater = updateFundsAmounts('amountUsd', '5', '33.5', 'change');
            const result = updater(initialState);

            expect(result.amountUsd).toBe('5');
            expect(result.amountUah).toBe('100');
            expect(mockNormalizeFundsExpendituresAmountInput).toHaveBeenCalledWith('5', false);
        });
    });

    describe('Field update with blur trigger', () => {
        it('should normalize on blur trigger', () => {
            mockNormalizeFundsExpendituresAmountInput.mockReturnValue('150.00');
            mockValidateFundsExpendituresAmount.mockReturnValue(undefined);
            mockGetConvertedAmount.mockReturnValue(null);

            const updater = updateFundsAmounts('amountUah', '150', '33.5', 'blur');
            updater(initialState);

            expect(mockNormalizeFundsExpendituresAmountInput).toHaveBeenCalledWith('150', true);
        });

        it('should update amountUah with blur trigger', () => {
            mockNormalizeFundsExpendituresAmountInput.mockReturnValue('250');
            mockValidateFundsExpendituresAmount.mockReturnValue(undefined);
            mockGetConvertedAmount.mockReturnValue(null);

            const updater = updateFundsAmounts('amountUah', '250', '33.5', 'blur');
            const result = updater(initialState);

            expect(result.amountUah).toBe('250');
        });
    });

    describe('Validation errors', () => {
        it('should set error on amountUah when validation fails', () => {
            mockNormalizeFundsExpendituresAmountInput.mockReturnValue('invalid');
            mockValidateFundsExpendituresAmount.mockReturnValue('Invalid amount');

            const updater = updateFundsAmounts('amountUah', 'invalid', '33.5', 'change');
            const result = updater(initialState);

            expect(result.errors.amountUah).toBe('Invalid amount');
            expect(result.amountUah).toBe('invalid');
        });

        it('should set error on amountUsd when validation fails', () => {
            mockNormalizeFundsExpendituresAmountInput.mockReturnValue('invalid');
            mockValidateFundsExpendituresAmount.mockReturnValue('Invalid amount');

            const updater = updateFundsAmounts('amountUsd', 'invalid', '33.5', 'change');
            const result = updater(initialState);

            expect(result.errors.amountUsd).toBe('Invalid amount');
            expect(result.amountUsd).toBe('invalid');
        });

        it('should preserve other field errors when updating one field', () => {
            const stateWithErrors: FundsAmountsState = {
                ...initialState,
                errors: {
                    amountUah: 'UAH error',
                    amountUsd: undefined,
                },
            };

            mockNormalizeFundsExpendituresAmountInput.mockReturnValue('5');
            mockValidateFundsExpendituresAmount.mockReturnValue(undefined);
            mockGetConvertedAmount.mockReturnValue(null);

            const updater = updateFundsAmounts('amountUsd', '5', '33.5', 'change');
            const result = updater(stateWithErrors);

            expect(result.errors.amountUah).toBe('UAH error');
            expect(result.errors.amountUsd).toBeUndefined();
        });
    });

    describe('Currency conversion', () => {
        it('should convert amountUah to amountUsd when no error', () => {
            mockNormalizeFundsExpendituresAmountInput.mockReturnValue('100');
            mockValidateFundsExpendituresAmount.mockReturnValueOnce(undefined).mockReturnValueOnce(undefined);
            mockGetConvertedAmount.mockReturnValue('3');

            const updater = updateFundsAmounts('amountUah', '100', '33.5', 'change');
            const result = updater(initialState);

            expect(result.amountUah).toBe('100');
            expect(result.amountUsd).toBe('3');
            expect(mockGetConvertedAmount).toHaveBeenCalledWith('100', 'amountUah', '33.5');
        });

        it('should convert amountUsd to amountUah when no error', () => {
            mockNormalizeFundsExpendituresAmountInput.mockReturnValue('3.5');
            mockValidateFundsExpendituresAmount.mockReturnValueOnce(undefined).mockReturnValueOnce(undefined);
            mockGetConvertedAmount.mockReturnValue('117.25');

            const updater = updateFundsAmounts('amountUsd', '3.5', '33.5', 'change');
            const result = updater(initialState);

            expect(result.amountUsd).toBe('3.5');
            expect(result.amountUah).toBe('117.25');
            expect(mockGetConvertedAmount).toHaveBeenCalledWith('3.5', 'amountUsd', '33.5');
        });

        it('should not convert if conversion returns null', () => {
            mockNormalizeFundsExpendituresAmountInput.mockReturnValue('100');
            mockValidateFundsExpendituresAmount.mockReturnValue(undefined);
            mockGetConvertedAmount.mockReturnValue(null);

            const updater = updateFundsAmounts('amountUah', '100', '33.5', 'change');
            const result = updater(initialState);

            expect(result.amountUah).toBe('100');
            expect(result.amountUsd).toBe('3');
            expect(mockGetConvertedAmount).toHaveBeenCalled();
        });

        it('should validate converted amount', () => {
            mockNormalizeFundsExpendituresAmountInput.mockReturnValue('100');
            mockValidateFundsExpendituresAmount.mockReturnValueOnce(undefined).mockReturnValueOnce('Converted invalid');
            mockGetConvertedAmount.mockReturnValue('3000');

            const updater = updateFundsAmounts('amountUah', '100', '33.5', 'change');
            const result = updater(initialState);

            expect(result.errors.amountUsd).toBe('Converted invalid');
            expect(mockValidateFundsExpendituresAmount).toHaveBeenCalledTimes(2);
        });

        it('should skip conversion when validation fails', () => {
            mockNormalizeFundsExpendituresAmountInput.mockReturnValue('invalid');
            mockValidateFundsExpendituresAmount.mockReturnValue('Invalid amount');

            const updater = updateFundsAmounts('amountUah', 'invalid', '33.5', 'change');
            const result = updater(initialState);

            expect(result.errors.amountUah).toBe('Invalid amount');
            expect(mockGetConvertedAmount).not.toHaveBeenCalled();
        });

        it('should handle null exchange rate', () => {
            mockNormalizeFundsExpendituresAmountInput.mockReturnValue('100');
            mockValidateFundsExpendituresAmount.mockReturnValue(undefined);
            mockGetConvertedAmount.mockReturnValue(null);

            const updater = updateFundsAmounts('amountUah', '100', null, 'change');
            const result = updater(initialState);

            expect(result.amountUah).toBe('100');
            expect(mockGetConvertedAmount).toHaveBeenCalledWith('100', 'amountUah', null);
        });
    });

    describe('State preservation', () => {
        it('should preserve previous state when updating', () => {
            const customState: FundsAmountsState = {
                amountUah: '500',
                amountUsd: '15',
                errors: {
                    amountUah: undefined,
                    amountUsd: 'Previous USD error',
                },
            };

            mockNormalizeFundsExpendituresAmountInput.mockReturnValue('600');
            mockValidateFundsExpendituresAmount.mockReturnValue(undefined);
            mockGetConvertedAmount.mockReturnValue(null);

            const updater = updateFundsAmounts('amountUah', '600', '33.5', 'change');
            const result = updater(customState);

            expect(result).toEqual({
                amountUah: '600',
                amountUsd: '15',
                errors: {
                    amountUah: undefined,
                    amountUsd: 'Previous USD error',
                },
            });
        });
    });

    describe('Trigger parameter', () => {
        it('should pass correct trigger to validation functions', () => {
            mockNormalizeFundsExpendituresAmountInput.mockReturnValue('100');
            mockValidateFundsExpendituresAmount.mockReturnValue(undefined);
            mockGetConvertedAmount.mockReturnValue(null);

            const updater = updateFundsAmounts('amountUah', '100', '33.5', 'blur');
            updater(initialState);

            expect(mockValidateFundsExpendituresAmount).toHaveBeenCalledWith('100', 'blur');
        });

        it('should use trigger consistently for main and converted field validation', () => {
            mockNormalizeFundsExpendituresAmountInput.mockReturnValue('100');
            mockValidateFundsExpendituresAmount.mockReturnValueOnce(undefined).mockReturnValueOnce(undefined);
            mockGetConvertedAmount.mockReturnValue('3');

            const updater = updateFundsAmounts('amountUah', '100', '33.5', 'blur');
            updater(initialState);

            expect(mockValidateFundsExpendituresAmount).toHaveBeenNthCalledWith(1, '100', 'blur');
            expect(mockValidateFundsExpendituresAmount).toHaveBeenNthCalledWith(2, '3', 'blur');
        });
    });

    describe('Edge cases', () => {
        it('should handle empty string input', () => {
            mockNormalizeFundsExpendituresAmountInput.mockReturnValue('');
            mockValidateFundsExpendituresAmount.mockReturnValue(undefined);
            mockGetConvertedAmount.mockReturnValue(null);

            const updater = updateFundsAmounts('amountUah', '', '33.5', 'change');
            const result = updater(initialState);

            expect(result.amountUah).toBe('');
        });

        it('should handle very large amounts', () => {
            const largeAmount = '999999999.99';
            mockNormalizeFundsExpendituresAmountInput.mockReturnValue(largeAmount);
            mockValidateFundsExpendituresAmount.mockReturnValue(undefined);
            mockGetConvertedAmount.mockReturnValue('29999999999.97');

            const updater = updateFundsAmounts('amountUah', largeAmount, '33.5', 'change');
            const result = updater(initialState);

            expect(result.amountUah).toBe(largeAmount);
            expect(result.amountUsd).toBe('29999999999.97');
        });

        it('should handle zero amount', () => {
            mockNormalizeFundsExpendituresAmountInput.mockReturnValue('0');
            mockValidateFundsExpendituresAmount.mockReturnValue(undefined);
            mockGetConvertedAmount.mockReturnValue('0');

            const updater = updateFundsAmounts('amountUah', '0', '33.5', 'change');
            const result = updater(initialState);

            expect(result.amountUah).toBe('0');
            expect(result.amountUsd).toBe('0');
        });

        it('should handle multiple consecutive updates', () => {
            mockNormalizeFundsExpendituresAmountInput.mockReturnValue('100');
            mockValidateFundsExpendituresAmount.mockReturnValue(undefined);
            mockGetConvertedAmount.mockReturnValue('3');

            let state: FundsAmountsState = initialState;

            const updater1 = updateFundsAmounts('amountUah', '100', '33.5', 'change');
            state = updater1(state);

            expect(state.amountUah).toBe('100');
            expect(state.amountUsd).toBe('3');

            mockNormalizeFundsExpendituresAmountInput.mockReturnValue('200');
            mockGetConvertedAmount.mockReturnValue('6');

            const updater2 = updateFundsAmounts('amountUah', '200', '33.5', 'change');
            state = updater2(state);

            expect(state.amountUah).toBe('200');
            expect(state.amountUsd).toBe('6');
        });
    });
});
