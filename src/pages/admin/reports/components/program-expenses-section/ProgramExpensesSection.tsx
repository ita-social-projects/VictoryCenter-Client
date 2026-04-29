import { useCallback, useEffect, useMemo, useState } from 'react';
import { InlineLoader } from '@/components/common/inline-loader/InlineLoader';
import { useDataFetch } from '@/hooks/common/use-data-fetch/useDataFetch';
import { ProgramExpensesApi } from '@/services/api/admin/reports/program-expenses-api';
import { ProgramExpensesReadOnlyData } from '@/types/admin/reports';
import { ProgramExpensesToolbar } from './components/program-expenses-toolbar/ProgramExpensesToolbar';
import { ProgramExpensesSummaryCard } from './components/program-expenses-summary-card/ProgramExpensesSummaryCard';
import { ProgramExpensesTable } from './components/program-expenses-table/ProgramExpensesTable';
import styles from './ProgramExpensesSection.module.scss';

const INITIAL_PROGRAM_EXPENSES_DATA: ProgramExpensesReadOnlyData = {
    exchangeRate: null,
    programs: [],
    summary: {
        totalAmountUah: 0,
        totalAmountUsd: 0,
    },
    records: [],
};

const MAX_PROGRAM_EXPENSE_RECORDS = 4;

interface ProgramExpensesSectionProps {
    isEditing?: boolean;
    syncedExchangeRate?: string | null;
}

export const ProgramExpensesSection = ({ isEditing = false, syncedExchangeRate }: ProgramExpensesSectionProps) => {
    const [selectedProgramIds, setSelectedProgramIds] = useState<number[]>([]);

    const fetchReadOnlyData = useCallback((options = {}) => ProgramExpensesApi.getReadOnlyData(options), []);

    const { data, isLoading } = useDataFetch<ProgramExpensesReadOnlyData>({
        initialData: INITIAL_PROGRAM_EXPENSES_DATA,
        fetchHandler: fetchReadOnlyData,
    });

    useEffect(() => {
        setSelectedProgramIds((previousSelectedProgramIds) => {
            const availableProgramIds = new Set(data.programs.map((program) => program.id));
            const validSelectedProgramIds = previousSelectedProgramIds.filter((id) => availableProgramIds.has(id));

            return validSelectedProgramIds.length === previousSelectedProgramIds.length
                ? previousSelectedProgramIds
                : validSelectedProgramIds;
        });
    }, [data.programs]);

    const filteredRecords = useMemo(() => {
        if (selectedProgramIds.length === 0) {
            return data.records;
        }

        return data.records.filter((record) => selectedProgramIds.includes(record.programId));
    }, [data.records, selectedProgramIds]);

    const programExpenseRecordsCount = data.records.length;
    const hasAnyProgramExpenseRecords = programExpenseRecordsCount > 0;
    const isInitialLoading = isLoading && programExpenseRecordsCount === 0 && data.programs.length === 0;
    const exchangeRate = isEditing ? (syncedExchangeRate ?? null) : data.exchangeRate;
    const isAddProgramExpenseDisabled = programExpenseRecordsCount >= MAX_PROGRAM_EXPENSE_RECORDS;

    if (isInitialLoading) {
        return (
            <div className={styles.section}>
                <div className={styles['loader-container']}>
                    <InlineLoader size={3} />
                </div>
            </div>
        );
    }

    return (
        <div className={styles.section}>
            <ProgramExpensesSummaryCard summary={data.summary} />

            <div className={styles.filters}>
                <ProgramExpensesToolbar
                    programs={data.programs}
                    selectedProgramIds={selectedProgramIds}
                    exchangeRate={exchangeRate}
                    isEditing={isEditing}
                    isAddProgramExpenseDisabled={isAddProgramExpenseDisabled}
                    onProgramChange={setSelectedProgramIds}
                />
                <ProgramExpensesTable
                    records={filteredRecords}
                    hasAnyProgramExpenseRecords={hasAnyProgramExpenseRecords}
                    isEditing={isEditing}
                />
            </div>
        </div>
    );
};
