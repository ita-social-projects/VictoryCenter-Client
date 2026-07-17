import { PROGRAM_EXPENSES_TEXT } from '@/const/admin/reports';
import { FundsExpendituresTransactionType } from '@/types/admin/reports';

export const isReservedFundsExpendituresCategoryName = (
    name: string,
    type: FundsExpendituresTransactionType,
): boolean =>
    type === 'expense' &&
    name.trim().toLowerCase().startsWith(PROGRAM_EXPENSES_TEXT.TABLE.TYPE_LABEL.trim().toLowerCase());
