import { useCallback, useMemo, useState } from 'react';
import { InlineLoader } from '@/components/common/inline-loader/InlineLoader';
import { useDataFetch } from '@/hooks/common/use-data-fetch/useDataFetch';
import { useAdminClient } from '@/hooks/admin/use-admin-client/useAdminClient';
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

export const ProgramExpensesSection = () => {
    const adminClient = useAdminClient();
    const [selectedProgramId, setSelectedProgramId] = useState<number | undefined>(undefined);

    const fetchReadOnlyData = useCallback(
        (options = {}) => ProgramExpensesApi.getReadOnlyData(adminClient, options),
        [adminClient],
    );

    const { data, isLoading } = useDataFetch<ProgramExpensesReadOnlyData>({
        initialData: INITIAL_PROGRAM_EXPENSES_DATA,
        fetchHandler: fetchReadOnlyData,
    });

    const filteredRecords = useMemo(() => {
        if (!selectedProgramId) {
            return data.records;
        }

        return data.records.filter((record) => record.programId === selectedProgramId);
    }, [data.records, selectedProgramId]);

    const isInitialLoading = isLoading && data.records.length === 0 && data.programs.length === 0;

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
                    selectedProgramId={selectedProgramId}
                    exchangeRate={data.exchangeRate}
                    onProgramChange={setSelectedProgramId}
                />
                <ProgramExpensesTable records={filteredRecords} />
            </div>
        </div>
    );
};
