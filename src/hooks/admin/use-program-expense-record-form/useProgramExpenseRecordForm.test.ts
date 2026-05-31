import { act, renderHook } from '@testing-library/react';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { FUNDS_EXPENDITURES_TEXT, PROGRAM_EXPENSES_TEXT } from '@/const/admin/reports';
import { ProgramExpensesProgram, ProgramExpensesRecord } from '@/types/admin/reports';
import { useProgramExpenseRecordForm } from './useProgramExpenseRecordForm';

const programs: ProgramExpensesProgram[] = [
    { id: 2, name: 'Program B' },
    { id: 1, name: 'Program A' },
];

const records: ProgramExpensesRecord[] = [
    {
        id: 1,
        programId: 1,
        programName: 'Program A',
        type: 'expense',
        reportingYear: '2025',
        amountUah: '100',
        amountUsd: '10',
    },
];

const createHookParams = (
    overrides: Partial<Parameters<typeof useProgramExpenseRecordForm>[0]> = {},
): Parameters<typeof useProgramExpenseRecordForm>[0] => ({
    isOpen: true,
    programs,
    records,
    exchangeRate: null,
    ...overrides,
});

const renderUseProgramExpenseForm = (overrides: Partial<Parameters<typeof useProgramExpenseRecordForm>[0]> = {}) =>
    renderHook(() => useProgramExpenseRecordForm(createHookParams(overrides)));

describe('useProgramExpenseRecordForm', () => {
    it('sorts programs by name', () => {
        const { result } = renderUseProgramExpenseForm();

        expect(result.current.programOptions.map((program) => program.name)).toEqual(['Program A', 'Program B']);
    });

    it('validates required select fields on blur', () => {
        const { result } = renderUseProgramExpenseForm();

        act(() => {
            result.current.handleReportingYearBlur();
            result.current.handleProgramBlur();
        });

        expect(result.current.formState.errors.reportingYear).toBe(COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.FIELD_REQUIRED);
        expect(result.current.formState.errors.programId).toBe(COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.FIELD_REQUIRED);
    });

    it('validates duplicate program category and blocks submit', () => {
        const { result } = renderUseProgramExpenseForm();

        act(() => {
            result.current.handleReportingYearChange('2026');
            result.current.handleProgramChange(1);
            result.current.handleAmountChange('100');
            result.current.handleUsdChange('10');
        });

        expect(result.current.formState.errors.programId).toBe(PROGRAM_EXPENSES_TEXT.VALIDATION.PROGRAM_UNIQUE);
        expect(result.current.isSubmitDisabled).toBe(true);
    });

    it('enables submit when all validations pass', () => {
        const { result } = renderUseProgramExpenseForm();

        act(() => {
            result.current.handleReportingYearChange('2026');
            result.current.handleProgramChange(2);
            result.current.handleAmountChange('100');
            result.current.handleUsdChange('10');
        });

        expect(result.current.isSubmitDisabled).toBe(false);
    });

    it('validates amount fields on change and blur', () => {
        const { result } = renderUseProgramExpenseForm();

        act(() => {
            result.current.handleAmountChange('1234567890');
            result.current.handleUsdChange('0');
        });

        expect(result.current.formState.errors.amountUah).toBe(FUNDS_EXPENDITURES_TEXT.VALIDATION.AMOUNT_MAX_DIGITS);
        expect(result.current.formState.errors.amountUsd).toBeUndefined();

        act(() => {
            result.current.handleAmountBlur('amountUsd');
        });

        expect(result.current.formState.errors.amountUsd).toBe(FUNDS_EXPENDITURES_TEXT.VALIDATION.AMOUNT_NOT_ZERO);
    });

    it('resets values when modal closes', () => {
        const { result, rerender } = renderHook(
            ({ isOpen }) =>
                useProgramExpenseRecordForm({
                    isOpen,
                    programs,
                    records,
                    exchangeRate: null,
                }),
            { initialProps: { isOpen: true } },
        );

        act(() => {
            result.current.handleReportingYearChange('2026');
            result.current.handleProgramChange(2);
            result.current.handleAmountChange('100');
        });

        expect(result.current.isDirty).toBe(true);

        rerender({ isOpen: false });

        expect(result.current.formState.reportingYear).toBeUndefined();
        expect(result.current.formState.programId).toBeUndefined();
        expect(result.current.formState.amountUah).toBe('');
        expect(result.current.isDirty).toBe(false);
    });

    it('clears selected program when it is no longer available', () => {
        const { result, rerender } = renderHook(
            ({ nextPrograms }) =>
                useProgramExpenseRecordForm({
                    isOpen: true,
                    programs: nextPrograms,
                    records,
                    exchangeRate: null,
                }),
            { initialProps: { nextPrograms: programs } },
        );

        act(() => {
            result.current.handleProgramChange(2);
        });

        expect(result.current.formState.programId).toBe(2);

        rerender({ nextPrograms: programs.filter((program) => program.id !== 2) });

        expect(result.current.formState.programId).toBeUndefined();
    });

    it('automatically converts UAH to USD when UAH amount is entered', () => {
        const { result } = renderUseProgramExpenseForm({ exchangeRate: '40' });

        act(() => {
            result.current.handleAmountChange('100');
        });

        expect(result.current.formState.amountUsd).toBe('2,5');
    });

    it('does not recalculate UAH when USD is changed manually', () => {
        const { result } = renderUseProgramExpenseForm({ exchangeRate: '40' });

        act(() => {
            result.current.handleAmountChange('100');
            result.current.handleUsdChange('999');
        });

        expect(result.current.formState.amountUah).toBe('100');
    });
});
