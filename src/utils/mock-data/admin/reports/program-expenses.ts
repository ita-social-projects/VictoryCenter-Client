import { ProgramExpensesRecord } from '@/types/admin/reports';

interface MockProgramExpensesRecord extends ProgramExpensesRecord {
    isPublished: boolean;
}

export const MOCK_PROGRAM_EXPENSES_EXCHANGE_RATE = '42.15';

export const MOCK_PROGRAM_EXPENSES_RECORDS: MockProgramExpensesRecord[] = [
    {
        id: 1,
        programId: 101,
        programName: 'Лікування дітей',
        type: 'expense',
        reportingYear: '2025',
        amountUah: '1500',
        amountUsd: '1000',
        isPublished: true,
    },
    {
        id: 2,
        programId: 101,
        programName: 'Лікування дітей',
        type: 'expense',
        reportingYear: '2025',
        amountUah: '1765',
        amountUsd: '1200',
        isPublished: true,
    },
    {
        id: 3,
        programId: 101,
        programName: 'Лікування дітей',
        type: 'expense',
        reportingYear: '2025',
        amountUah: '2000',
        amountUsd: '1000',
        isPublished: true,
    },
    {
        id: 4,
        programId: 101,
        programName: 'Лікування дітей',
        type: 'expense',
        reportingYear: '2025',
        amountUah: '2000',
        amountUsd: '1000',
        isPublished: true,
    },
    {
        id: 5,
        programId: 102,
        programName: 'Реабілітація ветеранів',
        type: 'expense',
        reportingYear: '2025',
        amountUah: '900',
        amountUsd: '400',
        isPublished: false,
    },
];
