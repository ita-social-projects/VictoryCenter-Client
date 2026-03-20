import {
    ReportFundsExpendituresCategory,
    ReportFundsExpendituresRecord,
    ReportFundsExpendituresSettings,
} from '@/types/admin/reports';

export const MOCK_FUNDS_EXPENDITURES_SETTINGS: ReportFundsExpendituresSettings = {
    id: 1,
    disclaimerTitle: 'Фінансовий звіт Victory Center за поточний рік. Ми забезпечуємо прозорість кожної гривні.',
    exchangeRate: '42.18',
};

export const MOCK_FUNDS_EXPENDITURES_CATEGORIES: ReportFundsExpendituresCategory[] = [
    { id: 1, name: 'Грантові кошти', type: 'income' },
    { id: 2, name: 'Благодійні внески', type: 'income' },
    { id: 3, name: 'Власні надходження', type: 'income' },
    { id: 4, name: 'Інші надходження', type: 'income' },
    { id: 5, name: 'Адміністративні витрати', type: 'expense' },
    { id: 6, name: 'Програмні витрати', type: 'expense' },
    { id: 7, name: 'Обладнання', type: 'expense' },
    { id: 8, name: 'Заробітна плата', type: 'expense' },
];

export const MOCK_FUNDS_EXPENDITURES_RECORDS: ReportFundsExpendituresRecord[] = [
    { id: 1, categoryId: 1, type: 'income', reportingYear: '2025', amountUah: '7 265', amountUsd: '4 200' },
    { id: 2, categoryId: 5, type: 'expense', reportingYear: '2025', amountUah: '3 100', amountUsd: '1 800' },
    { id: 3, categoryId: 2, type: 'income', reportingYear: '2025', amountUah: '5 800', amountUsd: '3 360' },
    { id: 4, categoryId: 6, type: 'expense', reportingYear: '2025', amountUah: '4 200', amountUsd: '2 430' },
    { id: 5, categoryId: 3, type: 'income', reportingYear: '2025', amountUah: '2 400', amountUsd: '1 390' },
    { id: 6, categoryId: 7, type: 'expense', reportingYear: '2024', amountUah: '1 950', amountUsd: '1 130' },
    { id: 7, categoryId: 8, type: 'expense', reportingYear: '2024', amountUah: '5 000', amountUsd: '2 900' },
];
