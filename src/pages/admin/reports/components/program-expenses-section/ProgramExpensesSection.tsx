import { useCallback, useEffect, useMemo, useState } from 'react';
import { PROGRAM_EXPENSES_TEXT } from '@/const/admin/reports';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { InlineLoader } from '@/components/common/inline-loader/InlineLoader';
import { useDataFetch } from '@/hooks/common/use-data-fetch/useDataFetch';
import { useAdminClient } from '@/hooks/admin/use-admin-client/useAdminClient';
import { ProgramExpensesApi } from '@/services/api/admin/reports/program-expenses-api';
import { ProgramExpensesReadOnlyData, ProgramExpensesRecord } from '@/types/admin/reports';
import { ToastType } from '@/types/admin/toast';
import { ProgramExpensesToolbar } from './components/program-expenses-toolbar/ProgramExpensesToolbar';
import { ProgramExpensesSummaryCard } from './components/program-expenses-summary-card/ProgramExpensesSummaryCard';
import { ProgramExpensesTable } from './components/program-expenses-table/ProgramExpensesTable';
import { AddProgramExpenseRecordModal } from './components/common/add-program-expense-record-modal/AddProgramExpenseRecordModal';
import { DeleteRecordModal } from '../funds-expenditures-section/components/common/delete-record-modal/DeleteRecordModal';
import { useToast } from '@/contexts/admin/toast-context-provider/ToastContextProvider';
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
}

export const ProgramExpensesSection = ({ isEditing = false }: ProgramExpensesSectionProps) => {
    const adminClient = useAdminClient();
    const { addToast } = useToast();
    const [selectedProgramIds, setSelectedProgramIds] = useState<number[]>([]);
    const [isAddProgramExpenseModalOpen, setIsAddProgramExpenseModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [recordToDelete, setRecordToDelete] = useState<ProgramExpensesRecord | null>(null);
    const [isDeletingRecord, setIsDeletingRecord] = useState(false);

    const fetchReadOnlyData = useCallback(
        (options = {}) => ProgramExpensesApi.getReadOnlyData(adminClient, options),
        [adminClient],
    );

    const {
        data,
        isLoading,
        refetch: refetchReadOnlyData,
    } = useDataFetch<ProgramExpensesReadOnlyData>({
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

    useEffect(() => {
        if (!isEditing) {
            setIsAddProgramExpenseModalOpen(false);
        }
    }, [isEditing]);

    const filteredRecords = useMemo(() => {
        if (selectedProgramIds.length === 0) {
            return data.records;
        }

        return data.records.filter((record) => selectedProgramIds.includes(record.programId));
    }, [data.records, selectedProgramIds]);

    const programExpenseRecordsCount = data.records.length;
    const hasAnyProgramExpenseRecords = programExpenseRecordsCount > 0;
    const isInitialLoading = isLoading && programExpenseRecordsCount === 0 && data.programs.length === 0;
    const exchangeRate = data.exchangeRate;
    const isAddProgramExpenseDisabled = programExpenseRecordsCount >= MAX_PROGRAM_EXPENSE_RECORDS;

    const handleOpenAddProgramExpenseModal = useCallback(() => {
        setIsAddProgramExpenseModalOpen(true);
    }, []);

    const handleCloseAddProgramExpenseModal = useCallback(() => {
        setIsAddProgramExpenseModalOpen(false);
    }, []);

    const handleDeleteClick = useCallback((record: ProgramExpensesRecord) => {
        setRecordToDelete(record);
        setIsDeleteModalOpen(true);
    }, []);

    const handleConfirmDelete = useCallback(async () => {
        if (!recordToDelete) return;

        setIsDeletingRecord(true);

        try {
            await ProgramExpensesApi.delete(adminClient, recordToDelete.id);
            refetchReadOnlyData();
            addToast(PROGRAM_EXPENSES_TEXT.MESSAGE.RECORD_DELETED_SUCCESSFULLY, ToastType.Success);
            setIsDeleteModalOpen(false);
        } catch {
            addToast(PROGRAM_EXPENSES_TEXT.MESSAGE.RECORD_DELETE_FAILED_RETRY, ToastType.Error);
        } finally {
            setIsDeletingRecord(false);
            setRecordToDelete(null);
        }
    }, [recordToDelete, adminClient, addToast, refetchReadOnlyData]);

    const handleCancelDelete = useCallback(() => {
        setIsDeleteModalOpen(false);
        setRecordToDelete(null);
    }, []);

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
                    onAddProgramExpense={handleOpenAddProgramExpenseModal}
                />
                <ProgramExpensesTable
                    records={filteredRecords}
                    hasAnyProgramExpenseRecords={hasAnyProgramExpenseRecords}
                    isEditing={isEditing}
                    isAddProgramExpenseDisabled={isAddProgramExpenseDisabled || !isEditing}
                    onAddProgramExpense={isEditing ? handleOpenAddProgramExpenseModal : undefined}
                    onDeleteRecord={isEditing ? handleDeleteClick : undefined}
                />
            </div>

            <AddProgramExpenseRecordModal
                isOpen={isAddProgramExpenseModalOpen}
                programs={data.programs}
                records={data.records}
                exchangeRate={exchangeRate}
                onClose={handleCloseAddProgramExpenseModal}
            />

            <DeleteRecordModal
                isOpen={isDeleteModalOpen}
                title={PROGRAM_EXPENSES_TEXT.MODAL.DELETE.TITLE}
                confirmText={COMMON_TEXT_ADMIN.BUTTON.YES}
                cancelText={COMMON_TEXT_ADMIN.BUTTON.NO}
                isButtonsDisabled={isDeletingRecord}
                onConfirm={handleConfirmDelete}
                onCancel={handleCancelDelete}
                onClose={handleCancelDelete}
            />
        </div>
    );
};
