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
        amountUah: '400',
        amountUsd: '10',
    },
];

const createHookParams = (
    overrides: Partial<Parameters<typeof useProgramExpenseRecordForm>[0]> = {},
): Parameters<typeof useProgramExpenseRecordForm>[0] => ({
    isOpen: true,
    programs,
    records,
    exchangeRate: '40',
    onSubmit: jest.fn().mockResolvedValue(true),
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
            result.current.handleAmountFieldChange('amountUah')('400');
            result.current.handleAmountFieldChange('amountUsd')('10');
        });

        expect(result.current.formState.errors.programId).toBe(PROGRAM_EXPENSES_TEXT.VALIDATION.PROGRAM_UNIQUE);
        expect(result.current.isSubmitDisabled).toBe(true);
    });

    it('enables submit when all validations pass', () => {
        const { result } = renderUseProgramExpenseForm();

        act(() => {
            result.current.handleReportingYearChange('2026');
            result.current.handleProgramChange(2);
            result.current.handleAmountFieldChange('amountUah')('400');
        });

        expect(result.current.formState.amountUsd).toBe('10');
        expect(result.current.isSubmitDisabled).toBe(false);
    });

    it('submits successfully after USD is changed manually without a preceding blur', async () => {
        const onSubmit = jest.fn().mockResolvedValue(true);
        const { result } = renderUseProgramExpenseForm({ onSubmit });

        act(() => {
            result.current.handleReportingYearChange('2026');
            result.current.handleProgramChange(2);
            result.current.handleAmountFieldChange('amountUsd')('999');
        });

        expect(result.current.usdMismatchMessage).toBeUndefined();

        await act(async () => {
            await result.current.handleSave();
        });

        expect(onSubmit).toHaveBeenCalledWith({
            programId: 2,
            programName: 'Program B',
            reportingYear: '2026',
            amountUah: '39960',
            amountUsd: '999',
        });
    });

    it('validates amountUah max digits on change', () => {
        const { result } = renderUseProgramExpenseForm();

        act(() => {
            result.current.handleAmountFieldChange('amountUah')('1234567890');
        });

        expect(result.current.formState.errors.amountUah).toBe(FUNDS_EXPENDITURES_TEXT.VALIDATION.AMOUNT_MAX_DIGITS);
        expect(result.current.formState.errors.amountUsd).toBeUndefined();
    });

    it('validates amountUsd not-zero error on blur', () => {
        const { result } = renderUseProgramExpenseForm();

        act(() => {
            result.current.handleAmountFieldChange('amountUsd')('0');
        });

        expect(result.current.formState.errors.amountUsd).toBeUndefined();

        act(() => {
            result.current.handleAmountBlur('amountUsd');
        });

        expect(result.current.formState.errors.amountUsd).toBe(FUNDS_EXPENDITURES_TEXT.VALIDATION.AMOUNT_NOT_ZERO);
    });

    it('resets form state when modal closes', () => {
        const { result, rerender } = renderHook(
            ({ isOpen }) =>
                useProgramExpenseRecordForm({
                    isOpen,
                    programs,
                    records,
                    exchangeRate: '40',
                    onSubmit: jest.fn().mockResolvedValue(true),
                }),
            { initialProps: { isOpen: true } },
        );

        act(() => {
            result.current.handleReportingYearChange('2026');
            result.current.handleProgramChange(2);
            result.current.handleAmountFieldChange('amountUah')('100');
        });

        expect(result.current.isDirty).toBe(true);

        rerender({ isOpen: false });

        expect(result.current.formState.reportingYear).toBeUndefined();
        expect(result.current.formState.programId).toBeUndefined();
        expect(result.current.formState.amountUah).toBe('');
        expect(result.current.isDirty).toBe(false);
    });

    it('matches typed text to an existing program option (case-insensitive, trimmed)', () => {
        const { result } = renderUseProgramExpenseForm();

        act(() => {
            result.current.handleProgramInputChange('  program b  ');
        });

        expect(result.current.formState.programId).toBe(2);
        expect(result.current.formState.programInputValue).toBe('  program b  ');
        expect(result.current.formState.errors.programId).toBeUndefined();
    });

    it('treats typed text with no matching option as a pending custom category', () => {
        const { result } = renderUseProgramExpenseForm();

        act(() => {
            result.current.handleProgramInputChange('XXXXXXXX');
        });

        expect(result.current.formState.programId).toBeUndefined();
        expect(result.current.formState.programInputValue).toBe('XXXXXXXX');
        expect(result.current.formState.errors.programId).toBeUndefined();
    });

    it('validates a too-short custom category name on blur', () => {
        const { result } = renderUseProgramExpenseForm();

        act(() => {
            result.current.handleProgramInputChange('a');
        });
        act(() => {
            result.current.handleProgramBlur();
        });

        expect(result.current.formState.errors.programId).toBeDefined();
        expect(result.current.isSubmitDisabled).toBe(true);
    });

    it('submits with programId undefined and the trimmed custom name when a new category is typed', async () => {
        const onSubmit = jest.fn().mockResolvedValue(true);
        const { result } = renderUseProgramExpenseForm({ onSubmit });

        act(() => {
            result.current.handleReportingYearChange('2026');
            result.current.handleProgramInputChange('  New Category  ');
            result.current.handleAmountFieldChange('amountUah')('400');
        });

        expect(result.current.isSubmitDisabled).toBe(false);

        await act(async () => {
            await result.current.handleSave();
        });

        expect(onSubmit).toHaveBeenCalledWith({
            programId: undefined,
            programName: 'New Category',
            reportingYear: '2026',
            amountUah: '400',
            amountUsd: '10',
        });
    });

    it('clears selected program when it is no longer available', () => {
        const { result, rerender } = renderHook(
            ({ nextPrograms }) =>
                useProgramExpenseRecordForm({
                    isOpen: true,
                    programs: nextPrograms,
                    records,
                    exchangeRate: '40',
                    onSubmit: jest.fn().mockResolvedValue(true),
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
            result.current.handleAmountFieldChange('amountUah')('100');
        });

        expect(result.current.formState.amountUsd).toBe('2,5');
    });

    it('automatically converts USD to UAH when USD amount is entered', () => {
        const { result } = renderUseProgramExpenseForm({ exchangeRate: '40' });

        act(() => {
            result.current.handleAmountFieldChange('amountUsd')('2,5');
        });

        expect(result.current.formState.amountUah).toBe('100');
    });

    it('matches typed text with multiple inner spaces to an existing program option', () => {
        const { result } = renderUseProgramExpenseForm();

        act(() => {
            result.current.handleProgramInputChange('Program   B');
        });

        expect(result.current.formState.programId).toBe(2);
        expect(result.current.formState.errors.programId).toBeUndefined();
    });

    it('normalizes programInputValue on blur (trims and collapses extra spaces)', () => {
        const { result } = renderUseProgramExpenseForm();

        act(() => {
            result.current.handleProgramInputChange('   Program   B   ');
        });

        expect(result.current.formState.programInputValue).toBe('   Program   B   ');

        act(() => {
            result.current.handleProgramBlur();
        });

        expect(result.current.formState.programInputValue).toBe('Program B');
        expect(result.current.formState.programId).toBe(2);
    });

    describe('edit mode', () => {
        const recordToEdit: ProgramExpensesRecord = {
            id: 1,
            programId: 1,
            programName: 'Program A',
            type: 'expense',
            reportingYear: '2025',
            amountUah: '400',
            amountUsd: '10',
        };

        it('pre-fills form state with edited record values', () => {
            const { result } = renderUseProgramExpenseForm({ recordToEdit });

            expect(result.current.formState.reportingYear).toBe('2025');
            expect(result.current.formState.programId).toBe(1);
            expect(result.current.formState.amountUah).toBe('400');
            expect(result.current.formState.amountUsd).toBe('10');
            expect(result.current.isDirty).toBe(false);
            expect(result.current.isSubmitDisabled).toBe(true);
        });

        it('updates isDirty and enables submit when field is changed and valid', () => {
            const { result } = renderUseProgramExpenseForm({ recordToEdit });

            act(() => {
                result.current.handleReportingYearChange('2026');
            });

            expect(result.current.isDirty).toBe(true);
            expect(result.current.isSubmitDisabled).toBe(false);

            act(() => {
                result.current.handleReportingYearChange('2025');
            });

            expect(result.current.isDirty).toBe(false);
            expect(result.current.isSubmitDisabled).toBe(true);
        });

        it('does not block saving a legacy record whose stored amounts mismatch the current exchange rate, as long as amounts are untouched', async () => {
            const onSubmit = jest.fn().mockResolvedValue(true);
            const { result } = renderUseProgramExpenseForm({ recordToEdit, onSubmit, exchangeRate: '40' });

            act(() => {
                result.current.handleAmountBlur('amountUsd');
            });

            expect(result.current.usdMismatchMessage).toBeUndefined();

            act(() => {
                result.current.handleReportingYearChange('2026');
            });

            expect(result.current.isSubmitDisabled).toBe(false);

            await act(async () => {
                await result.current.handleSave();
            });

            expect(onSubmit).toHaveBeenCalledWith({
                programId: 1,
                programName: 'Program A',
                reportingYear: '2026',
                amountUah: '400',
                amountUsd: '10',
            });
        });

        it('recalculates UAH and allows saving a legacy record once its amounts are actively edited', () => {
            const { result } = renderUseProgramExpenseForm({ recordToEdit, exchangeRate: '40' });

            act(() => {
                result.current.handleAmountFieldChange('amountUsd')('15');
            });

            act(() => {
                result.current.handleAmountBlur('amountUsd');
            });

            expect(result.current.formState.amountUah).toBe('600');
            expect(result.current.usdMismatchMessage).toBeUndefined();
            expect(result.current.isSubmitDisabled).toBe(false);
        });

        it('does not trigger program unique validation error when choosing its own program ID', () => {
            const { result } = renderUseProgramExpenseForm({ recordToEdit });

            act(() => {
                result.current.handleProgramChange(1);
            });

            expect(result.current.formState.errors.programId).toBeUndefined();
        });

        it('triggers program unique validation error when choosing another occupied program ID', () => {
            const occupiedRecords: ProgramExpensesRecord[] = [
                {
                    id: 1,
                    programId: 1,
                    programName: 'Program A',
                    type: 'expense',
                    reportingYear: '2025',
                    amountUah: '100',
                    amountUsd: '10',
                },
                {
                    id: 2,
                    programId: 2,
                    programName: 'Program B',
                    type: 'expense',
                    reportingYear: '2025',
                    amountUah: '200',
                    amountUsd: '20',
                },
            ];

            const { result } = renderUseProgramExpenseForm({
                recordToEdit: occupiedRecords[0],
                records: occupiedRecords,
            });

            act(() => {
                result.current.handleProgramChange(2);
            });

            expect(result.current.formState.errors.programId).toBe(PROGRAM_EXPENSES_TEXT.VALIDATION.PROGRAM_UNIQUE);
        });
    });
});
