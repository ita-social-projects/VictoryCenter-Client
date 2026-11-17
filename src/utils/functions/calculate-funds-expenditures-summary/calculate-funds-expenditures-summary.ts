import { parseAmount } from '@/utils/functions/parse-amount/parse-amount';
import {
    FundsExpendituresSummary,
    FundsExpendituresTransactionType,
    ReportFundsExpendituresRecordState,
} from '@/types/admin/reports';

const toCents = (value: string): number => Math.round(parseAmount(value) * 100);

// Mirrors the backend summary: Math.Round(total, 0, MidpointRounding.AwayFromZero).
const roundCentsToWhole = (cents: number): number => Math.sign(cents) * Math.floor((Math.abs(cents) + 50) / 100);

const summarizeType = (records: ReportFundsExpendituresRecordState[], type: FundsExpendituresTransactionType) => {
    const recordsOfType = records.filter((record) => record.type === type);

    return {
        uah: roundCentsToWhole(recordsOfType.reduce((sum, record) => sum + toCents(record.amountUah), 0)),
        usd: roundCentsToWhole(recordsOfType.reduce((sum, record) => sum + toCents(record.amountUsd), 0)),
        categories: new Set(recordsOfType.map((record) => record.categoryId)).size,
    };
};

export const calculateFundsExpendituresSummary = (
    records: ReportFundsExpendituresRecordState[],
): FundsExpendituresSummary => {
    const income = summarizeType(records, 'income');
    const expense = summarizeType(records, 'expense');

    return {
        totalCollectedUah: income.uah,
        totalCollectedUsd: income.usd,
        totalSpentUah: expense.uah,
        totalSpentUsd: expense.usd,
        incomeCategories: income.categories,
        expenseCategories: expense.categories,
    };
};
