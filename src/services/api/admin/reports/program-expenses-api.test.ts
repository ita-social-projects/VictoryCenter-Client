import { AxiosInstance } from 'axios';
import { ProgramExpensesRecord } from '@/types/admin/reports';

const loadProgramExpensesApi = (
    records: Array<ProgramExpensesRecord & { isPublished: boolean }>,
    exchangeRate = '42.15',
) => {
    jest.resetModules();
    jest.doMock('@/utils/mock-data/admin/reports/program-expenses', () => ({
        MOCK_PROGRAM_EXPENSES_EXCHANGE_RATE: exchangeRate,
        MOCK_PROGRAM_EXPENSES_RECORDS: records,
    }));

    let api: typeof import('./program-expenses-api').ProgramExpensesApi;

    jest.isolateModules(() => {
        api = require('./program-expenses-api').ProgramExpensesApi;
    });

    return api!;
};

describe('ProgramExpensesApi', () => {
    afterEach(() => {
        jest.resetModules();
        jest.dontMock('@/utils/mock-data/admin/reports/program-expenses');
    });

    it('should return only published records with computed programs and summary', async () => {
        const api = loadProgramExpensesApi([
            {
                id: 1,
                programId: 2,
                programName: 'Program B',
                type: 'expense',
                reportingYear: '2025',
                amountUah: '1 500',
                amountUsd: '1000',
                isPublished: true,
            },
            {
                id: 2,
                programId: 1,
                programName: 'Program A',
                type: 'expense',
                reportingYear: '2025',
                amountUah: '250',
                amountUsd: '100.5',
                isPublished: true,
            },
            {
                id: 3,
                programId: 1,
                programName: 'Program A',
                type: 'expense',
                reportingYear: '2024',
                amountUah: '2000',
                amountUsd: '800',
                isPublished: true,
            },
            {
                id: 4,
                programId: 3,
                programName: 'Program C',
                type: 'expense',
                reportingYear: '2025',
                amountUah: '999',
                amountUsd: '999',
                isPublished: false,
            },
        ]);

        const result = await api.getReadOnlyData({} as AxiosInstance);

        expect(result.exchangeRate).toBe('42.15');
        expect(result.records).toEqual([
            {
                id: 2,
                programId: 1,
                programName: 'Program A',
                type: 'expense',
                reportingYear: '2025',
                amountUah: '250',
                amountUsd: '100.5',
            },
            {
                id: 1,
                programId: 2,
                programName: 'Program B',
                type: 'expense',
                reportingYear: '2025',
                amountUah: '1 500',
                amountUsd: '1000',
            },
            {
                id: 3,
                programId: 1,
                programName: 'Program A',
                type: 'expense',
                reportingYear: '2024',
                amountUah: '2000',
                amountUsd: '800',
            },
        ]);
        expect(result.programs).toEqual([
            { id: 1, name: 'Program A' },
            { id: 2, name: 'Program B' },
        ]);
        expect(result.summary).toEqual({
            totalAmountUah: 3750,
            totalAmountUsd: 1900.5,
        });
    });

    it('should return empty collections and zero summary when no records are published', async () => {
        const api = loadProgramExpensesApi(
            [
                {
                    id: 10,
                    programId: 5,
                    programName: 'Hidden Program',
                    type: 'expense',
                    reportingYear: '2025',
                    amountUah: '100',
                    amountUsd: '10',
                    isPublished: false,
                },
            ],
            '39.00',
        );

        const result = await api.getReadOnlyData({} as AxiosInstance);

        expect(result).toEqual({
            exchangeRate: '39.00',
            programs: [],
            summary: {
                totalAmountUah: 0,
                totalAmountUsd: 0,
            },
            records: [],
        });
    });
});
