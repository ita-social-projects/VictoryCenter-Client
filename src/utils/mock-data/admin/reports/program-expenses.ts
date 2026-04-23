import { ProgramExpensesProgram, ProgramExpensesRecord } from '@/types/admin/reports';

interface MockProgramExpensesRecord extends ProgramExpensesRecord {
    isPublished: boolean;
}

export const MOCK_PROGRAM_EXPENSES_EXCHANGE_RATE = '42.15';

export const MOCK_PROGRAM_EXPENSES_PROGRAMS: ProgramExpensesProgram[] = [
    {
        id: 101,
        name: 'Дитяча реабілітація',
    },
    {
        id: 102,
        name: 'Ветеранська реабілітація',
    },
    {
        id: 105,
        name: 'Іпотерапія для дорослих',
    },
    {
        id: 106,
        name: 'Раннє втручання',
    },
];

export const MOCK_PROGRAM_EXPENSES_RECORDS: MockProgramExpensesRecord[] = [
    {
        id: 1,
        programId: 101,
        programName: 'Дитяча реабілітація',
        type: 'expense',
        reportingYear: '2025',
        amountUah: '1500',
        amountUsd: '1000',
        isPublished: true,
    },
    {
        id: 2,
        programId: 101,
        programName: 'Дитяча реабілітація',
        type: 'expense',
        reportingYear: '2025',
        amountUah: '1765',
        amountUsd: '1200',
        isPublished: true,
    },
    {
        id: 3,
        programId: 103,
        programName: 'Адаптивний спорт',
        type: 'expense',
        reportingYear: '2024',
        amountUah: '2000',
        amountUsd: '1000',
        isPublished: true,
    },
    {
        id: 4,
        programId: 104,
        programName: 'Психологічна підтримка',
        type: 'expense',
        reportingYear: '2024',
        amountUah: '2000',
        amountUsd: '1000',
        isPublished: true,
    },
    {
        id: 5,
        programId: 102,
        programName: 'Ветеранська реабілітація',
        type: 'expense',
        reportingYear: '2025',
        amountUah: '900',
        amountUsd: '400',
        isPublished: false,
    },
];
