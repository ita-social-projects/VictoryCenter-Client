import { useCallback, useEffect, useMemo, useState } from 'react';
import { InlineLoader } from '@/components/common/inline-loader/InlineLoader';
import { useDataFetch } from '@/hooks/common/use-data-fetch/useDataFetch';
import { useAdminClient } from '@/hooks/admin/use-admin-client/useAdminClient';
import { useToast } from '@/contexts/admin/toast-context-provider/ToastContextProvider';
import { ToastType } from '@/types/admin/toast';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { PROGRAM_EXPENSES_TEXT, REPORTS_TEXT } from '@/const/admin/reports';
import { ProgramExpensesApi } from '@/services/api/admin/reports/program-expenses-api';
import { ProgramsCategoriesApi } from '@/services/api/admin/programs/programs-api';
import { ProgramExpensesReadOnlyData, ProgramExpensesRecord } from '@/types/admin/reports';
import { ProgramExpensesToolbar } from './components/program-expenses-toolbar/ProgramExpensesToolbar';
import { ProgramExpensesSummaryCard } from './components/program-expenses-summary-card/ProgramExpensesSummaryCard';
import { ProgramExpensesTable } from './components/program-expenses-table/ProgramExpensesTable';
import { AddProgramExpenseRecordModal } from './components/common/add-program-expense-record-modal/AddProgramExpenseRecordModal';
import { DeleteRecordModal } from '../funds-expenditures-section/components/common/delete-record-modal/DeleteRecordModal';
import { validateFundsExpendituresExchangeRate } from '@/validation/admin/reports-schema/funds-expenditures-exchange-rate-schema/funds-expenditures-exchange-rate-schema';
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
    isRowEditMode?: boolean;
    onRowEditModeChange?: (isEditing: boolean) => void;
    onCountsChange?: (count: number) => void;
    onDataChange?: () => void;
    exchangeRate: string | null;
}

export const ProgramExpensesSection = ({
    isEditing = true,
    isRowEditMode: propIsRowEditMode,
    onRowEditModeChange,
    onCountsChange,
    onDataChange,
    exchangeRate,
}: ProgramExpensesSectionProps) => {
    const adminClient = useAdminClient();
    const { addToast } = useToast();
    const [selectedProgramIds, setSelectedProgramIds] = useState<number[]>([]);
    const [isAddProgramExpenseModalOpen, setIsAddProgramExpenseModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [recordToDelete, setRecordToDelete] = useState<ProgramExpensesRecord | null>(null);
    const [isDeletingRecord, setIsDeletingRecord] = useState(false);
    const [selectedRecordIds, setSelectedRecordIds] = useState<number[]>([]);
    const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
    const [isBulkDeleting, setIsBulkDeleting] = useState(false);

    const [localIsRowEditMode, setLocalIsRowEditMode] = useState(false);
    const isRowEditMode = propIsRowEditMode ?? localIsRowEditMode;
    const handleRowEditModeChange = useCallback(
        (val: boolean) => {
            setLocalIsRowEditMode(val);
            onRowEditModeChange?.(val);
            if (val) {
                setSelectedRecordIds([]);
            }
        },
        [onRowEditModeChange, setSelectedRecordIds],
    );

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
            setSelectedRecordIds([]);
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
    const isAddProgramExpenseDisabled = programExpenseRecordsCount >= MAX_PROGRAM_EXPENSE_RECORDS || isRowEditMode;
    const currentExchangeRate = isEditing ? exchangeRate : data.exchangeRate;
    const hasExchangeRateError = Boolean(validateFundsExpendituresExchangeRate(currentExchangeRate ?? '', 'blur'));

    useEffect(() => {
        onCountsChange?.(programExpenseRecordsCount);
    }, [programExpenseRecordsCount, onCountsChange]);

    const handleOpenAddProgramExpenseModal = useCallback(() => {
        setIsAddProgramExpenseModalOpen(true);
    }, []);

    const handleCloseAddProgramExpenseModal = useCallback(() => {
        setIsAddProgramExpenseModalOpen(false);
    }, []);

    const handleRecordSave = useCallback(
        async (
            recordId: number,
            programId: number,
            reportingYear: string,
            amountUah: string,
            amountUsd: string,
        ): Promise<boolean> => {
            try {
                const payload = {
                    reportingYear: Number.parseInt(reportingYear, 10),
                    hippotherapyProgramCategoryId: programId,
                    amountUah: Number.parseFloat(amountUah.replace(/\s/g, '').replace(',', '.')),
                    amountUsd: Number.parseFloat(amountUsd.replace(/\s/g, '').replace(',', '.')),
                };

                await ProgramExpensesApi.update(adminClient, recordId, payload);
                onDataChange?.();
                addToast(REPORTS_TEXT.MESSAGE.RECORD_UPDATED_SUCCESSFULLY, ToastType.Success);

                try {
                    await refetchReadOnlyData(true);
                } catch {
                    // Refetch error handled by useDataFetch
                }

                return true;
            } catch {
                addToast(REPORTS_TEXT.MESSAGE.RECORD_UPDATE_FAILED_RETRY, ToastType.Error);
                return false;
            }
        },
        [adminClient, refetchReadOnlyData, addToast, onDataChange],
    );

    const handleSubmitAddProgramExpense = useCallback(
        async (submitData: {
            programId: number | undefined;
            programName: string;
            reportingYear: string;
            amountUah: string;
            amountUsd: string;
        }) => {
            const reportingYear = Number.parseInt(submitData.reportingYear, 10);
            const amountUah = Number.parseFloat(submitData.amountUah.replace(/\s/g, '').replace(',', '.'));
            const amountUsd = Number.parseFloat(submitData.amountUsd.replace(/\s/g, '').replace(',', '.'));

            if (!Number.isFinite(reportingYear) || !Number.isFinite(amountUah) || !Number.isFinite(amountUsd)) {
                return false;
            }

            try {
                let categoryId = submitData.programId;

                if (categoryId === undefined) {
                    const createdCategory = await ProgramsCategoriesApi.addProgramCategory(
                        { id: null, name: submitData.programName },
                        adminClient,
                    );
                    categoryId = createdCategory.id;
                }

                const payload = {
                    reportingYear,
                    hippotherapyProgramCategoryId: categoryId,
                    amountUah,
                    amountUsd,
                };

                await ProgramExpensesApi.post(adminClient, payload);
                onDataChange?.();
                addToast(PROGRAM_EXPENSES_TEXT.MESSAGE.RECORD_CREATED_SUCCESSFULLY, ToastType.Success);

                setIsAddProgramExpenseModalOpen(false);

                try {
                    await refetchReadOnlyData(true);
                } catch {
                    // Refetch error handled by useDataFetch
                }

                return true;
            } catch {
                addToast(PROGRAM_EXPENSES_TEXT.MESSAGE.RECORD_CREATE_FAILED_RETRY, ToastType.Error);
                return false;
            }
        },
        [adminClient, refetchReadOnlyData, addToast, onDataChange],
    );

    const handleDeleteClick = useCallback((record: ProgramExpensesRecord) => {
        setRecordToDelete(record);
        setIsDeleteModalOpen(true);
    }, []);

    const handleConfirmDelete = useCallback(async () => {
        if (!recordToDelete) return;

        setIsDeletingRecord(true);

        try {
            await ProgramExpensesApi.delete(adminClient, recordToDelete.id);
            onDataChange?.();
            addToast(PROGRAM_EXPENSES_TEXT.MESSAGE.RECORD_DELETED_SUCCESSFULLY, ToastType.Success);
            setIsDeleteModalOpen(false);

            try {
                await refetchReadOnlyData(true);
            } catch {
                // Refetch error handled by useDataFetch
            }
        } catch {
            addToast(PROGRAM_EXPENSES_TEXT.MESSAGE.RECORD_DELETE_FAILED_RETRY, ToastType.Error);
        } finally {
            setIsDeletingRecord(false);
            setRecordToDelete(null);
        }
    }, [recordToDelete, adminClient, addToast, refetchReadOnlyData, onDataChange]);

    const handleCancelDelete = useCallback(() => {
        setIsDeleteModalOpen(false);
        setRecordToDelete(null);
    }, []);

    const toggleRecordSelection = useCallback((id: number) => {
        setSelectedRecordIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    }, []);

    const handleSelectAllToggle = useCallback(
        (checked: boolean) => {
            if (checked) {
                setSelectedRecordIds(filteredRecords.map((record) => record.id));
            } else {
                setSelectedRecordIds([]);
            }
        },
        [filteredRecords],
    );

    const handleOpenBulkDeleteModal = useCallback(() => setIsBulkDeleteModalOpen(true), []);

    const handleBulkDeleteCancel = useCallback(() => {
        setIsBulkDeleteModalOpen(false);
        setSelectedRecordIds([]);
    }, []);

    const handleConfirmBulkDelete = useCallback(async () => {
        if (selectedRecordIds.length === 0) {
            setIsBulkDeleteModalOpen(false);
            return;
        }
        setIsBulkDeleting(true);

        try {
            await ProgramExpensesApi.bulkDelete(adminClient, selectedRecordIds);
            onDataChange?.();
            setSelectedRecordIds([]);
            setIsBulkDeleteModalOpen(false);
            refetchReadOnlyData();
            addToast(PROGRAM_EXPENSES_TEXT.BULK.DELETE_SUCCESS, ToastType.Success);
        } catch {
            setIsBulkDeleteModalOpen(false);
            addToast(PROGRAM_EXPENSES_TEXT.BULK.DELETE_FAILED, ToastType.Error, 5000);
        } finally {
            setIsBulkDeleting(false);
        }
    }, [adminClient, selectedRecordIds, refetchReadOnlyData, addToast, onDataChange]);

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
                    exchangeRate={currentExchangeRate}
                    isEditing={isEditing}
                    isAddProgramExpenseDisabled={isAddProgramExpenseDisabled || !isEditing || hasExchangeRateError}
                    onProgramChange={setSelectedProgramIds}
                    onAddProgramExpense={handleOpenAddProgramExpenseModal}
                    disabled={isRowEditMode}
                />
                <ProgramExpensesTable
                    records={filteredRecords}
                    allRecords={data.records}
                    programs={data.programs}
                    hasAnyProgramExpenseRecords={hasAnyProgramExpenseRecords}
                    isEditing={isEditing}
                    isAddProgramExpenseDisabled={isAddProgramExpenseDisabled || !isEditing || hasExchangeRateError}
                    onAddProgramExpense={isEditing ? handleOpenAddProgramExpenseModal : undefined}
                    onRecordSave={isEditing ? handleRecordSave : undefined}
                    onRowEditModeChange={handleRowEditModeChange}
                    onDeleteRecord={isEditing ? handleDeleteClick : undefined}
                    selectedRecordIds={selectedRecordIds}
                    onToggleRecordSelection={toggleRecordSelection}
                    onSelectAllToggle={handleSelectAllToggle}
                    onOpenBulkDelete={handleOpenBulkDeleteModal}
                    exchangeRate={currentExchangeRate}
                    isRowActionsDisabled={isRowEditMode || hasExchangeRateError}
                />
            </div>

            <AddProgramExpenseRecordModal
                isOpen={isAddProgramExpenseModalOpen}
                programs={data.programs}
                records={data.records}
                exchangeRate={currentExchangeRate}
                onClose={handleCloseAddProgramExpenseModal}
                onSubmit={handleSubmitAddProgramExpense}
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

            <DeleteRecordModal
                isOpen={isBulkDeleteModalOpen}
                title={PROGRAM_EXPENSES_TEXT.BULK.DELETE_CONFIRM_TITLE}
                confirmText={COMMON_TEXT_ADMIN.BUTTON.YES}
                cancelText={COMMON_TEXT_ADMIN.BUTTON.NO}
                isButtonsDisabled={isBulkDeleting}
                onConfirm={handleConfirmBulkDelete}
                onCancel={handleBulkDeleteCancel}
                onClose={handleBulkDeleteCancel}
            />
        </div>
    );
};
