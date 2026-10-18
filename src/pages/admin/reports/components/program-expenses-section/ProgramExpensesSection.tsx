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
import {
    FundsExpendituresTransactionType,
    ProgramExpensesProgram,
    ProgramExpensesReadOnlyData,
    ProgramExpensesRecord,
    ReportProgramExpendituresRecordState,
} from '@/types/admin/reports';
import { ProgramExpensesToolbar } from './components/program-expenses-toolbar/ProgramExpensesToolbar';
import { ProgramExpensesSummaryCard } from './components/program-expenses-summary-card/ProgramExpensesSummaryCard';
import { ProgramExpensesTable } from './components/program-expenses-table/ProgramExpensesTable';
import { AddProgramExpenseRecordModal } from './components/common/add-program-expense-record-modal/AddProgramExpenseRecordModal';
import { DeleteRecordModal } from '../funds-expenditures-section/components/common/delete-record-modal/DeleteRecordModal';
import { validateFundsExpendituresExchangeRate } from '@/validation/admin/reports-schema/funds-expenditures-exchange-rate-schema/funds-expenditures-exchange-rate-schema';
import styles from './ProgramExpensesSection.module.scss';
import { getTempId, isTempId } from '@/utils/functions/reports-records-temp-ids/reports-records-temp-ids';
import { handleLocalRecordsBulkDelete } from '@/utils/functions/handle-local-records-bulk-delete/handle-local-records-bulk-delete';

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
    registerSaveCallback?: (saveFn: () => Promise<boolean>) => void;
    exchangeRate: string | null;
}

export const ProgramExpensesSection = ({
    isEditing = true,
    isRowEditMode: propIsRowEditMode,
    onRowEditModeChange,
    onCountsChange,
    onDataChange,
    registerSaveCallback,
    exchangeRate,
}: ProgramExpensesSectionProps) => {
    const adminClient = useAdminClient();
    const { addToast } = useToast();
    const [selectedProgramIds, setSelectedProgramIds] = useState<number[]>([]);
    const [isAddProgramExpenseModalOpen, setIsAddProgramExpenseModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [recordToDelete, setRecordToDelete] = useState<ProgramExpensesRecord | null>(null);
    const [selectedRecordIds, setSelectedRecordIds] = useState<number[]>([]);
    const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);

    const [programsState, setProgramsState] = useState<ProgramExpensesProgram[]>([]);
    const [recordsState, setRecordsState] = useState<ReportProgramExpendituresRecordState[]>([]);
    const [updatedRecordIds, setUpdatedRecordIds] = useState<number[]>([]);
    const [deletedRecordIds, setDeletedRecordIds] = useState<number[]>([]);

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
        setRecordsState(
            data.records.map((record) => ({
                id: record.id,
                hippotherapyProgramCategoryId: record.programId,
                reportingYear: record.reportingYear,
                amountUah: record.amountUah,
                amountUsd: record.amountUsd,
            })),
        );
    }, [data.records]);

    useEffect(() => {
        setProgramsState(data.programs);
    }, [data.programs]);

    useEffect(() => {
        setSelectedProgramIds((previousSelectedProgramIds) => {
            const availableProgramIds = new Set(programsState.map((program) => program.id));
            const validSelectedProgramIds = previousSelectedProgramIds.filter((id) => availableProgramIds.has(id));

            return validSelectedProgramIds.length === previousSelectedProgramIds.length
                ? previousSelectedProgramIds
                : validSelectedProgramIds;
        });
    }, [programsState]);

    useEffect(() => {
        if (!isEditing) {
            setIsAddProgramExpenseModalOpen(false);
            setSelectedRecordIds([]);
            refetchReadOnlyData(true).catch(() => {
                addToast(COMMON_TEXT_ADMIN.MESSAGE.FAIL_TO_FETCH_DATA, ToastType.Error);
            });
        }
    }, [isEditing, refetchReadOnlyData, addToast]);

    const tableRecords = useMemo(() => {
        const programNames = new Map(programsState.map((program) => [program.id, program.name]));

        return recordsState.map((record) => ({
            id: record.id,
            programId: record.hippotherapyProgramCategoryId,
            programName: programNames.get(record.hippotherapyProgramCategoryId) ?? '',
            type: 'expense' as FundsExpendituresTransactionType,
            reportingYear: record.reportingYear,
            amountUah: record.amountUah,
            amountUsd: record.amountUsd,
        }));
    }, [recordsState, programsState]);

    const filteredRecords = useMemo(() => {
        if (selectedProgramIds.length === 0) {
            return tableRecords;
        }

        return tableRecords.filter((record) => selectedProgramIds.includes(record.programId));
    }, [tableRecords, selectedProgramIds]);

    const programExpenseRecordsCount = recordsState.length;
    const hasAnyProgramExpenseRecords = programExpenseRecordsCount > 0;
    const isInitialLoading = isLoading && programExpenseRecordsCount === 0 && programsState.length === 0;
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
        (
            recordId: number,
            recordData: {
                programId: number;
                amountUah: string;
                amountUsd: string;
            },
        ) => {
            setRecordsState((prev) =>
                prev.map((record) =>
                    record.id === recordId
                        ? {
                              ...record,
                              hippotherapyProgramCategoryId: recordData.programId,
                              amountUah: recordData.amountUah,
                              amountUsd: recordData.amountUsd,
                          }
                        : record,
                ),
            );

            if (!isTempId(recordId)) {
                const originalRecord = data.records.find((record) => record.id === recordId);

                const hasChanges =
                    originalRecord?.programId !== recordData.programId ||
                    originalRecord?.amountUah !== recordData.amountUah ||
                    originalRecord?.amountUsd !== recordData.amountUsd;

                setUpdatedRecordIds((prev) => {
                    if (hasChanges) {
                        return prev.includes(recordId) ? prev : [...prev, recordId];
                    }

                    return prev.filter((id) => id !== recordId);
                });
            }

            onDataChange?.();
            addToast(REPORTS_TEXT.MESSAGE.RECORD_UPDATED_SUCCESSFULLY, ToastType.Success);

            return true;
        },
        [addToast, data.records, onDataChange],
    );

    const handleSubmitAddProgramExpense = useCallback(
        async (submitData: {
            programId: number | undefined;
            programName: string;
            reportingYear: string;
            amountUah: string;
            amountUsd: string;
        }): Promise<boolean> => {
            try {
                let categoryId = submitData.programId;

                if (categoryId === undefined) {
                    const createdCategory = await ProgramsCategoriesApi.addProgramCategory(
                        { id: null, name: submitData.programName },
                        adminClient,
                    );
                    categoryId = createdCategory.id;

                    setProgramsState((prev) => [
                        ...prev,
                        {
                            id: createdCategory.id,
                            name: createdCategory.name,
                        },
                    ]);
                }

                const newRecord: ReportProgramExpendituresRecordState = {
                    id: getTempId(),
                    hippotherapyProgramCategoryId: categoryId,
                    reportingYear: submitData.reportingYear,
                    amountUah: submitData.amountUah,
                    amountUsd: submitData.amountUsd,
                };

                setRecordsState((prev) => [...prev, newRecord]);

                onDataChange?.();
                addToast(PROGRAM_EXPENSES_TEXT.MESSAGE.RECORD_CREATED_SUCCESSFULLY, ToastType.Success);
                setIsAddProgramExpenseModalOpen(false);

                return true;
            } catch {
                addToast(PROGRAM_EXPENSES_TEXT.MESSAGE.RECORD_CREATE_FAILED_RETRY, ToastType.Error);
                return false;
            }
        },
        [adminClient, addToast, onDataChange],
    );

    const handleDeleteClick = useCallback((record: ProgramExpensesRecord) => {
        setRecordToDelete(record);
        setIsDeleteModalOpen(true);
    }, []);

    const handleConfirmDelete = useCallback(async () => {
        if (!recordToDelete) return;

        setRecordsState((prev) => prev.filter((record) => record.id !== recordToDelete.id));

        if (!isTempId(recordToDelete.id)) {
            setDeletedRecordIds((prev) => (prev.includes(recordToDelete.id) ? prev : [...prev, recordToDelete.id]));
            setUpdatedRecordIds((prev) => prev.filter((id) => id !== recordToDelete.id));
        }

        onDataChange?.();
        addToast(PROGRAM_EXPENSES_TEXT.MESSAGE.RECORD_DELETED_SUCCESSFULLY, ToastType.Success);
        setIsDeleteModalOpen(false);
        setRecordToDelete(null);
    }, [recordToDelete, addToast, onDataChange]);

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

        setRecordsState((prev) => prev.filter((record) => !selectedRecordIds.includes(record.id)));

        handleLocalRecordsBulkDelete({
            selectedRecordIds,
            setSelectedRecordIds,
            setDeletedRecordIds,
            setUpdatedRecordIds,
            setIsBulkDeleteModalOpen,
            onDataChange,
        });

        addToast(PROGRAM_EXPENSES_TEXT.BULK.DELETE_SUCCESS, ToastType.Success);
    }, [selectedRecordIds, addToast, onDataChange]);

    const saveProgramExpenses = useCallback(async (): Promise<boolean> => {
        const recordsToCreate = recordsState.filter((record) => isTempId(record.id));
        const recordsToUpdate = recordsState.filter((record) => updatedRecordIds.includes(record.id));
        const hasRecordChanges =
            recordsToCreate.length > 0 || recordsToUpdate.length > 0 || deletedRecordIds.length > 0;

        if (!hasRecordChanges) {
            return true;
        }

        try {
            await ProgramExpensesApi.batchSaveRecords(adminClient, {
                recordsToCreate,
                recordsToUpdate,
                recordIdsToDelete: deletedRecordIds,
            });

            setUpdatedRecordIds([]);
            setDeletedRecordIds([]);

            try {
                await refetchReadOnlyData(true);
            } catch {}

            return true;
        } catch {
            addToast(REPORTS_TEXT.MESSAGE.FAIL_TO_UPDATE_REPORT, ToastType.Error);
            return false;
        }
    }, [addToast, adminClient, deletedRecordIds, recordsState, refetchReadOnlyData, updatedRecordIds]);

    useEffect(() => {
        registerSaveCallback?.(saveProgramExpenses);
    }, [registerSaveCallback, saveProgramExpenses]);

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
                    programs={programsState}
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
                    allRecords={tableRecords}
                    programs={programsState}
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
                programs={programsState}
                records={tableRecords}
                exchangeRate={currentExchangeRate}
                onClose={handleCloseAddProgramExpenseModal}
                onSubmit={handleSubmitAddProgramExpense}
            />

            <DeleteRecordModal
                isOpen={isDeleteModalOpen}
                title={PROGRAM_EXPENSES_TEXT.MODAL.DELETE.TITLE}
                confirmText={COMMON_TEXT_ADMIN.BUTTON.YES}
                cancelText={COMMON_TEXT_ADMIN.BUTTON.NO}
                onConfirm={handleConfirmDelete}
                onCancel={handleCancelDelete}
                onClose={handleCancelDelete}
            />

            <DeleteRecordModal
                isOpen={isBulkDeleteModalOpen}
                title={PROGRAM_EXPENSES_TEXT.BULK.DELETE_CONFIRM_TITLE}
                confirmText={COMMON_TEXT_ADMIN.BUTTON.YES}
                cancelText={COMMON_TEXT_ADMIN.BUTTON.NO}
                onConfirm={handleConfirmBulkDelete}
                onCancel={handleBulkDeleteCancel}
                onClose={handleBulkDeleteCancel}
            />
        </div>
    );
};
