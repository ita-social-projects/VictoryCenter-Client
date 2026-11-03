import { calculateFundsExpendituresSummary } from './calculate-funds-expenditures-summary';
import { ReportFundsExpendituresRecordState } from '@/types/admin/reports';

const createRecord = (overrides: Partial<ReportFundsExpendituresRecordState>): ReportFundsExpendituresRecordState => ({
    id: 1,
    categoryId: 1,
    type: 'income',
    reportingYear: '2025',
    amountUah: '0',
    amountUsd: '0',
    lastEditedField: 'amountUah',
    ...overrides,
});

describe('calculateFundsExpendituresSummary', () => {
    it('returns zeros for an empty list', () => {
        expect(calculateFundsExpendituresSummary([])).toEqual({
            totalCollectedUah: 0,
            totalCollectedUsd: 0,
            totalSpentUah: 0,
            totalSpentUsd: 0,
            incomeCategories: 0,
            expenseCategories: 0,
        });
    });

    it('sums income and expense totals separately and counts categories per type', () => {
        const records = [
            createRecord({ id: 1, categoryId: 1, type: 'income', amountUah: '7265', amountUsd: '4200' }),
            createRecord({ id: 2, categoryId: 2, type: 'income', amountUah: '1000', amountUsd: '25' }),
            createRecord({ id: 3, categoryId: 5, type: 'expense', amountUah: '3100', amountUsd: '1800' }),
        ];

        expect(calculateFundsExpendituresSummary(records)).toEqual({
            totalCollectedUah: 8265,
            totalCollectedUsd: 4225,
            totalSpentUah: 3100,
            totalSpentUsd: 1800,
            incomeCategories: 2,
            expenseCategories: 1,
        });
    });

    it('parses comma decimals and spaced thousands', () => {
        const records = [createRecord({ type: 'expense', amountUah: '1 500,25', amountUsd: '12,50' })];

        const summary = calculateFundsExpendituresSummary(records);

        expect(summary.totalSpentUah).toBe(1500);
        expect(summary.totalSpentUsd).toBe(13);
    });

    it('rounds the summed total, not each record, half away from zero', () => {
        const records = [
            createRecord({ id: 1, categoryId: 1, amountUsd: '0,25' }),
            createRecord({ id: 2, categoryId: 2, amountUsd: '0,25' }),
        ];

        expect(calculateFundsExpendituresSummary(records).totalCollectedUsd).toBe(1);
    });

    it('avoids floating point drift when summing decimals', () => {
        const records = [
            createRecord({ id: 1, categoryId: 1, amountUah: '0,70' }),
            createRecord({ id: 2, categoryId: 2, amountUah: '1,40' }),
            createRecord({ id: 3, categoryId: 3, amountUah: '1,40' }),
        ];

        // A plain float sum gives 3.4999999999999996 and would round down to 3.
        expect(calculateFundsExpendituresSummary(records).totalCollectedUah).toBe(4);
    });

    it('counts a category once even if several records use it', () => {
        const records = [
            createRecord({ id: 1, categoryId: 7, type: 'expense' }),
            createRecord({ id: 2, categoryId: 7, type: 'expense' }),
        ];

        expect(calculateFundsExpendituresSummary(records).expenseCategories).toBe(1);
    });
});
