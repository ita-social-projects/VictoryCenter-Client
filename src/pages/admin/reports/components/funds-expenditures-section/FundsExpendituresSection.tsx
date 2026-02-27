import { Select } from '@/components/common/select/Select';
import { FundsExpendituresTable } from './components/funds-expenditures-table/FundsExpendituresTable';
import { useState, useMemo } from 'react';
import { SummaryCard } from './components/summary-card/SummaryCard';

const MOCK_RECORDS: MockFundsExpendituresRecord[] = [
    { id: 1, reportYear: 2026, type: 'income', category: 'Грантові кошти', amountUAH: 4200, amountUSD: 4200 },
    { id: 2, reportYear: 2026, type: 'income', category: 'Грантові кошти', amountUAH: 4200, amountUSD: 4200 },
    { id: 3, reportYear: 2025, type: 'income', category: 'Грантові кошти', amountUAH: 4200, amountUSD: 4200 },
    { id: 4, reportYear: 2025, type: 'income', category: 'Грантові кошти', amountUAH: 4200, amountUSD: 4200 },
    { id: 5, reportYear: 2024, type: 'income', category: 'Грантові кошти', amountUAH: 4200, amountUSD: 4200 },
    { id: 6, reportYear: 2024, type: 'income', category: 'Грантові кошти', amountUAH: 4200, amountUSD: 4200 },
    { id: 7, reportYear: 2023, type: 'income', category: 'Грантові кошти', amountUAH: 4200, amountUSD: 4200 },
    { id: 8, reportYear: 2023, type: 'income', category: 'Грантові кошти', amountUAH: 4200, amountUSD: 4200 },
];

type TransactionType = 'income' | 'expense';

interface MockFundsExpendituresRecord {
    id: number;
    reportYear: number;
    type: TransactionType;
    category: string;
    amountUAH: number;
    amountUSD: number;
}

interface SummaryCards {
    totalCollectedUAH: number;
    totalCollectedUSD: number;
    totalSpentUAH: number;
    totalSpentUSD: number;
    incomeCategories: number;
    expenseCategories: number;
}

interface FundsExpendituresSectionProps {
    isEditing: boolean;
}

export const FundsExpenditureSection = ({ isEditing }: FundsExpendituresSectionProps) => {
    const [records, setRecords] = useState<MockFundsExpendituresRecord[]>(MOCK_RECORDS);

    const summary: SummaryCards = useMemo(() => {
        const income = records.filter((r) => r.type === 'income');
        const expense = records.filter((r) => r.type === 'expense');
        return {
            totalCollectedUAH: income.reduce((s, r) => s + r.amountUAH, 0),
            totalCollectedUSD: income.reduce((s, r) => s + r.amountUSD, 0),
            totalSpentUAH: expense.reduce((s, r) => s + r.amountUAH, 0),
            totalSpentUSD: expense.reduce((s, r) => s + r.amountUSD, 0),
            incomeCategories: new Set(income.map((r) => r.category)).size,
            expenseCategories: new Set(expense.map((r) => r.category)).size,
        };
    }, [records]);

    return (
        <>
            <div>Фінансовий звіт Victory Center за поточний рік. Ми забезпечуємо прозорість кожної гривні</div>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 28 }}>
                <SummaryCard title="Зібрано коштів" uah={summary.totalCollectedUAH} usd={summary.totalCollectedUSD} />
                <SummaryCard
                    title="Витрачено коштів"
                    uah={summary.totalSpentUAH}
                    usd={summary.totalSpentUSD}
                    blueTheme
                />
                <SummaryCard title="Категорії надходжень" count={summary.incomeCategories} />
                <SummaryCard title="Категорії витрат" count={summary.expenseCategories} blueTheme />
            </div>
            <div>
                {/* <Select
                    children={undefined}
                    onValueChange={function (value: unknown): void {
                        throw new Error('Function not implemented.');
                    }}
                ></Select> */}
                <div>
                    <div>select 1</div>
                    <div>select 2</div>
                </div>
                <div>exchange rate usd/uah</div>
            </div>
            <FundsExpendituresTable records={MOCK_RECORDS} />
        </>
    );
};
