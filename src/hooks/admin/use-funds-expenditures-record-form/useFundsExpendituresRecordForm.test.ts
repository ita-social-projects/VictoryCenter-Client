import { renderHook, act } from '@testing-library/react';
import { FUNDS_EXPENDITURES_TEXT } from '@/const/admin/reports';
import { ReportFundsExpendituresCategory, ReportFundsExpendituresRecord } from '@/types/admin/reports';
import * as fundsExpendituresSchema from '@/validation/admin/reports-schema/funds-expenditures-record-schema/funds-expenditures-record-schema';
import { useFundsExpendituresRecordForm } from './useFundsExpendituresRecordForm';

const categories: ReportFundsExpendituresCategory[] = [
    { id: 3, name: 'C income', type: 'income' },
    { id: 1, name: 'A income', type: 'income' },
    { id: 2, name: 'B expense', type: 'expense' },
];

const records: ReportFundsExpendituresRecord[] = [
    { id: 1, categoryId: 1, type: 'income', reportingYear: '2025', amountUah: '100', amountUsd: '10' },
    { id: 2, categoryId: 2, type: 'expense', reportingYear: '2025', amountUah: '200', amountUsd: '20' },
];

const createHookParams = (
    overrides: Partial<Parameters<typeof useFundsExpendituresRecordForm>[0]> = {},
): Parameters<typeof useFundsExpendituresRecordForm>[0] => ({
    isOpen: true,
    transactionType: 'income',
    categories,
    records,
    exchangeRate: '10',
    onSubmit: jest.fn(),
    ...overrides,
});

const renderUseFundsForm = (overrides: Partial<Parameters<typeof useFundsExpendituresRecordForm>[0]> = {}) =>
    renderHook(() => useFundsExpendituresRecordForm(createHookParams(overrides)));

describe('useFundsExpendituresRecordForm', () => {
    it('filters and sorts categories by transaction type', () => {
        const { result } = renderUseFundsForm();

        expect(result.current.filteredCategories.map((item) => item.id)).toEqual([1, 3]);
    });

    it('handles required state and duplicate category validation', () => {
        const { result } = renderUseFundsForm({ transactionType: 'expense' });

        act(() => {
            result.current.handleCategoryChange(2);
        });

        expect(result.current.formState.errors.categoryId).toBe(
            FUNDS_EXPENDITURES_TEXT.VALIDATION.CATEGORY_UNIQUE_EXPENSE,
        );
    });

    it('updates amount values and sets usd mismatch on blur', () => {
        const { result } = renderUseFundsForm();

        act(() => {
            result.current.handleAmountChange('100');
            result.current.handleUsdChange('1');
            result.current.handleAmountBlur('amountUsd');
        });

        expect(result.current.usdMismatchMessage).toBe(FUNDS_EXPENDITURES_TEXT.MESSAGE.AMOUNT_USD_NOT_MATCH);
    });

    it('keeps usd mismatch message undefined when amounts match on blur', () => {
        const { result } = renderUseFundsForm();

        act(() => {
            result.current.handleAmountChange('100');
            result.current.handleUsdChange('10');
            result.current.handleAmountBlur('amountUsd');
        });

        expect(result.current.usdMismatchMessage).toBeUndefined();
    });

    it('clears usd mismatch after amount uah blur recalculation', () => {
        const { result } = renderUseFundsForm();

        act(() => {
            result.current.handleAmountChange('100');
            result.current.handleUsdChange('1');
            result.current.handleAmountBlur('amountUsd');
        });

        expect(result.current.usdMismatchMessage).toBe(FUNDS_EXPENDITURES_TEXT.MESSAGE.AMOUNT_USD_NOT_MATCH);

        act(() => {
            result.current.handleAmountBlur('amountUah');
        });

        expect(result.current.usdMismatchMessage).toBeUndefined();
    });

    it('does not submit invalid form and closes confirmation state', async () => {
        const onSubmit = jest.fn().mockResolvedValue(true);
        const { result } = renderUseFundsForm({ onSubmit });

        act(() => {
            result.current.handleOpenAddConfirmation();
        });

        expect(result.current.isAddConfirmationOpen).toBe(true);

        await act(async () => {
            await result.current.handleConfirmAdd();
        });

        expect(onSubmit).not.toHaveBeenCalled();
        expect(result.current.isAddConfirmationOpen).toBe(false);
    });

    it('submits valid form and resets values on success', async () => {
        const onSubmit = jest.fn().mockResolvedValue(true);
        const { result } = renderUseFundsForm({ onSubmit });

        act(() => {
            result.current.handleReportingYearChange('2026');
            result.current.handleCategoryChange(3);
            result.current.handleAmountChange('100');
            result.current.handleUsdChange('10');
        });

        await act(async () => {
            await result.current.handleConfirmAdd();
        });

        expect(onSubmit).toHaveBeenCalledWith({
            categoryId: 3,
            reportingYear: '2026',
            amountUah: '100',
            amountUsd: '10',
            type: 'income',
        });
        expect(result.current.formState.reportingYear).toBeUndefined();
        expect(result.current.formState.categoryId).toBeUndefined();
        expect(result.current.formState.amountUah).toBe('');
        expect(result.current.formState.amountUsd).toBe('');
    });

    it('submits valid form without reporting year', async () => {
        const onSubmit = jest.fn().mockResolvedValue(true);
        const { result } = renderUseFundsForm({ onSubmit });

        act(() => {
            result.current.handleCategoryChange(3);
            result.current.handleAmountChange('100');
            result.current.handleUsdChange('10');
        });

        expect(result.current.isSubmitDisabled).toBe(false);

        await act(async () => {
            await result.current.handleConfirmAdd();
        });

        expect(onSubmit).toHaveBeenCalledWith({
            categoryId: 3,
            reportingYear: '',
            amountUah: '100',
            amountUsd: '10',
            type: 'income',
        });
    });

    it('does not reset values when submit rejects', async () => {
        const onSubmit = jest.fn().mockRejectedValue(new Error('network'));
        const { result } = renderUseFundsForm({ onSubmit });

        act(() => {
            result.current.handleReportingYearChange('2026');
            result.current.handleCategoryChange(3);
            result.current.handleAmountChange('100');
            result.current.handleUsdChange('10');
        });

        await act(async () => {
            await result.current.handleConfirmAdd();
        });

        expect(onSubmit).toHaveBeenCalledTimes(1);
        expect(result.current.formState.reportingYear).toBe('2026');
        expect(result.current.formState.categoryId).toBe(3);
        expect(result.current.isSubmitting).toBe(false);
    });

    it('stops submit when category is missing after validation pass', async () => {
        const validateCategorySpy = jest
            .spyOn(fundsExpendituresSchema, 'validateFundsExpendituresCategory')
            .mockReturnValue(undefined);
        const onSubmit = jest.fn().mockResolvedValue(true);

        const { result } = renderUseFundsForm({ onSubmit });

        act(() => {
            result.current.handleReportingYearChange('2026');
            result.current.handleAmountChange('100');
            result.current.handleUsdChange('10');
        });

        await act(async () => {
            await result.current.handleConfirmAdd();
        });

        expect(onSubmit).not.toHaveBeenCalled();

        validateCategorySpy.mockRestore();
    });

    it('keeps values after failed submit and resets when modal closes', async () => {
        const onSubmit = jest.fn().mockResolvedValue(false);
        const { result, rerender } = renderHook(
            ({ isOpen }) =>
                useFundsExpendituresRecordForm({
                    isOpen,
                    transactionType: 'income',
                    categories: categories.filter((item) => item.type === 'income'),
                    records,
                    exchangeRate: '10',
                    onSubmit,
                }),
            {
                initialProps: { isOpen: true },
            },
        );

        act(() => {
            result.current.handleReportingYearChange('2026');
            result.current.handleCategoryChange(3);
            result.current.handleAmountChange('100');
            result.current.handleUsdChange('10');
        });

        await act(async () => {
            await result.current.handleConfirmAdd();
        });

        expect(result.current.formState.reportingYear).toBe('2026');

        rerender({ isOpen: false });

        expect(result.current.formState.reportingYear).toBeUndefined();
        expect(result.current.isSubmitting).toBe(false);
    });

    it('shows disabled category state when there are no categories for type', () => {
        const { result } = renderUseFundsForm({
            transactionType: 'expense',
            categories: categories.filter((item) => item.type === 'income'),
        });

        expect(result.current.isCategorySelectDisabled).toBe(true);
    });

    it('closes confirmation state via close handler', () => {
        const { result } = renderUseFundsForm();

        act(() => {
            result.current.handleOpenAddConfirmation();
        });

        expect(result.current.isAddConfirmationOpen).toBe(true);

        act(() => {
            result.current.handleCloseConfirmation();
        });

        expect(result.current.isAddConfirmationOpen).toBe(false);
    });
});
