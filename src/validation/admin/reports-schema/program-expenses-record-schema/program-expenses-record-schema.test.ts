import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { PROGRAM_EXPENSES_TEXT } from '@/const/admin/reports';
import { ProgramExpensesRecord } from '@/types/admin/reports';
import { PROGRAM_CATEGORY_VALIDATION_FUNCTIONS } from '@/validation/admin/program-category-schema/program-category-schema';
import { validateProgramExpenseProgram } from './program-expenses-record-schema';

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

    it('validates required program category on blur', () => {
        expect(
            validateProgramExpenseProgram({
                recordId: 0,
                programId: undefined,
                records,
            }),
        ).toBeUndefined();
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

    it('validates a custom (not yet existing) category name using category name rules', () => {
        expect(
            validateProgramExpenseProgram({
                recordId: 0,
                programId: undefined,
                programName: 'ab',
                records,
            }),
        ).toBe(PROGRAM_CATEGORY_VALIDATION_FUNCTIONS.validateName('ab'));
        expect(
            validateProgramExpenseProgram({
                recordId: 0,
                programId: undefined,
                programName: 'New Category',
                records,
            }),
        ).toBeUndefined();
    });

    it('treats whitespace-only custom category name as empty', () => {
        expect(
            validateProgramExpenseProgram({
                recordId: 0,
                programId: undefined,
                programName: '   ',
                records,
                trigger: 'blur',
            }),
        ).toBe(COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.FIELD_REQUIRED);
    });
});
