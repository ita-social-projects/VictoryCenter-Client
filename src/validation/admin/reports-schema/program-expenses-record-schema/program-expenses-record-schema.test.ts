import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { FUNDS_EXPENDITURES_TEXT, PROGRAM_EXPENSES_TEXT } from '@/const/admin/reports';
import { ProgramExpensesRecord } from '@/types/admin/reports';
import {
    normalizeProgramExpenseAmountInput,
    validateProgramExpenseAmount,
    validateProgramExpenseProgram,
    validateProgramExpenseReportingYear,
} from './program-expenses-record-schema';

describe('PROGRAM_EXPENSES_RECORD_VALIDATION_FUNCTIONS', () => {
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
        {
            id: 2,
            programId: 2,
            programName: 'Program B',
            type: 'expense',
            reportingYear: '2024',
            amountUah: '200',
            amountUsd: '20',
        },
    ];

    it('reuses funds amount normalization and validation rules', () => {
        expect(normalizeProgramExpenseAmountInput('1200.567')).toBe('1200,56');
        expect(validateProgramExpenseAmount('1234567890', 'change')).toBe(
            FUNDS_EXPENDITURES_TEXT.VALIDATION.AMOUNT_MAX_DIGITS,
        );
        expect(validateProgramExpenseAmount('0', 'save')).toBe(FUNDS_EXPENDITURES_TEXT.VALIDATION.AMOUNT_NOT_ZERO);
        expect(validateProgramExpenseAmount('1200,50', 'save')).toBeUndefined();
    });

    it('reuses reporting year required validation', () => {
        expect(validateProgramExpenseReportingYear(undefined, 'change')).toBeUndefined();
        expect(validateProgramExpenseReportingYear(undefined, 'blur')).toBe(
            COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.FIELD_REQUIRED,
        );
        expect(validateProgramExpenseReportingYear('2026', 'save')).toBeUndefined();
    });

    it('validates required program category on blur', () => {
        expect(
            validateProgramExpenseProgram({
                recordId: 0,
                programId: undefined,
                records,
                trigger: 'blur',
            }),
        ).toBe(COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.FIELD_REQUIRED);
    });

    it('validates duplicate program category', () => {
        expect(
            validateProgramExpenseProgram({
                recordId: 0,
                programId: 1,
                records,
            }),
        ).toBe(PROGRAM_EXPENSES_TEXT.VALIDATION.PROGRAM_UNIQUE);
    });

    it('passes unique program category and ignores current record', () => {
        expect(
            validateProgramExpenseProgram({
                recordId: 1,
                programId: 1,
                records,
            }),
        ).toBeUndefined();
        expect(
            validateProgramExpenseProgram({
                recordId: 0,
                programId: 3,
                records,
            }),
        ).toBeUndefined();
    });
});
