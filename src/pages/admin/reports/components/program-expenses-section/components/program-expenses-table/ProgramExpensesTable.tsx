import { useEffect, useRef, useCallback } from 'react';
import { useTableScrollToTop } from '@/hooks/admin/use-table-scroll-to-top/useTableScrollToTop';
import { useTableRowAmountEdit } from '@/hooks/admin/use-table-row-amount-edit/useTableRowAmountEdit';
import { ProgramExpensesEmptyState } from '@/pages/admin/reports/components/program-expenses-section/components/program-expenses-empty-state/ProgramExpensesEmptyState';
import { FUNDS_EXPENDITURES_TEXT, PROGRAM_EXPENSES_TEXT } from '@/const/admin/reports';
import { ReactComponent as ArrowUpIcon } from '@/assets/icons/arrow-up.svg';
import {
    normalizeFundsExpendituresAmountInput,
    validateFundsExpendituresAmount,
} from '@/validation/admin/reports-schema/funds-expenditures-record-schema/funds-expenditures-record-schema';
import { ProgramExpensesRecord } from '@/types/admin/reports';
import { Button } from '@/components/admin/button/Button';
import cn from 'classnames';
import styles from './ProgramExpensesTable.module.scss';

export interface ProgramExpensesTableProps {
    records: ProgramExpensesRecord[];
    hasAnyProgramExpenseRecords: boolean;
    isEditing?: boolean;
    isAddProgramExpenseDisabled?: boolean;
    onAddProgramExpense?: () => void;
    onDeleteRecord?: (record: ProgramExpensesRecord) => void;
    selectedRecordIds?: number[];
    onToggleRecordSelection?: (id: number) => void;
    onSelectAllToggle?: (checked: boolean) => void;
    onOpenBulkDelete?: () => void;
    exchangeRate?: string | null;
    isRowActionsDisabled?: boolean;
    onRowEditModeChange?: (isEditMode: boolean) => void;
    onRecordSave?: (recordId: number, data: { amountUah: string; amountUsd: string }) => boolean | Promise<boolean>;
}

interface RowEditState {
    recordId: number;
    originalAmountUah: string;
    originalAmountUsd: string;
    amountUah: string;
    amountUsd: string;
    errors: {
        amountUah?: string;
        amountUsd?: string;
    };
    usdMismatchMessage?: string;
}

const READ_ONLY_TABLE_COLUMNS_COUNT = 5;
const EDITING_TABLE_COLUMNS_COUNT = 7;

const isAcceptButtonDisabled = (rowEditState: RowEditState | null): boolean => {
    if (!rowEditState) return true;

    const normalizedUah = normalizeFundsExpendituresAmountInput(rowEditState.amountUah, true);
    const normalizedUsd = normalizeFundsExpendituresAmountInput(rowEditState.amountUsd, true);
    const normalizedOriginalUah = normalizeFundsExpendituresAmountInput(rowEditState.originalAmountUah, true);
    const normalizedOriginalUsd = normalizeFundsExpendituresAmountInput(rowEditState.originalAmountUsd, true);

    const hasErrors = Boolean(rowEditState.errors.amountUah) || Boolean(rowEditState.errors.amountUsd);
    const amountsEmpty = normalizedUah === '' || normalizedUsd === '';
    const noChanges = normalizedUah === normalizedOriginalUah && normalizedUsd === normalizedOriginalUsd;

    return hasErrors || amountsEmpty || noChanges;
};

export const ProgramExpensesTable = ({
    records,
    hasAnyProgramExpenseRecords,
    isEditing = false,
    isAddProgramExpenseDisabled = false,
    onAddProgramExpense,
    onDeleteRecord,
    selectedRecordIds = [],
    onToggleRecordSelection,
    onSelectAllToggle,
    onOpenBulkDelete,
    exchangeRate,
    isRowActionsDisabled = false,
    onRowEditModeChange,
    onRecordSave,
}: ProgramExpensesTableProps) => {
    const headerCheckboxRef = useRef<HTMLInputElement>(null);
    const hasNoRecords = records.length === 0;
    const visibleRecordIds = records.map((record) => record.id);
    const selectedVisibleRecordIds = visibleRecordIds.filter((id) => selectedRecordIds.includes(id));
    const areAllVisibleRecordsSelected = records.length > 0 && selectedVisibleRecordIds.length === records.length;
    const hasSelectedVisibleRecords = selectedVisibleRecordIds.length > 0;
    const tableColumnsCount = isEditing ? EDITING_TABLE_COLUMNS_COUNT : READ_ONLY_TABLE_COLUMNS_COUNT;
    const { tableWrapperRef, isMoveToTopVisible, handleTableScroll, moveToTop } = useTableScrollToTop(records.length);
    const {
        rowEditState,
        setRowEditState,
        savingRecordId,
        setSavingRecordId,
        isAnyRowEditing,
        setRowEditMode,
        renderAmountEditRow,
    } = useTableRowAmountEdit<RowEditState>({
        isEditing,
        isRowActionsDisabled,
        exchangeRate,
        mismatchMessage: PROGRAM_EXPENSES_TEXT.MESSAGE.AMOUNT_USD_NOT_MATCH,
        isAcceptButtonDisabled,
        onRowEditModeChange,
    });

    const handleStartRowEdit = useCallback(
        (record: ProgramExpensesRecord) => {
            if (rowEditState || isRowActionsDisabled) return;

            setRowEditMode({
                recordId: record.id,
                originalAmountUah: record.amountUah,
                originalAmountUsd: record.amountUsd,
                amountUah: record.amountUah,
                amountUsd: record.amountUsd,
                errors: {},
                usdMismatchMessage: undefined,
            });
        },
        [isRowActionsDisabled, rowEditState, setRowEditMode],
    );

    const handleAcceptRowEdit = useCallback(
        async (record: ProgramExpensesRecord) => {
            if (rowEditState?.recordId !== record.id) {
                return;
            }

            if (savingRecordId !== null) {
                return;
            }

            const preparedAmountUah = rowEditState.amountUah.trim();
            const preparedAmountUsd = rowEditState.amountUsd.trim();
            const amountUahError = validateFundsExpendituresAmount(preparedAmountUah, 'save');
            const amountUsdError = validateFundsExpendituresAmount(preparedAmountUsd, 'save');
            const isAmountsUnchanged =
                normalizeFundsExpendituresAmountInput(rowEditState.originalAmountUah, true) ===
                    normalizeFundsExpendituresAmountInput(preparedAmountUah, true) &&
                normalizeFundsExpendituresAmountInput(rowEditState.originalAmountUsd, true) ===
                    normalizeFundsExpendituresAmountInput(preparedAmountUsd, true);

            if (amountUahError || amountUsdError || isAmountsUnchanged) {
                setRowEditState((prev) => {
                    if (prev?.recordId !== record.id) {
                        return prev;
                    }

                    return {
                        ...prev,
                        amountUah: preparedAmountUah,
                        amountUsd: preparedAmountUsd,
                        errors: {
                            ...prev.errors,
                            amountUah: amountUahError,
                            amountUsd: amountUsdError,
                        },
                    };
                });

                return;
            }

            setSavingRecordId(record.id);

            try {
                const isSaved = await onRecordSave?.(record.id, {
                    amountUah: preparedAmountUah,
                    amountUsd: preparedAmountUsd,
                });

                if (isSaved === false) {
                    return;
                }

                setRowEditMode(null);
            } finally {
                setSavingRecordId(null);
            }
        },
        [onRecordSave, rowEditState, savingRecordId, setRowEditMode, setRowEditState, setSavingRecordId],
    );

    useEffect(() => {
        if (!headerCheckboxRef.current) return;
        headerCheckboxRef.current.indeterminate = hasSelectedVisibleRecords && !areAllVisibleRecordsSelected;
    }, [areAllVisibleRecordsSelected, hasSelectedVisibleRecords]);

    return (
        <div className={styles['table-container']}>
            <div
                className={cn(styles['selection-row'], {
                    [styles['selection-row-hidden']]: selectedRecordIds.length === 0,
                })}
                aria-hidden={selectedRecordIds.length === 0}
            >
                <div className={styles['selection-pill']}>
                    {PROGRAM_EXPENSES_TEXT.BULK.getSelectedLabel(selectedRecordIds.length, records.length)}
                </div>
                <div className={styles['selection-actions']}>
                    <Button
                        buttonStyle="secondary"
                        className={styles['delete-selected-button']}
                        onClick={() => onOpenBulkDelete?.()}
                    >
                        {PROGRAM_EXPENSES_TEXT.BULK.DELETE_BUTTON}
                    </Button>
                </div>
            </div>

            <div
                ref={tableWrapperRef}
                className={styles['table-wrapper']}
                data-testid="program-expenses-table"
                data-record-count={records.length}
                onScroll={handleTableScroll}
            >
                <table className={styles.table}>
                    <colgroup>
                        {isEditing && <col className={styles['column-checkbox']} />}
                        <col className={styles['column-year']} />
                        <col className={styles['column-type']} />
                        <col className={styles['column-program']} />
                        <col className={styles['column-amount']} />
                        <col className={styles['column-amount']} />
                        {isEditing && <col className={styles['column-actions']} />}
                    </colgroup>
                    <thead>
                        <tr>
                            {isEditing && (
                                <th className={cn(styles.th, styles['checkbox-th'])}>
                                    <input
                                        ref={headerCheckboxRef}
                                        type="checkbox"
                                        className={styles['row-checkbox']}
                                        aria-label="Select all program expense records"
                                        checked={areAllVisibleRecordsSelected}
                                        onChange={(e) => onSelectAllToggle?.(e.target.checked)}
                                    />
                                </th>
                            )}
                            <th className={styles.th}>{FUNDS_EXPENDITURES_TEXT.TABLE.COLUMNS.REPORTING_YEAR}</th>
                            <th className={styles.th}>{FUNDS_EXPENDITURES_TEXT.TABLE.COLUMNS.TYPE}</th>
                            <th className={styles.th}>{PROGRAM_EXPENSES_TEXT.TABLE.COLUMNS.PROGRAM}</th>
                            <th className={styles.th}>{FUNDS_EXPENDITURES_TEXT.TABLE.COLUMNS.AMOUNT_UAH}</th>
                            <th className={styles.th}>{FUNDS_EXPENDITURES_TEXT.TABLE.COLUMNS.AMOUNT_USD}</th>
                            {isEditing && (
                                <th className={cn(styles.th, styles['actions-th'])}>
                                    {PROGRAM_EXPENSES_TEXT.TABLE.COLUMNS.ACTIONS}
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {hasNoRecords ? (
                            <ProgramExpensesEmptyState
                                colSpan={tableColumnsCount}
                                variant={hasAnyProgramExpenseRecords ? 'filtered' : 'program-expenses'}
                                isAddProgramExpenseDisabled={isAddProgramExpenseDisabled}
                                onAddProgramExpense={onAddProgramExpense}
                            />
                        ) : (
                            records.map((record) => (
                                <tr key={record.id} className={styles.tr}>
                                    {isEditing && (
                                        <td className={cn(styles.td, styles['checkbox-td'])}>
                                            <input
                                                type="checkbox"
                                                disabled={isAnyRowEditing}
                                                className={styles['row-checkbox']}
                                                aria-label={`Select record ${record.id}`}
                                                checked={selectedRecordIds.includes(record.id)}
                                                onChange={() => onToggleRecordSelection?.(record.id)}
                                            />
                                        </td>
                                    )}
                                    <td className={styles.td}>{record.reportingYear}</td>
                                    <td className={styles.td}>
                                        <span className={styles['type-chip']}>
                                            {PROGRAM_EXPENSES_TEXT.TABLE.TYPE_LABEL}
                                        </span>
                                    </td>
                                    <td className={styles.td}>{record.programName}</td>
                                    {renderAmountEditRow(
                                        record,
                                        () => handleAcceptRowEdit(record),
                                        () => handleStartRowEdit(record),
                                        () => onDeleteRecord?.(record),
                                    )}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            <button
                type="button"
                className={cn(styles['to-top-button'], {
                    [styles['to-top-button-visible']]: isMoveToTopVisible,
                })}
                data-testid="program-expenses-table-to-top"
                onClick={moveToTop}
                aria-label="Scroll table to top"
                aria-hidden={!isMoveToTopVisible}
                tabIndex={isMoveToTopVisible ? 0 : -1}
            >
                <ArrowUpIcon className={styles['to-top-icon']} />
            </button>
        </div>
    );
};
