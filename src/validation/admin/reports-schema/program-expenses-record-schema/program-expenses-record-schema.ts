import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { PROGRAM_EXPENSES_TEXT } from '@/const/admin/reports';
import { ProgramExpensesRecord } from '@/types/admin/reports';

export type ProgramExpenseProgramValidationTrigger = 'change' | 'blur';

interface ValidateProgramExpenseProgramParams {
    recordId: number;
    programId: number | undefined;
    records: ProgramExpensesRecord[];
    trigger?: ProgramExpenseProgramValidationTrigger;
}

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
