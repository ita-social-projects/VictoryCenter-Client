import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { PROGRAM_EXPENSES_TEXT } from '@/const/admin/reports';
import { ProgramExpensesRecord } from '@/types/admin/reports';
import {
    FundsExpendituresAmountValidationTrigger,
    FundsExpendituresReportingYearValidationTrigger,
    normalizeFundsExpendituresAmountInput,
    validateFundsExpendituresAmount,
    validateFundsExpendituresReportingYear,
} from '@/validation/admin/reports-schema/funds-expenditures-record-schema/funds-expenditures-record-schema';

export type ProgramExpenseProgramValidationTrigger = 'change' | 'blur';

interface ValidateProgramExpenseProgramParams {
    recordId: number;
    programId: number | undefined;
    records: ProgramExpensesRecord[];
    trigger?: ProgramExpenseProgramValidationTrigger;
}

export const normalizeProgramExpenseAmountInput = normalizeFundsExpendituresAmountInput;

export const validateProgramExpenseAmount = (
    value: string,
    trigger: FundsExpendituresAmountValidationTrigger = 'change',
): string | undefined => validateFundsExpendituresAmount(value, trigger);

export const validateProgramExpenseReportingYear = (
    value: string | undefined,
    trigger: FundsExpendituresReportingYearValidationTrigger = 'change',
): string | undefined => validateFundsExpendituresReportingYear(value, trigger);

export const validateProgramExpenseProgram = ({
    recordId,
    programId,
    records,
    trigger = 'change',
}: ValidateProgramExpenseProgramParams): string | undefined => {
    if (programId === undefined) {
        return trigger === 'blur' ? COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.FIELD_REQUIRED : undefined;
    }

    const hasDuplicate = records.some((item) => item.id !== recordId && item.programId === programId);

    return hasDuplicate ? PROGRAM_EXPENSES_TEXT.VALIDATION.PROGRAM_UNIQUE : undefined;
};
